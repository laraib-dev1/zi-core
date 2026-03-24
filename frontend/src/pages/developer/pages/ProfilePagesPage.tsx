import React, { useState, useEffect } from "react";
import { User, Plus, X, Edit, LayoutDashboard, Package, MapPin, Heart, MessageSquare, Star } from "lucide-react";
import {
  getProfilePages,
  createProfilePage,
  updateProfilePage,
  deleteProfilePage,
  updateBaseProfileTab,
  getBaseProfileTabs,
} from "@/api/profilepage.api";
import IconPicker from "@/components/developer/IconPicker";
import { useToast } from "@/components/ui/toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import PageLoader from "@/components/ui/PageLoader";
import CircularLoader from "@/components/ui/CircularLoader";
import { RichTextEditor } from "@mantine/rte";
import { getCachedData, setCachedData, CACHE_KEYS } from "@/utils/cache";

interface ProfilePage {
  _id: string;
  title: string;
  slug: string;
  icon: string;
  enabled: boolean;
  subInfo: string;
  order: number;
  content: string;
}

// Base profile tabs that are always available on the site
const baseProfileTabs = [
  { _id: "dashboard", title: "Dashboard", slug: "/profile?tab=dashboard", icon: "LayoutDashboard", enabled: true, subInfo: "User dashboard overview", order: 1, content: "" },
  { _id: "profile", title: "Profile", slug: "/profile?tab=profile", icon: "User", enabled: true, subInfo: "User profile settings", order: 2, content: "" },
  { _id: "addresses", title: "Addresses", slug: "/profile?tab=addresses", icon: "MapPin", enabled: true, subInfo: "Manage delivery addresses", order: 3, content: "" },
  { _id: "wishlist", title: "Wishlist", slug: "/profile?tab=wishlist", icon: "Heart", enabled: true, subInfo: "Saved products", order: 4, content: "" },
  { _id: "orders", title: "Orders", slug: "/profile?tab=orders", icon: "Package", enabled: true, subInfo: "Order history", order: 5, content: "" },
  { _id: "reviews", title: "Reviews", slug: "/profile?tab=reviews", icon: "Star", enabled: true, subInfo: "Product reviews", order: 6, content: "" },
  { _id: "queries", title: "Support", slug: "/profile?tab=queries", icon: "MessageSquare", enabled: true, subInfo: "Support & help", order: 7, content: "" },
];

