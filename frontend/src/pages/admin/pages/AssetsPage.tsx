import React, { useState, useEffect } from "react";
import { RichTextEditor } from "@mantine/rte";
import { getBanners, updateBanner, type Banner, type BannerSlot } from "@/api/banner.api";
import {
  getBanners2,
  updateBanner2,
  type Banner2,
  type Banner2Slot,
  BANNER2_SLOT_SIZES,
} from "@/api/banner2.api";
import { removeCachedData, CACHE_KEYS } from "@/utils/cache";
import { getAllContent, updateContent, getContentByType, type ContentPage, type ContentType } from "@/api/content.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import FilterTabs from "@/components/ui/FilterTabs";
import ImageCropperModal from "@/components/admin/product/ImageCropperModal";

// Helper function to preserve alignment styles from RichTextEditor
const processAlignmentStyles = (html: string): string => {
  if (!html) return html;
  
  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Find all elements with Quill alignment classes
  const elements = tempDiv.querySelectorAll('[class*="ql-align"]');
  
  elements.forEach((el) => {
    const element = el as HTMLElement;
    const classes = element.className;
    
    // Determine alignment from class
    let alignment = '';
    if (classes.includes('ql-align-center')) {
      alignment = 'center';
    } else if (classes.includes('ql-align-right')) {
      alignment = 'right';
    } else if (classes.includes('ql-align-justify')) {
      alignment = 'justify';
    } else if (classes.includes('ql-align-left')) {
      alignment = 'left';
    }
    
    if (alignment) {
      // Get existing style attribute
      const existingStyle = element.getAttribute('style') || '';
      // Remove any existing text-align from style
      const cleanedStyle = existingStyle.replace(/text-align\s*:\s*[^;]+;?/gi, '').trim();
      // Add text-align to style
      const newStyle = cleanedStyle 
        ? `${cleanedStyle}; text-align: ${alignment};`
        : `text-align: ${alignment};`;
      element.setAttribute('style', newStyle);
      // Remove Quill alignment classes
      element.className = element.className
        .replace(/\s*ql-align-(center|right|justify|left)\s*/g, ' ')
        .trim();
    }
  });
  
  return tempDiv.innerHTML;
};

type TabType = "banners" | "banner2" | "privacy" | "terms" | "faq";

type BannerFormFields = {
  targetUrl: string;
  imageFile: File | null;
  imagePreview: string | null;
  /** When true, next save clears stored image on the server */
  clearImage?: boolean;
};

// Aspect ratios for Banner2 slots, matching how images are rendered on SecondLanding
const getBanner2Aspect = (slot: Banner2Slot | string): number => {
  switch (slot) {
    case "hero-bg":
      // Full-width hero background (HeroBannerFull) – 21:9
      return 21 / 9;
    case "hero-right":
      // Right-side hero card image – square
      return 1;
    case "cta-bg":
      // Call To Action full-width background – 16:9 works well
      return 16 / 9;
    case "hero-business":
      // HeroBannerBusiness image – 16:9 container
      return 16 / 9;
    case "unlock-image":
      // UnlockPotentialSection image – 16:9 container
      return 16 / 9;
    case "feature-1":
    case "feature-2":
    case "text-image":
      // FeaturesDetailsSection and TextImageSection – 3:2 image cards
      return 3 / 2;
    case "detail-hero":
      // DetailWithLeftSidebar hero image – 16:9
      return 16 / 9;
    case "about-1":
    case "about-2":
    case "about-3":
    case "about-4":
      // PortfolioDetailSection image gallery – 1:1
      return 1;
    case "team-1":
    case "team-2":
    case "team-3":
    case "team-4":
      // TeamCard portrait area – 1:1
      return 1;
    default:
      // Sensible default for any future slots
      return 16 / 9;
  }
};

