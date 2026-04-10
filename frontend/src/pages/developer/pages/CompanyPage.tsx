import React, { useState, useEffect, useRef } from "react";
import { Building2, Edit, RotateCcw, Upload, Image as ImageIcon, Plus, X } from "lucide-react";
import { getCompany, updateCompany } from "@/api/company.api";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/components/ui/toast";
import PageLoader from "@/components/ui/PageLoader";
import CircularLoader from "@/components/ui/CircularLoader";
import { getCachedData, setCachedData, removeCachedData, CACHE_KEYS } from "@/utils/cache";
import { DEFAULT_AUTH_TAGLINE } from "@/utils/companyBrand";

const INITIAL_SOCIAL_POSTS = Array(8).fill(null).map((_, i) => ({ image: "", url: "", order: i }));

export default function CompanyPage() {
  const { updateTheme } = useTheme();
  const { success, error } = useToast();
  const [companyData, setCompanyData] = useState({
    company: "",
    slogan: "",
    authTagline: DEFAULT_AUTH_TAGLINE,
    email: "",
    phone: "",
    supportEmail: "",
    address: "",
    logo: "",
    favicon: "",
    copyright: "",
    description: "",
    socialLinks: {
      facebook: "",
      tiktok: "",
      instagram: "",
      youtube: "",
      linkedin: "",
      twitter: "",
      skype: "",
      other: "",
    },
    socialPosts: INITIAL_SOCIAL_POSTS,
    brandTheme: {
      primary: "#8C5934",
      accent: "",
      dark: "",
      light: "",
    },
  });

  const [originalData, setOriginalData] = useState(companyData);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [editingPostIndex, setEditingPostIndex] = useState<number | null>(null);
  const [postUrl, setPostUrl] = useState("");
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [socialPostFiles, setSocialPostFiles] = useState<Map<number, File>>(new Map());
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const socialPostInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const postUrlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cached = getCachedData<any>(CACHE_KEYS.COMPANY);
    if (cached && typeof cached === "object") {
      const normalized = {
        ...cached,
        authTagline: cached.authTagline ?? DEFAULT_AUTH_TAGLINE,
      };
      setCompanyData(normalized);
      setOriginalData(normalized);
    }
    const load = async () => {
      if (!cached) setInitialLoading(true);
      try {
        await loadCompanyData();
      } finally {
        setInitialLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update favicon and title when company data changes (favicon → logo → default)
  useEffect(() => {
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.getElementsByTagName("head")[0].appendChild(link);
    }

    const apiUrl = typeof import.meta.env.VITE_API_URL === "string" ? import.meta.env.VITE_API_URL : "";
    const toAbsolute = (path: string) =>
      path.startsWith("http")
        ? path
        : `${apiUrl.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;

    if (companyData.favicon && companyData.favicon.trim() !== "") {
      link.href = toAbsolute(companyData.favicon.trim());
      link.onerror = () => {
        link.href = "/logo-removebg-preview.png";
      };
    } else if (companyData.logo && companyData.logo.trim() !== "") {
      link.href = toAbsolute(companyData.logo.trim());
      link.onerror = () => {
        link.href = "/logo-removebg-preview.png";
      };
    } else {
      link.href = "/logo-removebg-preview.png";
    }

    if (companyData.company) {
      document.title = companyData.company || "Grace by Anu";
    }
  }, [companyData.favicon, companyData.logo, companyData.company]);

  const loadCompanyData = async () => {
    try {
      const data = await getCompany();
      console.log("Loaded company data:", data);
      console.log("Social posts from API:", data.socialPosts);
      
      // Ensure socialPosts have proper structure
      if (data.socialPosts && Array.isArray(data.socialPosts)) {
        // Filter out completely empty posts (posts with no image, no url, and empty strings)
        const validPosts = data.socialPosts
          .filter((post: any) => {
            if (!post) return false;
            const hasImage = post.image && post.image.trim() !== "";
            const hasUrl = post.url && post.url.trim() !== "";
            return hasImage || hasUrl;
          })
          .map((post: any, index: number) => ({
            ...post,
            url: post.url || "",
            image: post.image || "",
            order: post.order !== undefined ? post.order : index,
          }));
        
        // If no valid posts, start with empty array (not INITIAL_SOCIAL_POSTS)
        data.socialPosts = validPosts;
        console.log("Processed social posts (filtered empty):", data.socialPosts);
        console.log("Original count:", data.socialPosts.length, "Filtered count:", validPosts.length);
      } else {
        // If no socialPosts in data, start with empty array
        data.socialPosts = [];
      }

      data.socialLinks = {
        facebook: "",
        tiktok: "",
        instagram: "",
        youtube: "",
        linkedin: "",
        twitter: "",
        skype: "",
        other: "",
        ...(data.socialLinks || {}),
      };
      
      const loaded = { ...data, authTagline: data.authTagline ?? DEFAULT_AUTH_TAGLINE };
      setCompanyData(loaded);
      setOriginalData(loaded);
      setCachedData(CACHE_KEYS.COMPANY, loaded);
      // Initialize refs array to match the number of social posts
      if (data.socialPosts) {
        socialPostInputRefs.current = Array(data.socialPosts.length).fill(null);
      }
      if (data.brandTheme) {
        updateTheme(data.brandTheme);
      }
    } catch (error) {
      console.error("Failed to load company data:", error);
    }
  };

  const handleChange = (field: string, value: any) => {
  setCompanyData((prev) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");

      const parentValue = prev[parent as keyof typeof prev];

      return {
        ...prev,
        [parent]: {
          ...(typeof parentValue === "object" && parentValue !== null
            ? parentValue
            : {}),
          [child]: value,
        },
      };
    }

    return { ...prev, [field]: value };
  });
};


  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (logoInputRef.current) {
        logoInputRef.current.files = e.target.files;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        handleChange("logo", event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (faviconInputRef.current) {
        faviconInputRef.current.files = e.target.files;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        handleChange("favicon", event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const openPostEditor = (index: number) => {
    const post = companyData.socialPosts[index];
    setEditingPostIndex(index);
    setPostUrl(post?.url || "");
    setPostImageFile(null);
  };

  const closePostEditor = () => {
    setEditingPostIndex(null);
    setPostUrl("");
    setPostImageFile(null);
  };

  const handlePostUrlChange = async (url: string) => {
    setPostUrl(url);
    if (url && editingPostIndex !== null) {
      // Validate URL and try to load image
      try {
        const img = new Image();
        img.onload = () => {
          const newPosts = [...companyData.socialPosts];
          newPosts[editingPostIndex] = { ...newPosts[editingPostIndex], image: url, url: url };
          handleChange("socialPosts", newPosts);
        };
        img.onerror = () => {
          // URL might not be a direct image, but still save it
          const newPosts = [...companyData.socialPosts];
          newPosts[editingPostIndex] = { ...newPosts[editingPostIndex], url: url };
          handleChange("socialPosts", newPosts);
        };
        img.src = url;
      } catch (error) {
        console.error("Error loading image from URL:", error);
      }
    }
  };

  const handlePostFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingPostIndex !== null) {
      setPostImageFile(file);
      // Store the file for upload
      setSocialPostFiles(prev => new Map(prev).set(editingPostIndex, file));
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPosts = [...companyData.socialPosts];
        newPosts[editingPostIndex] = { 
          ...newPosts[editingPostIndex], 
          image: event.target?.result as string, // Keep base64 for preview
          url: newPosts[editingPostIndex].url || "" // Keep existing URL if any
        };
        handleChange("socialPosts", newPosts);
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (e.target) {
      e.target.value = "";
    }
  };

  const savePost = () => {
    if (editingPostIndex !== null) {
      const newPosts = [...companyData.socialPosts];
      newPosts[editingPostIndex] = { 
        ...newPosts[editingPostIndex], 
        url: postUrl || newPosts[editingPostIndex].url || ""
      };
      handleChange("socialPosts", newPosts);
      closePostEditor();
    }
  };

  const addSocialPost = () => {
    const newPosts = [...companyData.socialPosts, { image: "", url: "", order: companyData.socialPosts.length }];
    handleChange("socialPosts", newPosts);
    // Update refs array
    socialPostInputRefs.current = [...socialPostInputRefs.current, null];
  };

  const removeSocialPost = (index: number) => {
    console.log("Removing social post at index:", index);
    console.log("Current social posts:", companyData.socialPosts);
    const newPosts = companyData.socialPosts.filter((_, i) => i !== index);
    console.log("After filtering:", newPosts);
    // Reorder remaining posts
    const reorderedPosts = newPosts.map((post, i) => ({ ...post, order: i }));
    console.log("After reordering:", reorderedPosts);
    handleChange("socialPosts", reorderedPosts);
    // Update refs array
    socialPostInputRefs.current = socialPostInputRefs.current.filter((_, i) => i !== index);
    console.log("Social post removed, new count:", reorderedPosts.length);
  };

  const handlePrimaryColorChange = (color: string) => {
    const blendColor = (color1: string, color2: string, ratio: number) => {
      const hex1 = color1.replace('#', '');
      const hex2 = color2.replace('#', '');
      
      const r1 = parseInt(hex1.substr(0, 2), 16);
      const g1 = parseInt(hex1.substr(2, 2), 16);
      const b1 = parseInt(hex1.substr(4, 2), 16);
      
      const r2 = parseInt(hex2.substr(0, 2), 16);
      const g2 = parseInt(hex2.substr(2, 2), 16);
      const b2 = parseInt(hex2.substr(4, 2), 16);
      
      const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
      const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
      const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
      
      return `#${[r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('')}`;
    };

    const newTheme = {
      primary: color,
      dark: blendColor(color, "#000000", 0.5),
      light: blendColor(color, "#FFFFFF", 0.5),
      accent: blendColor(color, "#FFFFFF", 0.75),
    };

    handleChange("brandTheme", newTheme);
  };

  // Helper to convert base64 to File
  const base64ToFile = (base64String: string, filename: string): File | null => {
    try {
      // Check if it's a data URL
      if (!base64String.startsWith('data:')) {
        return null; // Already a URL, not base64
      }
      
      const arr = base64String.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (error) {
      console.error("Error converting base64 to file:", error);
      return null;
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      // Prepare social posts data and collect files
      const socialPostsData: any[] = [];
      const socialPostFilesToUpload: Map<number, File> = new Map();
      
      console.log("Preparing social posts for upload:", companyData.socialPosts);
      console.log("Stored social post files:", Array.from(socialPostFiles.entries()));
      
      // IMPORTANT: Only save posts that have content (image or url or file)
      // Empty posts will NOT be saved to database
      const postsToSave = companyData.socialPosts.filter((post: any, index: number) => {
        if (!post) return false;
        const hasImage = post.image && post.image.trim() !== "";
        const hasUrl = post.url && post.url.trim() !== "";
        const hasFile = socialPostFiles.has(index);
        const shouldSave = hasImage || hasUrl || hasFile;
        if (!shouldSave) {
          console.log(`Post ${index}: Skipping empty post (no image, no url, no file)`);
        }
        return shouldSave;
      });
      
      console.log("Posts to save (filtered empty):", {
        total: companyData.socialPosts.length,
        toSave: postsToSave.length,
        filtered: companyData.socialPosts.length - postsToSave.length
      });
      
      // Process only posts that have content
      postsToSave.forEach((post: any, newIndex: number) => {
        const originalIndex = companyData.socialPosts.indexOf(post);
        
        // Check if we have a stored file for this post
        const storedFile = socialPostFiles.get(originalIndex);
        if (storedFile) {
          console.log(`Post ${newIndex} (original ${originalIndex}): Using stored file`);
          socialPostFilesToUpload.set(newIndex, storedFile);
          socialPostsData.push({
            url: post.url || "",
            order: newIndex,
            image: "" // Will be set by backend after upload
          });
        } else if (post.image && post.image.startsWith('data:')) {
          console.log(`Post ${newIndex} (original ${originalIndex}): Converting base64 to file`);
          const file = base64ToFile(post.image, `social-post-${newIndex}.png`);
          if (file) {
            console.log(`Post ${newIndex}: Base64 converted to file successfully`);
            socialPostFilesToUpload.set(newIndex, file);
            socialPostsData.push({
              url: post.url || "",
              order: newIndex,
              image: "" // Will be set by backend after upload
            });
          } else {
            console.warn(`Post ${newIndex}: Base64 conversion failed, keeping original`);
            socialPostsData.push({
              url: post.url || "",
              order: newIndex,
              image: post.image
            });
          }
        } else {
          console.log(`Post ${newIndex} (original ${originalIndex}): Already a URL, keeping as is:`, post.image);
          // Save the URL (even if it's Facebook - backend will try to convert it)
          socialPostsData.push({
            url: post.url || "",
            order: newIndex,
            image: post.image || ""
          });
        }
      });
      
      console.log("Final social posts data to save (only non-empty):", socialPostsData);
      
      console.log("Social posts data to send:", socialPostsData);
      console.log("Social post files to upload:", Array.from(socialPostFilesToUpload.entries()).map(([idx, file]) => ({ index: idx, fileName: file.name, fileSize: file.size })));

      // Convert Map to array for serialization
      const socialPostFilesArray: Array<{ index: number; file: File }> = [];
      socialPostFilesToUpload.forEach((file, index) => {
        socialPostFilesArray.push({ index, file });
      });

      const formData: any = {
        ...companyData,
        description: companyData.description || "", // Ensure description is included
        logoFile: logoInputRef.current?.files?.[0],
        faviconFile: faviconInputRef.current?.files?.[0],
        socialPosts: socialPostsData,
        socialPostFiles: socialPostFilesArray
      };

      const updated = await updateCompany(formData);
      console.log("Company updated - Social Posts:", updated.socialPosts); // Debug log
      
      // Clear cache to ensure fresh data is loaded
      removeCachedData(CACHE_KEYS.COMPANY);
      
      // Ensure we use the updated data from backend (which should have Cloudinary URLs)
      // Backend processes URLs and converts them to Cloudinary, so use that data
      if (updated && updated.socialPosts) {
        console.log("Updated social posts from backend:", updated.socialPosts);
        // Ensure socialPosts have proper structure
        const processedSocialPosts = updated.socialPosts.map((post: any) => ({
          ...post,
          url: post.url || "",
          image: post.image || "",
          order: post.order || 0
        }));
        setCompanyData({ ...updated, socialPosts: processedSocialPosts });
        setOriginalData({ ...updated, socialPosts: processedSocialPosts });
      } else {
        // Fallback - use what we sent if backend doesn't return updated data
        setCompanyData({ ...companyData, socialPosts: socialPostsData });
        setOriginalData({ ...companyData, socialPosts: socialPostsData });
      }
      // Clear social post files after successful upload
      setSocialPostFiles(new Map());
      if (updated.brandTheme) {
        updateTheme(updated.brandTheme);
      }
      // Update favicon and title immediately after update
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      
      const apiUrl = typeof import.meta.env.VITE_API_URL === "string" ? import.meta.env.VITE_API_URL : "";
      const toAbs = (path: string) =>
        path.startsWith("http") ? path : `${apiUrl.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
      if (updated.favicon && updated.favicon.trim() !== "") {
        link.href = toAbs(updated.favicon.trim());
        link.onerror = () => {
          link.href = "/logo-removebg-preview.png";
        };
      } else if (updated.logo && updated.logo.trim() !== "") {
        link.href = toAbs(updated.logo.trim());
        link.onerror = () => {
          link.href = "/logo-removebg-preview.png";
        };
      } else {
        link.href = "/logo-removebg-preview.png";
      }
      if (updated.company) {
        document.title = updated.company || "Grace by Anu";
      }
      // Invalidate cache so site reflects changes immediately
      removeCachedData(CACHE_KEYS.COMPANY);
      console.log("Cache cleared. Please refresh the page to see updated social posts in footer.");
      success("Company settings updated successfully! Please refresh the page to see changes in footer.");
    } catch (err) {
      console.error("Failed to update company:", err);
      error("Failed to update company settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    setCompanyData(originalData);
    if (logoInputRef.current) logoInputRef.current.value = "";
    if (faviconInputRef.current) faviconInputRef.current.value = "";
  };

  if (initialLoading) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold theme-heading">Company</h1>
        <div className="flex gap-2">
          <button
            onClick={handleDiscard}
            className="flex text-black items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={18} />
            Discard
          </button>
          <button
            onClick={handleUpdate}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
            style={{
              backgroundColor: "var(--theme-primary)",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = "var(--theme-dark)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = "var(--theme-primary)";
              }
            }}
          >
            {isLoading && <CircularLoader size={16} color="white" />}
            <Edit size={18} />
            Update
          </button>
        </div>
      </div>

      {/* Company Info Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
          <Building2 className="w-5 h-5 theme-text-primary" />
          <h2 className="font-semibold theme-heading">Company Info</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            <div className="flex items-center gap-4">
              {companyData.logo ? (
                <img
                  src={companyData.logo}
                  alt="Logo"
                  className="w-24 h-24 object-contain border border-gray-200 rounded-lg"
                />
              ) : (
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Upload Logo
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  {companyData.company || "Company name will be used as logo name"}
                </p>
              </div>
            </div>
          </div>

          {/* Company Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                type="text"
                value={companyData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none"
                placeholder="Company name"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-primary)";
                  e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slogan
              </label>
              <input
                type="text"
                value={companyData.slogan}
                onChange={(e) => handleChange("slogan", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none"
                placeholder="Slogan"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-primary)";
                  e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auth pages tagline
              </label>
              <input
                type="text"
                value={companyData.authTagline ?? ""}
                onChange={(e) => handleChange("authTagline", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none"
                placeholder={DEFAULT_AUTH_TAGLINE}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-primary)";
                  e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Shown under the welcome line on Login and Access. Leave empty to hide this line.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={companyData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none"
                placeholder="Email"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-primary)";
                  e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={companyData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none"
                placeholder="Phone"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-primary)";
                  e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={companyData.supportEmail}
                onChange={(e) => handleChange("supportEmail", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none"
                placeholder="Support Email"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-primary)";
                  e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={companyData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none"
                placeholder="Address"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-primary)";
                  e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Description
              </label>
              <textarea
                value={companyData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none min-h-[100px]"
                placeholder="Company description (shown in blog detail page)"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-primary)";
                  e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
            </div>
          </div>
          
          {/* Copyright Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Copyright Text
            </label>
            <input
              type="text"
              value={companyData.copyright}
              onChange={(e) => handleChange("copyright", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none"
              placeholder="© 2026 Grace By Anu. All Rights Reserved."
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--theme-primary)";
                e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              This text will appear in the footer. If empty, default copyright will be shown.
            </p>
          </div>
        </div>
      </div>

      {/* Social Links Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">Social Links</h2>
        </div>
        <div className="p-6 grid grid-cols-3 gap-4">
          {Object.entries(companyData.socialLinks).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {key}
              </label>
              <input
                type="url"
                value={value}
                onChange={(e) => handleChange(`socialLinks.${key}`, e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none"
                placeholder={`${key} URL`}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-primary)";
                  e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Social Posts Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Social Posts</h2>
          <button
            onClick={addSocialPost}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-white rounded-lg transition-colors theme-button"
          >
            <Plus size={16} />
            Add Post
          </button>
        </div>
        <div className="p-6 grid grid-cols-4 md:grid-cols-8 gap-4">
          {companyData.socialPosts.map((post, index) => (
            <div key={index} className="relative group">
              <input
                ref={(el) => {
                  socialPostInputRefs.current[index] = el;
                }}
                type="file"
                accept="image/*"
                onChange={handlePostFileUpload}
                className="hidden"
              />
              <button
                onClick={() => openPostEditor(index)}
                className="w-full text-black aspect-square border-2 border-dashed border-gray-300 rounded-lg transition-colors flex items-center justify-center relative overflow-hidden"
                style={{
                  '--hover-border': 'var(--theme-primary)',
                } as any}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "";
                }}
              >
                {post.image ? (
                  <>
                    <img
                      src={post.image}
                      alt={`Post ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Edit className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </>
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </button>
              {companyData.socialPosts.length > 1 && (
                <button
                  onClick={() => removeSocialPost(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                  title="Remove post"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Social Post Editor Modal */}
        {editingPostIndex !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Social Post</h3>
                <button
                  onClick={closePostEditor}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* URL Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL/Link Address
                  </label>
                  <input
                    ref={postUrlInputRef}
                    type="url"
                    value={postUrl}
                    onChange={(e) => handlePostUrlChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none"
                    placeholder="https://example.com/image.jpg or https://instagram.com/p/..."
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--theme-primary)";
                      e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "";
                      e.currentTarget.style.boxShadow = "";
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter image URL or post link</p>
                </div>

                {/* Image Preview */}
                {companyData.socialPosts[editingPostIndex]?.image && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Preview
                    </label>
                    <img
                      src={companyData.socialPosts[editingPostIndex].image}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}

                {/* File Upload Option */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Upload Image
                  </label>
                  <button
                    onClick={() => socialPostInputRefs.current[editingPostIndex]?.click()}
                    className="w-full px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg transition-colors flex items-center justify-center gap-2 text-gray-700"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--theme-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "";
                    }}
                  >
                    <Upload size={18} />
                    Choose File
                  </button>
                  {postImageFile && (
                    <p className="text-xs text-gray-500 mt-1">{postImageFile.name}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={closePostEditor}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-black"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePost}
                    className="flex-1 px-4 py-2 text-white rounded-lg transition-colors theme-button"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Brand Theme Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">Brand Theme</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-4 gap-4">
            {["Primary", "Accent", "Dark", "Light"].map((label) => {
              const key = label.toLowerCase() as keyof typeof companyData.brandTheme;
              const color = companyData.brandTheme[key] || "";
              return (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        if (label === "Primary") {
                          handlePrimaryColorChange(e.target.value);
                        } else {
                          handleChange(`brandTheme.${key}`, e.target.value);
                        }
                      }}
                      className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => {
                        if (label === "Primary") {
                          handlePrimaryColorChange(e.target.value);
                        } else {
                          handleChange(`brandTheme.${key}`, e.target.value);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm font-mono"
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "var(--theme-primary)";
                        e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "";
                        e.currentTarget.style.boxShadow = "";
                      }}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