export default function ProfilePagesPage() {
  const { success, error } = useToast();
  const [pages, setPages] = useState<ProfilePage[]>(() => {
    const cached = getCachedData<ProfilePage[]>(CACHE_KEYS.PROFILE_PAGES);
    return Array.isArray(cached) && cached.length > 0 ? cached : JSON.parse(JSON.stringify(baseProfileTabs));
  });
  const [loading, setLoading] = useState(!getCachedData(CACHE_KEYS.PROFILE_PAGES));
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<Record<string, boolean>>({});
  const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newPage, setNewPage] = useState({
    title: "",
    slug: "",
    icon: "",
    subInfo: "",
    enabled: true,
    content: "",
  });
  const [pageErrors, setPageErrors] = useState<{ title?: string; slug?: string }>({});

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    if (!getCachedData(CACHE_KEYS.PROFILE_PAGES)) setLoading(true);
    try {
      // Load base tabs from API
      let baseTabsFromAPI: ProfilePage[] = [];
      try {
        const baseTabsData = await getBaseProfileTabs();
        console.log("Base tabs API response:", baseTabsData);
        
        if (Array.isArray(baseTabsData)) {
          baseTabsFromAPI = baseTabsData;
        } else if (baseTabsData && Array.isArray(baseTabsData.data)) {
          baseTabsFromAPI = baseTabsData.data;
        }
        console.log(`Loaded ${baseTabsFromAPI.length} base tabs from API`);
      } catch (apiErr) {
        console.warn("Could not load base tabs from API, using defaults:", apiErr);
        // Fallback to default base tabs (all enabled)
        baseTabsFromAPI = JSON.parse(JSON.stringify(baseProfileTabs));
      }
      
      // If API returned empty, use defaults
      if (baseTabsFromAPI.length === 0) {
        baseTabsFromAPI = JSON.parse(JSON.stringify(baseProfileTabs));
      }
      
      // Try to load custom profile pages from API
      let customPages: ProfilePage[] = [];
      try {
        const data = await getProfilePages();
        console.log("Profile pages API response:", data);
        
        if (Array.isArray(data)) {
          customPages = data;
        } else if (data && Array.isArray(data.data)) {
          customPages = data.data;
        }
        
        if (Array.isArray(customPages) && customPages.length > 0) {
          console.log(`Added ${customPages.length} custom profile pages`);
        } else {
          console.log("No custom profile pages found");
        }
      } catch (apiErr) {
        console.warn("Could not load custom profile pages from API:", apiErr);
      }
      
      // Combine base tabs and custom pages
      const allPages = [...baseTabsFromAPI, ...customPages];
      
      // Sort by order
      allPages.sort((a, b) => (a.order || 0) - (b.order || 0));
      setPages(allPages);
      setCachedData(CACHE_KEYS.PROFILE_PAGES, allPages);
      console.log(`Total profile pages: ${allPages.length}`);
    } catch (err: any) {
      console.error("Failed to load profile pages:", err);
      error(err.response?.data?.message || err.message || "Failed to load profile pages");
      
      // Fallback to default base tabs
      setPages(JSON.parse(JSON.stringify(baseProfileTabs)));
    } finally {
      setLoading(false);
    }
  };

  const togglePage = async (id: string, enabled: boolean) => {
    if (toggleLoading[id]) return;
    
    // Check if it's a base tab
    const isBaseTab = baseProfileTabs.some(tab => tab._id === id);
    
    setToggleLoading(prev => ({ ...prev, [id]: true }));
    try {
      if (isBaseTab) {
        // For base tabs, update via API
        await updateBaseProfileTab(id, { enabled: !enabled });
        success(`Base tab ${!enabled ? 'enabled' : 'disabled'} successfully`);
      } else {
        // For custom pages, update via API
        await updateProfilePage(id, { enabled: !enabled });
        success(`Profile page ${!enabled ? 'enabled' : 'disabled'} successfully`);
      }
      
      // Update local state immediately for better UX
      setPages(prevPages => 
        prevPages.map(page => 
          page._id === id ? { ...page, enabled: !enabled } : page
        )
      );
      
      // Reload to sync with server
      await loadPages();
    } catch (err: any) {
      console.error("Failed to toggle:", err);
      error(err.response?.data?.message || err.message || `Failed to toggle ${isBaseTab ? 'base tab' : 'profile page'}`);
      // Reload to revert any local changes
      await loadPages();
    } finally {
      setToggleLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleAddPage = async () => {
    const errors: { title?: string; slug?: string } = {};
    
    if (!newPage.title.trim()) {
      errors.title = "Title is required";
    }
    if (!newPage.slug.trim()) {
      errors.slug = "Slug is required";
    } else if (!/^\/?[a-z0-9-]+(\/[a-z0-9-]+)*\/?$/.test(newPage.slug)) {
      errors.slug = "Slug must be a valid URL path (e.g., /about-us)";
    }
    
    setPageErrors(errors);
    if (Object.keys(errors).length > 0) {
      error("Please fill in all required fields correctly.");
      return;
    }

    setIsLoading(true);
    try {
      await createProfilePage(newPage);
      success("Profile page created successfully!");
      await loadPages();
      setShowAddModal(false);
      setNewPage({ title: "", slug: "", icon: "", subInfo: "", enabled: true, content: "" });
      setPageErrors({});
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to create profile page");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPage = async (id: string) => {
    const page = pages.find(p => p._id === id);
    if (!page) return;
    
    setIsLoading(true);
    try {
      await updateProfilePage(id, {
        title: page.title,
        slug: page.slug,
        icon: page.icon,
        subInfo: page.subInfo,
        enabled: page.enabled,
        content: page.content,
      });
      success("Profile page updated successfully!");
      await loadPages();
      setEditingPageId(null);
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to update profile page");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm || deleteLoading[deleteConfirm]) return;
    setDeleteLoading(prev => ({ ...prev, [deleteConfirm]: true }));
    try {
      await deleteProfilePage(deleteConfirm);
      setDeleteConfirm(null);
      await loadPages();
      success("Profile page deleted successfully!");
    } catch (err: any) {
      console.error("Failed to delete profile page:", err);
      error("Failed to delete profile page");
      setDeleteConfirm(null);
    } finally {
      setDeleteLoading(prev => ({ ...prev, [deleteConfirm]: false }));
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-5xl">
      <ConfirmDialog
        open={deleteConfirm !== null}
        title="Delete Profile Page"
        message="Are you sure you want to delete this profile page? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Delete"
        cancelText="Cancel"
      />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold theme-heading">Profile Pages</h1>
        {/* Add Button - Hidden */}
        {/* <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors theme-button"
        >
          <Plus size={18} />
          Add Page
        </button> */}
      </div>

      {/* Pages List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
          <User className="w-5 h-5 theme-text-primary" />
          <h2 className="font-semibold theme-heading">All Profile Pages</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Loading profile pages...
            </div>
          ) : pages.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No profile pages found. Profile pages will appear here once created.
            </div>
          ) : (
            pages.map((page) => (
              <div
                key={page._id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                {editingPageId === page._id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={page.title}
                          onChange={(e) => {
                            const updatedPages = pages.map(p =>
                              p._id === page._id ? { ...p, title: e.target.value } : p
                            );
                            setPages(updatedPages);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
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
                          Slug
                        </label>
                        <input
                          type="text"
                          value={page.slug}
                          onChange={(e) => {
                            const updatedPages = pages.map(p =>
                              p._id === page._id ? { ...p, slug: e.target.value } : p
                            );
                            setPages(updatedPages);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sub Info
                      </label>
                      <input
                        type="text"
                        value={page.subInfo}
                        onChange={(e) => {
                          const updatedPages = pages.map(p =>
                            p._id === page._id ? { ...p, subInfo: e.target.value } : p
                          );
                          setPages(updatedPages);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content
                      </label>
                      <RichTextEditor
                        value={page.content}
                        onChange={(value) => {
                          const updatedPages = pages.map(p =>
                            p._id === page._id ? { ...p, content: value } : p
                          );
                          setPages(updatedPages);
                        }}
                        className="w-full bg-white text-gray-900"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPage(page._id)}
                        disabled={isLoading}
                        className="px-4 py-2 text-white rounded-lg theme-button disabled:opacity-50"
                      >
                        {isLoading ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingPageId(null);
                          loadPages();
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{page.title}</h3>
                      <p className="text-sm text-gray-500">{page.subInfo || "No sub info"}</p>
                      <p className="text-xs text-gray-400 mt-1">Slug: {page.slug}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      {!baseProfileTabs.some(tab => tab._id === page._id) && (
                        <button
                          onClick={() => setEditingPageId(page._id)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                      )}
                      {/* Toggle Switch - Works for all pages */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🔵 Toggle button clicked!');
                          console.log('Page ID:', page._id);
                          console.log('Current enabled:', page.enabled);
                          console.log('Will toggle to:', !page.enabled);
                          togglePage(page._id, page.enabled);
                        }}
                        disabled={toggleLoading[page._id]}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          page.enabled ? "" : "bg-gray-300"
                        }`}
                        style={page.enabled ? { backgroundColor: "var(--theme-primary)" } : {}}
                        title={baseProfileTabs.some(tab => tab._id === page._id) ? "Toggle visibility (base tabs always active on site)" : page.enabled ? "Disable on site" : "Enable on site"}
                      >
                        {toggleLoading[page._id] ? (
                          <CircularLoader 
                            size={12} 
                            color="white"
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                          />
                        ) : (
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              page.enabled ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        )}
                      </button>
                      {!baseProfileTabs.some(tab => tab._id === page._id) && (
                        <button
                          onClick={() => handleDelete(page._id)}
                          disabled={deleteLoading[page._id]}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          {deleteLoading[page._id] ? (
                            <CircularLoader size={16} color="rgb(239 68 68)" />
                          ) : (
                            <X size={18} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Page Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Profile Page</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newPage.title}
                  onChange={(e) => {
                    setNewPage({ ...newPage, title: e.target.value });
                    if (pageErrors.title) setPageErrors(prev => ({ ...prev, title: undefined }));
                  }}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none ${pageErrors.title ? "border-red-500" : "border-gray-300"}`}
                  style={{
                    "--tw-ring-color": "var(--theme-primary)",
                  } as React.CSSProperties & { "--tw-ring-color": string }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--theme-primary)";
                    e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = pageErrors.title ? "" : "";
                    e.currentTarget.style.boxShadow = "";
                  }}
                  placeholder="Page Title"
                />
                {pageErrors.title && <p className="text-red-500 text-xs mt-1">{pageErrors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  value={newPage.slug}
                  onChange={(e) => {
                    setNewPage({ ...newPage, slug: e.target.value });
                    if (pageErrors.slug) setPageErrors(prev => ({ ...prev, slug: undefined }));
                  }}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none ${pageErrors.slug ? "border-red-500" : "border-gray-300"}`}
                  style={{
                    "--tw-ring-color": "var(--theme-primary)",
                  } as React.CSSProperties & { "--tw-ring-color": string }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--theme-primary)";
                    e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = pageErrors.slug ? "" : "";
                    e.currentTarget.style.boxShadow = "";
                  }}
                  placeholder="/page-slug"
                />
                {pageErrors.slug && <p className="text-red-500 text-xs mt-1">{pageErrors.slug}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub Info
                </label>
                <input
                  type="text"
                  value={newPage.subInfo}
                  onChange={(e) => setNewPage({ ...newPage, subInfo: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none"
                  style={{
                    "--tw-ring-color": "var(--theme-primary)",
                  } as React.CSSProperties & { "--tw-ring-color": string }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--theme-primary)";
                    e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "";
                    e.currentTarget.style.boxShadow = "";
                  }}
                  placeholder="Sub info here"
                />
              </div>

              <IconPicker
                value={newPage.icon}
                onChange={(iconName) => setNewPage({ ...newPage, icon: iconName })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <RichTextEditor
                  value={newPage.content}
                  onChange={(value) => setNewPage({ ...newPage, content: value })}
                  className="w-full bg-white text-gray-900"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newPage.enabled}
                  onChange={(e) => setNewPage({ ...newPage, enabled: e.target.checked })}
                  className="w-4 h-4 border-gray-300 rounded"
                  style={{ accentColor: "var(--theme-primary)" }}
                />
                <label className="text-sm text-gray-700">Enabled</label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPage}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 theme-button flex items-center justify-center gap-2"
                >
                  {isLoading && <CircularLoader size={16} color="white" />}
                  Add Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

