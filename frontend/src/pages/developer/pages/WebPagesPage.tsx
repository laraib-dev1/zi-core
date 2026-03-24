import React, { useState, useEffect } from "react";
import { FileText, Plus, X } from "lucide-react";
import {
  getWebPages,
  createWebPage,
  updateWebPage,
  deleteWebPage,
} from "@/api/webpage.api";
import { getCachedData, setCachedData, removeCachedData, CACHE_KEYS } from "@/utils/cache";
import IconPicker from "@/components/developer/IconPicker";
import { useToast } from "@/components/ui/toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import PageLoader from "@/components/ui/PageLoader";
import CircularLoader from "@/components/ui/CircularLoader";

interface WebPage {
  _id: string;
  title: string;
  slug: string;
  icon: string;
  enabled: boolean;
  subInfo: string;
  order: number;
  location: "nav" | "footer" | "both";
}

export default function WebPagesPage() {
  const { success, error } = useToast();
  const [pages, setPages] = useState<WebPage[]>(() => {
    const cached = getCachedData<WebPage[]>(CACHE_KEYS.WEB_PAGES);
    return Array.isArray(cached) ? cached : [];
  });
  const [loading, setLoading] = useState(!getCachedData(CACHE_KEYS.WEB_PAGES));
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<Record<string, boolean>>({});
  const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newPage, setNewPage] = useState({
    title: "",
    slug: "",
    icon: "",
    subInfo: "",
    enabled: true,
    location: "footer" as "nav" | "footer" | "both",
  });
  const [pageErrors, setPageErrors] = useState<{ title?: string; slug?: string }>({});

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    if (!getCachedData(CACHE_KEYS.WEB_PAGES)) setLoading(true);
    try {
      const data = await getWebPages();
      setPages(data);
      setCachedData(CACHE_KEYS.WEB_PAGES, data);
    } catch (error) {
      console.error("Failed to load pages:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePage = async (id: string, enabled: boolean) => {
    if (toggleLoading[id]) return;
    setToggleLoading(prev => ({ ...prev, [id]: true }));
    try {
      await updateWebPage(id, { enabled: !enabled });
      await loadPages();
    } catch (error) {
      console.error("Failed to toggle page:", error);
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
      await createWebPage(newPage);
      success("Page created successfully!");
      await loadPages();
      setShowAddModal(false);
      setNewPage({ title: "", slug: "", icon: "", subInfo: "", enabled: true, location: "footer" });
      setPageErrors({});
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to create page");
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
      await deleteWebPage(deleteConfirm);
      setDeleteConfirm(null);
      await loadPages();
    } catch (error) {
      console.error("Failed to delete page:", error);
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
        title="Delete Page"
        message="Are you sure you want to delete this page? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Delete"
        cancelText="Cancel"
      />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold theme-heading">Web Pages</h1>
        {/* Add Button - Commented Out */}
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
          <FileText className="w-5 h-5 theme-text-primary" />
          <h2 className="font-semibold theme-heading">All Pages</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between px-6 py-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-11 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            ))
          ) : (
            pages.map((page) => (
            <div
              key={page._id}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{page.title}</h3>
                <p className="text-sm text-gray-500">{page.subInfo || "sub info here"}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Location: {page.location || "footer"}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Toggle Switch */}
                <button
                  onClick={() => togglePage(page._id, page.enabled)}
                  disabled={toggleLoading[page._id]}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    page.enabled ? "" : "bg-gray-300"
                  }`}
                  style={page.enabled ? { backgroundColor: "var(--theme-primary)" } : {}}
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

                {/* Delete Button - Commented Out */}
                {/* <button
                  onClick={() => handleDelete(page._id)}
                  disabled={deleteLoading[page._id]}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {deleteLoading[page._id] ? (
                    <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <X size={18} />
                  )}
                </button> */}
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Add Page Modal - Commented Out */}
      {/* {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Page</h3>
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
                  Location
                </label>
                <select
                  value={newPage.location}
                  onChange={(e) => setNewPage({ ...newPage, location: e.target.value as "nav" | "footer" | "both" })}
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
                >
                  <option value="footer">Footer</option>
                  <option value="nav">Navbar</option>
                  <option value="both">Both</option>
                </select>
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
      )} */}
    </div>
  );
}