export default function AssetsPage() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("banners");
  
  // Edit mode states
  const [editingBannerSlot, setEditingBannerSlot] = useState<BannerSlot | null>(null);
  const [isEditingPrivacy, setIsEditingPrivacy] = useState(false);
  const [isEditingTerms, setIsEditingTerms] = useState(false);
  const [isEditingFAQ, setIsEditingFAQ] = useState(false);
  
  // Banners state
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [bannerFormData, setBannerFormData] = useState<Record<BannerSlot, BannerFormFields>>({
    "hero-main": { targetUrl: "", imageFile: null, imagePreview: null },
    "hero-secondary": { targetUrl: "", imageFile: null, imagePreview: null },
    "hero-tertiary": { targetUrl: "", imageFile: null, imagePreview: null },
    "hero-last": { targetUrl: "", imageFile: null, imagePreview: null },
    "shop-main": { targetUrl: "", imageFile: null, imagePreview: null },
  });
  const [bannerOriginalData, setBannerOriginalData] = useState<Record<BannerSlot, BannerFormFields>>({
    "hero-main": { targetUrl: "", imageFile: null, imagePreview: null },
    "hero-secondary": { targetUrl: "", imageFile: null, imagePreview: null },
    "hero-tertiary": { targetUrl: "", imageFile: null, imagePreview: null },
    "hero-last": { targetUrl: "", imageFile: null, imagePreview: null },
    "shop-main": { targetUrl: "", imageFile: null, imagePreview: null },
  });
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [currentBannerSlot, setCurrentBannerSlot] = useState<BannerSlot | null>(null);
  const [currentImageFile, setCurrentImageFile] = useState<File | null>(null);

  // Banner 2 state (second landing page images)
  const [banners2, setBanners2] = useState<Banner2[]>([]);
  const [banner2Loading, setBanner2Loading] = useState(false);
  const [banner2FormData, setBanner2FormData] = useState<Record<string, BannerFormFields>>({});
  const [banner2OriginalData, setBanner2OriginalData] = useState<Record<string, BannerFormFields>>({});
  const [editingBanner2Slot, setEditingBanner2Slot] = useState<Banner2Slot | string | null>(null);
  const [showBanner2Cropper, setShowBanner2Cropper] = useState(false);
  const [currentBanner2Slot, setCurrentBanner2Slot] = useState<Banner2Slot | string | null>(null);
  const [currentBanner2File, setCurrentBanner2File] = useState<File | null>(null);
  
  // Content state - original and working copies
  const [privacyContent, setPrivacyContent] = useState<ContentPage | null>(null);
  const [privacyContentOriginal, setPrivacyContentOriginal] = useState<ContentPage | null>(null);
  
  const [termsContent, setTermsContent] = useState<ContentPage | null>(null);
  const [termsContentOriginal, setTermsContentOriginal] = useState<ContentPage | null>(null);
  
  const [faqContent, setFaqContent] = useState<ContentPage | null>(null);
  const [faqContentOriginal, setFaqContentOriginal] = useState<ContentPage | null>(null);
  
  const [contentLoading, setContentLoading] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
  
  // FAQ state
  const [newFAQ, setNewFAQ] = useState({ question: "", answer: "" });
  const [editingFAQIndex, setEditingFAQIndex] = useState<number | null>(null);

  // Load banners
  useEffect(() => {
    if (activeTab === "banners") {
      loadBanners();
    }
  }, [activeTab]);

  // Load Banner 2
  useEffect(() => {
    if (activeTab === "banner2") {
      loadBanners2();
    }
  }, [activeTab]);

  // Load content
  useEffect(() => {
    if (activeTab === "privacy" || activeTab === "terms" || activeTab === "faq") {
      loadContent();
    }
  }, [activeTab]);

  const loadBanners = async () => {
    setBannerLoading(true);
    try {
      const data = await getBanners();
      setBanners(data);
      // Initialize form data with existing banners
      const initialData: Record<BannerSlot, BannerFormFields> = {
        "hero-main": { targetUrl: "", imageFile: null, imagePreview: null },
        "hero-secondary": { targetUrl: "", imageFile: null, imagePreview: null },
        "hero-tertiary": { targetUrl: "", imageFile: null, imagePreview: null },
        "hero-last": { targetUrl: "", imageFile: null, imagePreview: null },
        "shop-main": { targetUrl: "", imageFile: null, imagePreview: null },
      };
      data.forEach((banner) => {
        if (banner.slot in initialData) {
          initialData[banner.slot as BannerSlot] = {
            targetUrl: banner.targetUrl || "",
            imageFile: null,
            imagePreview: banner.imageUrl,
            clearImage: false,
          };
        }
      });
      setBannerFormData(initialData);
      setBannerOriginalData(JSON.parse(JSON.stringify(initialData)));
    } catch (err) {
      console.error("Failed to load banners:", err);
      error("Failed to load banners");
    } finally {
      setBannerLoading(false);
    }
  };

  const loadContent = async () => {
    setContentLoading(true);
    try {
      if (activeTab === "privacy") {
        const data = await getContentByType("privacy");
        setPrivacyContent(data);
        setPrivacyContentOriginal(JSON.parse(JSON.stringify(data)));
      } else if (activeTab === "terms") {
        const data = await getContentByType("terms");
        setTermsContent(data);
        setTermsContentOriginal(JSON.parse(JSON.stringify(data)));
      } else if (activeTab === "faq") {
        const data = await getContentByType("faqs");
        setFaqContent(data);
        setFaqContentOriginal(JSON.parse(JSON.stringify(data)));
      }
    } catch (err) {
      console.error("Failed to load content:", err);
      error("Failed to load content");
    } finally {
      setContentLoading(false);
    }
  };

  const handleBannerImageSelect = (file: File, slot: BannerSlot) => {
    setCurrentBannerSlot(slot);
    setCurrentImageFile(file);
    setShowImageCropper(true);
  };

  const handleImageCrop = (croppedFile: File) => {
    if (!currentBannerSlot) return;
    const preview = URL.createObjectURL(croppedFile);
    setBannerFormData({
      ...bannerFormData,
      [currentBannerSlot]: {
        ...bannerFormData[currentBannerSlot],
        imageFile: croppedFile,
        imagePreview: preview,
        clearImage: false,
      },
    });
    setShowImageCropper(false);
    setCurrentBannerSlot(null);
  };

  const startEditBanner = (slot: BannerSlot) => {
    const banner = banners.find((b) => b.slot === slot);
    setBannerFormData({
      ...bannerFormData,
      [slot]: {
        targetUrl: banner?.targetUrl || "",
        imageFile: null,
        imagePreview: banner?.imageUrl || null,
        clearImage: false,
      },
    });
    setBannerOriginalData({
      ...bannerOriginalData,
      [slot]: {
        targetUrl: banner?.targetUrl || "",
        imageFile: null,
        imagePreview: banner?.imageUrl || null,
        clearImage: false,
      },
    });
    setEditingBannerSlot(slot);
  };

  const discardBanner = (slot: BannerSlot) => {
    setBannerFormData({
      ...bannerFormData,
      [slot]: { ...bannerOriginalData[slot] },
    });
    setEditingBannerSlot(null);
  };

  const saveBanner = async (slot: BannerSlot) => {
    try {
      await updateBanner(slot, {
        targetUrl: bannerFormData[slot].targetUrl,
        file: bannerFormData[slot].imageFile,
        clearImage: bannerFormData[slot].clearImage === true,
      });
      success("Banner updated successfully!");
      setEditingBannerSlot(null);
      setBannerFormData({
        ...bannerFormData,
        [slot]: {
          ...bannerFormData[slot],
          imageFile: null,
          clearImage: false,
        },
      });
      loadBanners();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to update banner");
    }
  };

  const startEditPrivacy = () => {
    setIsEditingPrivacy(true);
  };

  const discardPrivacy = () => {
    if (privacyContentOriginal) {
      setPrivacyContent(JSON.parse(JSON.stringify(privacyContentOriginal)));
    }
    setIsEditingPrivacy(false);
  };

  const updatePrivacy = async () => {
    if (!privacyContent) return;
    setSavingContent(true);
    try {
      // Process alignment styles one more time before saving
      const description = processAlignmentStyles(privacyContent.description);
      
      await updateContent("privacy", {
        title: privacyContent.title,
        subTitle: privacyContent.subTitle,
        description: description,
      });
      success("Privacy Policy updated successfully!");
      setIsEditingPrivacy(false);
      loadContent();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to update privacy policy");
    } finally {
      setSavingContent(false);
    }
  };

  const startEditTerms = () => {
    setIsEditingTerms(true);
  };

  const discardTerms = () => {
    if (termsContentOriginal) {
      setTermsContent(JSON.parse(JSON.stringify(termsContentOriginal)));
    }
    setIsEditingTerms(false);
  };

  const updateTerms = async () => {
    if (!termsContent) return;
    setSavingContent(true);
    try {
      // Process alignment styles one more time before saving
      const description = processAlignmentStyles(termsContent.description);
      
      await updateContent("terms", {
        title: termsContent.title,
        subTitle: termsContent.subTitle,
        description: description,
      });
      success("Terms & Conditions updated successfully!");
      setIsEditingTerms(false);
      loadContent();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to update terms & conditions");
    } finally {
      setSavingContent(false);
    }
  };

  const startEditFAQ = () => {
    setIsEditingFAQ(true);
  };

  const discardFAQ = () => {
    if (faqContentOriginal) {
      setFaqContent(JSON.parse(JSON.stringify(faqContentOriginal)));
    }
    setNewFAQ({ question: "", answer: "" });
    setEditingFAQIndex(null);
    setIsEditingFAQ(false);
  };

  const updateFAQ = async () => {
    if (!faqContent) return;
    setSavingContent(true);
    try {
      // Process alignment styles in FAQ answers before saving
      const faqs = (faqContent.faqs || []).map(faq => ({
        ...faq,
        answer: processAlignmentStyles(faq.answer)
      }));
      
      await updateContent("faqs", {
        title: faqContent.title,
        subTitle: faqContent.subTitle,
        description: faqContent.description,
        faqs: faqs,
      });
      success("FAQ updated successfully!");
      setIsEditingFAQ(false);
      setNewFAQ({ question: "", answer: "" });
      setEditingFAQIndex(null);
      loadContent();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to update FAQ");
    } finally {
      setSavingContent(false);
    }
  };

  const addFAQ = () => {
    if (!newFAQ.question || !newFAQ.answer) {
      error("Please fill in both question and answer");
      return;
    }
    
    if (!faqContent) return;
    
    const updatedFAQs = [...(faqContent.faqs || []), newFAQ];
    setFaqContent({ ...faqContent, faqs: updatedFAQs });
    setNewFAQ({ question: "", answer: "" });
  };

  const updateFAQItem = (index: number) => {
    if (!faqContent) return;
    
    const updatedFAQs = [...(faqContent.faqs || [])];
    updatedFAQs[index] = newFAQ;
    setFaqContent({ ...faqContent, faqs: updatedFAQs });
    setEditingFAQIndex(null);
    setNewFAQ({ question: "", answer: "" });
  };

  const deleteFAQ = (index: number) => {
    if (!faqContent) return;
    
    const updatedFAQs = faqContent.faqs?.filter((_, i) => i !== index) || [];
    setFaqContent({ ...faqContent, faqs: updatedFAQs });
  };

  const startEditFAQItem = (index: number) => {
    if (!faqContent?.faqs) return;
    setNewFAQ(faqContent.faqs[index]);
    setEditingFAQIndex(index);
  };

  const bannerSlots: { slot: BannerSlot; label: string }[] = [
    { slot: "hero-main", label: "Hero Main" },
    { slot: "hero-secondary", label: "Hero Secondary" },
    { slot: "hero-tertiary", label: "Hero Tertiary" },
    { slot: "hero-last", label: "Hero Last (Above Feedback)" },
    { slot: "shop-main", label: "Shop Main" },
  ];

  const banner2Slots = Object.keys(BANNER2_SLOT_SIZES).map((slot) => ({
    slot: slot as Banner2Slot,
    label: slot.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    recommendedSize: BANNER2_SLOT_SIZES[slot],
  }));

  const loadBanners2 = async () => {
    setBanner2Loading(true);
    try {
      const data = await getBanners2();
      setBanners2(data);
      const slots = Object.keys(BANNER2_SLOT_SIZES);
      const initial: Record<string, BannerFormFields> = {};
      slots.forEach((slot) => {
        initial[slot] = { targetUrl: "", imageFile: null, imagePreview: null, clearImage: false };
      });
      data.forEach((b) => {
        if (b.slot in initial) {
          initial[b.slot] = {
            targetUrl: b.targetUrl || "",
            imageFile: null,
            imagePreview: b.imageUrl,
            clearImage: false,
          };
        }
      });
      setBanner2FormData(initial);
      setBanner2OriginalData(JSON.parse(JSON.stringify(initial)));
    } catch (err) {
      console.error("Failed to load Banner 2:", err);
      error("Failed to load second landing images");
    } finally {
      setBanner2Loading(false);
    }
  };

  const handleBanner2ImageSelect = (file: File, slot: Banner2Slot | string) => {
    setCurrentBanner2Slot(slot);
    setCurrentBanner2File(file);
    setShowBanner2Cropper(true);
  };

  const handleBanner2Crop = (croppedFile: File) => {
    if (!currentBanner2Slot) return;
    const preview = URL.createObjectURL(croppedFile);
    setBanner2FormData({
      ...banner2FormData,
      [currentBanner2Slot]: {
        ...banner2FormData[currentBanner2Slot],
        imageFile: croppedFile,
        imagePreview: preview,
        clearImage: false,
      },
    });
    setShowBanner2Cropper(false);
    setCurrentBanner2Slot(null);
    setCurrentBanner2File(null);
  };

  const startEditBanner2 = (slot: Banner2Slot | string) => {
    const banner = banners2.find((b) => b.slot === slot);
    setBanner2FormData({
      ...banner2FormData,
      [slot]: {
        targetUrl: banner?.targetUrl || "",
        imageFile: null,
        imagePreview: banner?.imageUrl || null,
        clearImage: false,
      },
    });
    setBanner2OriginalData({
      ...banner2OriginalData,
      [slot]: {
        targetUrl: banner?.targetUrl || "",
        imageFile: null,
        imagePreview: banner?.imageUrl || null,
        clearImage: false,
      },
    });
    setEditingBanner2Slot(slot);
  };

  const discardBanner2 = (slot: Banner2Slot | string) => {
    setBanner2FormData({
      ...banner2FormData,
      [slot]: { ...banner2OriginalData[slot] },
    });
    setEditingBanner2Slot(null);
  };

  const saveBanner2 = async (slot: Banner2Slot | string) => {
    try {
      await updateBanner2(slot, {
        targetUrl: banner2FormData[slot].targetUrl,
        file: banner2FormData[slot].imageFile,
        clearImage: banner2FormData[slot].clearImage === true,
      });
      removeCachedData(CACHE_KEYS.BANNERS2);
      success("Image updated successfully!");
      setEditingBanner2Slot(null);
      setBanner2FormData({
        ...banner2FormData,
        [slot]: { ...banner2FormData[slot], imageFile: null, clearImage: false },
      });
      loadBanners2();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to update image");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not updated";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        {/* Tabs */}
        <div className="flex gap-4 items-center flex-wrap">
          <h1 className="text-2xl font-semibold theme-heading">Assets</h1>
          <FilterTabs
            tabs={[
              { id: "banners", label: "Banners" },
              { id: "banner2", label: "Banner 2" },
              { id: "privacy", label: "Privacy Policy" },
              { id: "terms", label: "Terms & Conditions" },
              { id: "faq", label: "FAQ" },
            ]}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as any)}
          />
        </div>
      </div>

      {/* Content */}

      {/* Banners Tab */}
      {activeTab === "banners" && (
        <div className="space-y-6">
          {bannerLoading ? (
            <p>Loading banners...</p>
          ) : (
            bannerSlots.map(({ slot, label }) => {
              const banner = banners.find((b) => b.slot === slot);
              const isEditing = editingBannerSlot === slot;
              const formData = bannerFormData[slot];
              const imageUrl = formData.imagePreview || banner?.imageUrl;

              return (
                <div key={slot} className="bg-white p-6 rounded-lg border border-gray-200 relative">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{label}</h3>
                    {!isEditing && (
                      <Button
                        onClick={() => startEditBanner(slot)}
                        className="theme-button text-white"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  
                  {!isEditing ? (
                    <div className="space-y-4">
                      {imageUrl && (
                        <div>
                          {banner?.targetUrl ? (
                            <a
                              href={banner.targetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block cursor-pointer"
                            >
                              <img
                                src={imageUrl}
                                alt={label}
                                className="w-full h-64 object-cover rounded border hover:opacity-90 transition-opacity"
                              />
                            </a>
                          ) : (
                            <img
                              src={imageUrl}
                              alt={label}
                              className="w-full h-64 object-cover rounded border"
                            />
                          )}
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">
                          <strong>Target URL:</strong> {banner?.targetUrl || "Not set"}
                        </p>
                      </div>
                      {banner?.updatedAt && (
                        <div className="text-right">
                          <span className="text-sm text-gray-500">
                            Updated: {formatDate(banner.updatedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Banner Image</label>
                        {formData.imagePreview ? (
                          <div className="relative">
                            <img
                              src={formData.imagePreview}
                              alt="Preview"
                              className="w-full h-64 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setBannerFormData({
                                  ...bannerFormData,
                                  [slot]: {
                                    ...formData,
                                    imagePreview: null,
                                    imageFile: null,
                                    clearImage: true,
                                  },
                                });
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleBannerImageSelect(e.target.files[0], slot);
                                }
                              }}
                              className="block"
                            />
                            {banner?.imageUrl && (
                              <p className="text-sm text-gray-500 mt-2">
                                Current image will be kept if no new image is uploaded
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Target URL</label>
                        <Input
                          value={formData.targetUrl}
                          onChange={(e) =>
                            setBannerFormData({
                              ...bannerFormData,
                              [slot]: {
                                ...formData,
                                targetUrl: e.target.value,
                              },
                            })
                          }
                          placeholder="https://example.com"
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => saveBanner(slot)}
                          className="theme-button text-white"
                        >
                          Update
                        </Button>
                        <Button
                          onClick={() => discardBanner(slot)}
                          variant="outline"
                        >
                          Discard
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Banner 2 Tab – Second Landing page images */}
      {activeTab === "banner2" && (
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Manage images used on the <strong>Second Landing</strong> page. Recommended sizes are shown so you can upload the exact dimensions.
          </p>
          {banner2Loading ? (
            <p>Loading...</p>
          ) : (
            banner2Slots.map(({ slot, label, recommendedSize }) => {
              const banner = banners2.find((b) => b.slot === slot);
              const isEditing = editingBanner2Slot === slot;
              const formData = banner2FormData[slot] || {
                targetUrl: "",
                imageFile: null,
                imagePreview: null,
                clearImage: false,
              };
              const imageUrl = formData.imagePreview || banner?.imageUrl;
              const aspect = getBanner2Aspect(slot);

              return (
                <div key={slot} className="bg-white p-6 rounded-lg border border-gray-200 relative">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{label}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        <strong>Recommended size:</strong> {recommendedSize}
                      </p>
                    </div>
                    {!isEditing && (
                      <Button
                        onClick={() => startEditBanner2(slot)}
                        className="theme-button text-white"
                      >
                        Edit
                      </Button>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="space-y-4">
                      {imageUrl && (
                        <div>
                          <div
                            className="w-full max-w-md overflow-hidden rounded border"
                            style={{ aspectRatio: aspect }}
                          >
                            {banner?.targetUrl ? (
                              <a
                                href={banner.targetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full h-full cursor-pointer"
                              >
                                <img
                                  src={imageUrl}
                                  alt={label}
                                  className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                                />
                              </a>
                            ) : (
                              <img
                                src={imageUrl}
                                alt={label}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">
                          <strong>Target URL:</strong> {banner?.targetUrl || "Not set"}
                        </p>
                      </div>
                      {banner?.updatedAt && (
                        <div className="text-right">
                          <span className="text-sm text-gray-500">
                            Updated: {formatDate(banner.updatedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Image (recommended: {recommendedSize})</label>
                        {formData.imagePreview ? (
                          <div className="relative">
                            <div
                              className="w-full max-w-md overflow-hidden rounded border"
                              style={{ aspectRatio: aspect }}
                            >
                              <img
                                src={formData.imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setBanner2FormData((prev) => ({
                                  ...prev,
                                  [slot]: {
                                    ...prev[slot],
                                    imagePreview: null,
                                    imageFile: null,
                                    clearImage: true,
                                  },
                                }));
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleBanner2ImageSelect(e.target.files[0], slot);
                                }
                              }}
                              className="block"
                            />
                            {banner?.imageUrl && (
                              <p className="text-sm text-gray-500 mt-2">
                                Current image will be kept if no new image is uploaded
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Target URL</label>
                        <Input
                          value={formData.targetUrl}
                          onChange={(e) =>
                            setBanner2FormData({
                              ...banner2FormData,
                              [slot]: { ...formData, targetUrl: e.target.value },
                            })
                          }
                          placeholder="https://example.com"
                          className="w-full"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => saveBanner2(slot)}
                          className="theme-button text-white"
                        >
                          Update
                        </Button>
                        <Button onClick={() => discardBanner2(slot)} variant="outline">
                          Discard
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Privacy Policy Tab */}
      {activeTab === "privacy" && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 relative">
          {contentLoading ? (
            <p>Loading...</p>
          ) : privacyContent ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Privacy Policy</h2>
                {!isEditingPrivacy && (
                  <Button
                    onClick={startEditPrivacy}
                    className="theme-button text-white"
                  >
                    Edit
                  </Button>
                )}
              </div>

              {!isEditingPrivacy ? (
                <div className="space-y-4 pb-8">
                  <div>
                    <h3 className="font-semibold">{privacyContent.title}</h3>
                    <p className="text-gray-600">{privacyContent.subTitle}</p>
                  </div>
                  <div
                    dangerouslySetInnerHTML={{ __html: privacyContent.description }}
                    className="prose max-w-none content-area"
                  />
                  {privacyContent.lastUpdated && (
                    <div className="text-right absolute bottom-4 right-6">
                      <span className="text-sm text-gray-500">
                        Updated: {formatDate(privacyContent.lastUpdated)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      value={privacyContent.title}
                      onChange={(e) =>
                        setPrivacyContent({ ...privacyContent, title: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Subtitle</label>
                    <Input
                      value={privacyContent.subTitle}
                      onChange={(e) =>
                        setPrivacyContent({ ...privacyContent, subTitle: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <RichTextEditor
                      value={privacyContent.description}
                      onChange={(value) => {
                        // Process HTML to ensure alignment styles are preserved
                        const processedValue = processAlignmentStyles(value);
                        setPrivacyContent({ ...privacyContent, description: processedValue });
                      }}
                      className="w-full bg-white text-gray-900"
                      controls={[
                        ['bold', 'italic', 'underline', 'strike'],
                        ['h1', 'h2', 'h3'],
                        ['unorderedList', 'orderedList'],
                        ['link', 'image', 'video'],
                        ['alignLeft', 'alignCenter', 'alignRight'],
                        ['blockquote', 'code'],
                        ['sup', 'sub'],
                        ['clean'],
                      ]}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={updatePrivacy}
                      className="theme-button text-white"
                      disabled={savingContent}
                    >
                      {savingContent ? "Updating..." : "Update"}
                    </Button>
                    <Button
                      onClick={discardPrivacy}
                      variant="outline"
                      disabled={savingContent}
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      )}

      {/* Terms & Conditions Tab */}
      {activeTab === "terms" && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 relative">
          {contentLoading ? (
            <p>Loading...</p>
          ) : termsContent ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Terms & Conditions</h2>
                {!isEditingTerms && (
                  <Button
                    onClick={startEditTerms}
                    className="theme-button text-white"
                  >
                    Edit
                  </Button>
                )}
              </div>

              {!isEditingTerms ? (
                <div className="space-y-4 pb-8">
                  <div>
                    <h3 className="font-semibold">{termsContent.title}</h3>
                    <p className="text-gray-600">{termsContent.subTitle}</p>
                  </div>
                  <div
                    dangerouslySetInnerHTML={{ __html: termsContent.description }}
                    className="prose max-w-none content-area"
                  />
                  {termsContent.lastUpdated && (
                    <div className="text-right absolute bottom-4 right-6">
                      <span className="text-sm text-gray-500">
                        Updated: {formatDate(termsContent.lastUpdated)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      value={termsContent.title}
                      onChange={(e) =>
                        setTermsContent({ ...termsContent, title: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Subtitle</label>
                    <Input
                      value={termsContent.subTitle}
                      onChange={(e) =>
                        setTermsContent({ ...termsContent, subTitle: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <RichTextEditor
                      value={termsContent.description}
                      onChange={(value) => {
                        // Process HTML to ensure alignment styles are preserved
                        const processedValue = processAlignmentStyles(value);
                        setTermsContent({ ...termsContent, description: processedValue });
                      }}
                      className="w-full bg-white text-gray-900"
                      controls={[
                        ['bold', 'italic', 'underline', 'strike'],
                        ['h1', 'h2', 'h3'],
                        ['unorderedList', 'orderedList'],
                        ['link', 'image', 'video'],
                        ['alignLeft', 'alignCenter', 'alignRight'],
                        ['blockquote', 'code'],
                        ['sup', 'sub'],
                        ['clean'],
                      ]}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={updateTerms}
                      className="theme-button text-white"
                      disabled={savingContent}
                    >
                      {savingContent ? "Updating..." : "Update"}
                    </Button>
                    <Button
                      onClick={discardTerms}
                      variant="outline"
                      disabled={savingContent}
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 relative">
          {contentLoading ? (
            <p>Loading...</p>
          ) : faqContent ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">FAQ</h2>
                {!isEditingFAQ && (
                  <Button
                    onClick={startEditFAQ}
                    className="theme-button text-white"
                  >
                    Edit
                  </Button>
                )}
              </div>

              {!isEditingFAQ ? (
                <div className="space-y-4 pb-8">
                  <div>
                    <h3 className="font-semibold">{faqContent.title}</h3>
                    <p className="text-gray-600">{faqContent.subTitle}</p>
                  </div>

                  {/* FAQs List */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-4">FAQs ({faqContent.faqs?.length || 0})</h3>
                    <div className="space-y-4">
                      {faqContent.faqs && faqContent.faqs.length > 0 ? (
                        faqContent.faqs.map((faq, index) => (
                          <div
                            key={index}
                            className="p-4 border border-gray-200 rounded-lg"
                          >
                            <h4 className="font-medium mb-2">{faq.question}</h4>
                            <div
                              dangerouslySetInnerHTML={{ __html: faq.answer }}
                              className="text-sm text-gray-600"
                            />
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No FAQs added yet.</p>
                      )}
                    </div>
                  </div>

                  {faqContent.lastUpdated && (
                    <div className="text-right absolute bottom-4 right-6">
                      <span className="text-sm text-gray-500">
                        Updated: {formatDate(faqContent.lastUpdated)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      value={faqContent.title}
                      onChange={(e) =>
                        setFaqContent({ ...faqContent, title: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Subtitle</label>
                    <Input
                      value={faqContent.subTitle}
                      onChange={(e) =>
                        setFaqContent({ ...faqContent, subTitle: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Add/Edit FAQ Form */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-4">
                      {editingFAQIndex !== null ? "Edit FAQ" : "Add New FAQ"}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Question</label>
                        <Input
                          value={newFAQ.question}
                          onChange={(e) =>
                            setNewFAQ({ ...newFAQ, question: e.target.value })
                          }
                          placeholder="Enter question"
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Answer</label>
                        <RichTextEditor
                          value={newFAQ.answer}
                          onChange={(value) => {
                            // Process HTML to ensure alignment styles are preserved
                            const processedValue = processAlignmentStyles(value);
                            setNewFAQ({ ...newFAQ, answer: processedValue });
                          }}
                          className="w-full bg-white text-gray-900"
                          controls={[
                            ['bold', 'italic', 'underline', 'strike'],
                            ['h1', 'h2', 'h3'],
                            ['unorderedList', 'orderedList'],
                            ['link', 'image', 'video'],
                            ['alignLeft', 'alignCenter', 'alignRight'],
                            ['blockquote', 'code'],
                            ['sup', 'sub'],
                            ['clean'],
                          ]}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() =>
                            editingFAQIndex !== null ? updateFAQItem(editingFAQIndex) : addFAQ()
                          }
                          className="theme-button text-white"
                        >
                          {editingFAQIndex !== null ? "Update FAQ" : "Add FAQ"}
                        </Button>
                        {editingFAQIndex !== null && (
                          <Button
                            onClick={() => {
                              setEditingFAQIndex(null);
                              setNewFAQ({ question: "", answer: "" });
                            }}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FAQs List */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-4">FAQs ({faqContent.faqs?.length || 0})</h3>
                    <div className="space-y-4">
                      {faqContent.faqs && faqContent.faqs.length > 0 ? (
                        faqContent.faqs.map((faq, index) => (
                          <div
                            key={index}
                            className="p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{faq.question}</h4>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => startEditFAQItem(index)}
                                  variant="outline"
                                  size="sm"
                                >
                                  Edit
                                </Button>
                                <Button
                                  onClick={() => deleteFAQ(index)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                            <div
                              dangerouslySetInnerHTML={{ __html: faq.answer }}
                              className="text-sm text-gray-600"
                            />
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No FAQs added yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={updateFAQ}
                      className="theme-button text-white"
                      disabled={savingContent}
                    >
                      {savingContent ? "Updating..." : "Update"}
                    </Button>
                    <Button
                      onClick={discardFAQ}
                      variant="outline"
                      disabled={savingContent}
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      )}

      {/* Image Cropper Modal (Banners) */}
      {showImageCropper && currentBannerSlot && currentImageFile && (
        <ImageCropperModal
          open={showImageCropper}
          onClose={() => {
            setShowImageCropper(false);
            setCurrentBannerSlot(null);
            setCurrentImageFile(null);
          }}
          file={currentImageFile}
          onCropDone={async (croppedBlob: Blob) => {
            const croppedFile = new File([croppedBlob], currentImageFile.name, { type: croppedBlob.type });
            handleImageCrop(croppedFile);
          }}
          aspect={16 / 9}
        />
      )}

      {/* Image Cropper Modal (Banner 2) */}
      {showBanner2Cropper && currentBanner2Slot && currentBanner2File && (
        <ImageCropperModal
          open={showBanner2Cropper}
          onClose={() => {
            setShowBanner2Cropper(false);
            setCurrentBanner2Slot(null);
            setCurrentBanner2File(null);
          }}
          file={currentBanner2File}
          onCropDone={async (croppedBlob: Blob) => {
            const croppedFile = new File([croppedBlob], currentBanner2File.name, { type: croppedBlob.type });
            handleBanner2Crop(croppedFile);
          }}
          aspect={getBanner2Aspect(currentBanner2Slot)}
        />
      )}
    </div>
  );
}
