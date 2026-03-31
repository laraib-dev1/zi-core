import React, { useState, useEffect, useMemo } from "react";
import { PanelBottom, Save, Plus, Trash2, GripVertical, X, ShoppingCart, FileText } from "lucide-react";
import { getCompany } from "@/api/company.api";
import { getCategories } from "@/api/category.api";
import { getProducts } from "@/api/product.api";
import { getFooter, updateFooter } from "@/api/footer.api";
import { getEnabledWebPagesByLocation } from "@/api/webpage.api";
import { useToast } from "@/components/ui/toast";
import PageLoader from "@/components/ui/PageLoader";
import CircularLoader from "@/components/ui/CircularLoader";
import { getCachedData, setCachedData, removeCachedData, CACHE_KEYS } from "@/utils/cache";

interface FooterLink {
  label: string;
  url: string;
  order: number;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
  order: number;
  enabled?: boolean;
}

// Custom Grid Icon Component - shows bars representing grid count
const GridIcon = ({ count, isSelected }: { count: number; isSelected: boolean }) => {
  const color = isSelected ? "var(--theme-primary)" : "#6B7280";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {count === 3 && (
        <>
          <rect x="2" y="2" width="6" height="6" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="10" y="2" width="6" height="6" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="18" y="2" width="4" height="6" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="2" y="10" width="6" height="6" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="10" y="10" width="6" height="6" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="18" y="10" width="4" height="6" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="2" y="18" width="6" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="10" y="18" width="6" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="18" y="18" width="4" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
        </>
      )}
      {count === 4 && (
        <>
          <rect x="1" y="1" width="4.5" height="4.5" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="7" y="1" width="4.5" height="4.5" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="13" y="1" width="4.5" height="4.5" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="19" y="1" width="4" height="4.5" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="1" y="7.5" width="4.5" height="4.5" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="7" y="7.5" width="4.5" height="4.5" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="13" y="7.5" width="4.5" height="4.5" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="19" y="7.5" width="4" height="4.5" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="1" y="14" width="4.5" height="4.5" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="7" y="14" width="4.5" height="4.5" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="13" y="14" width="4.5" height="4.5" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="19" y="14" width="4" height="4.5" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="1" y="20.5" width="4.5" height="3.5" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="7" y="20.5" width="4.5" height="3.5" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="13" y="20.5" width="4.5" height="3.5" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
          <rect x="19" y="20.5" width="4" height="3.5" stroke={color} strokeWidth="1.5" fill="none" rx="1"/>
        </>
      )}
      {count === 5 && (
        <>
          <rect x="0.5" y="0.5" width="4" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="5" y="0.5" width="4" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="9.5" y="0.5" width="4" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="14" y="0.5" width="4" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="18.5" y="0.5" width="5" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="0.5" y="5.5" width="4" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="5" y="5.5" width="4" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="9.5" y="5.5" width="4" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="14" y="5.5" width="4" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="18.5" y="5.5" width="5" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="0.5" y="10.5" width="4" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="5" y="10.5" width="4" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="9.5" y="10.5" width="4" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="14" y="10.5" width="4" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="18.5" y="10.5" width="5" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="0.5" y="15.5" width="4" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="5" y="15.5" width="4" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="9.5" y="15.5" width="4" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="14" y="15.5" width="4" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="18.5" y="15.5" width="5" height="4" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="0.5" y="20.5" width="4" height="3" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="5" y="20.5" width="4" height="3" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="9.5" y="20.5" width="4" height="3" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="14" y="20.5" width="4" height="3" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
          <rect x="18.5" y="20.5" width="5" height="3" stroke={color} strokeWidth="1.5" fill="none" rx="0.5"/>
        </>
      )}
    </svg>
  );
};

export default function FooterPage() {
  const { success, error } = useToast();
  const [footer, setFooter] = useState<{
    sections: FooterSection[];
    socialLinks: Record<string, string>;
    copyright: string;
    description: string;
    showPreview: boolean;
    showCategories: boolean;
    showProducts: boolean;
    showSocialIcons: boolean;
    showSocialLinks: boolean;
    gridSettings: {
      productsPerRow: number;
      blogsPerRow: number;
    };
  }>(() => {
    const c = getCachedData<any>(CACHE_KEYS.FOOTER_EDITOR);
    if (c?.footer && typeof c.footer === 'object') return c.footer;
    return {
      sections: [],
      socialLinks: {},
      copyright: "",
      description: "",
      showPreview: true,
      showCategories: false,
      showProducts: false,
      showSocialIcons: false,
      showSocialLinks: false,
      gridSettings: { productsPerRow: 4, blogsPerRow: 4 },
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(() => {
    const c = getCachedData<any>(CACHE_KEYS.FOOTER_EDITOR);
    return !(c && c.footer && Array.isArray(c.pages));
  });
  const [pages, setPages] = useState<{ _id: string; title: string; slug: string }[]>(() => {
    const c = getCachedData<any>(CACHE_KEYS.FOOTER_EDITOR);
    return Array.isArray(c?.pages) ? c.pages : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSectionEnabled, setNewSectionEnabled] = useState(true);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());
  const [isSavingGrid, setIsSavingGrid] = useState(false);
  const [categories, setCategories] = useState<any[]>(() => {
    const c = getCachedData<any>(CACHE_KEYS.FOOTER_EDITOR);
    return Array.isArray(c?.categories) ? c.categories : [];
  });
  const [products, setProducts] = useState<any[]>(() => {
    const c = getCachedData<any>(CACHE_KEYS.FOOTER_EDITOR);
    return Array.isArray(c?.products) ? c.products : [];
  });

  const loadFooter = async () => {
    try {
      const data = await getFooter();
      let sections = data.sections || [];
      if (sections.length === 0) {
        const footerPages = await getEnabledWebPagesByLocation("footer");
        if (footerPages && footerPages.length > 0) {
          sections = [{
            title: "Quick Links",
            links: footerPages.map((p: any, idx: number) => ({
              label: p.title,
              url: p.slug.startsWith("/") ? p.slug : `/${p.slug}`,
              order: idx,
            })),
            order: 0,
            enabled: true,
          }];
          try {
            await updateFooter({ ...data, sections, showPreview: data.showPreview !== false });
          } catch (e) {
            console.error("Failed to auto-create footer sections:", e);
          }
        }
      }
      const footerState = {
        ...data,
        sections: sections.map((s: FooterSection) => ({ ...s, enabled: s.enabled !== false })),
        showPreview: data.showPreview === undefined || data.showPreview === null ? true : (data.showPreview === true || data.showPreview === "true"),
        showCategories: data.showCategories === true || data.showCategories === "true",
        showProducts: data.showProducts === true || data.showProducts === "true",
        showSocialIcons: data.showSocialIcons === true || data.showSocialIcons === "true",
        showSocialLinks: data.showSocialLinks === true || data.showSocialLinks === "true",
        gridSettings: data.gridSettings || { productsPerRow: 4, blogsPerRow: 4 },
      };
      setFooter(footerState);
      return footerState;
    } catch (error) {
      console.error("Failed to load footer:", error);
      return null;
    }
  };

  const loadPages = async () => {
    try {
      const data = await getEnabledWebPagesByLocation("footer");
      const list = data || [];
      setPages(list);
      return list;
    } catch (err) {
      console.error("Failed to load footer pages:", err);
      return [];
    }
  };

  useEffect(() => {
    const hasCache = !!(getCachedData(CACHE_KEYS.FOOTER_EDITOR) as any)?.footer;
    const loadAll = async () => {
      if (!hasCache) setInitialLoading(true);
      try {
        const [cats, prods, footerState, pagesData] = await Promise.all([
          getCategories().catch(() => []),
          getProducts().catch(() => []),
          loadFooter(),
          loadPages(),
        ]);
        setCategories(cats || []);
        setProducts(prods || []);
        if (footerState && Array.isArray(pagesData)) {
          setCachedData(CACHE_KEYS.FOOTER_EDITOR, { footer: footerState, pages: pagesData, categories: cats || [], products: prods || [] });
        }
      } catch (e) {
        console.error("Footer load error:", e);
      } finally {
        setInitialLoading(false);
      }
    };
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Debug: log what we're saving
      console.log("Saving footer with showPreview:", footer.showPreview, "type:", typeof footer.showPreview);
      
      // Explicitly include showPreview - convert to boolean explicitly
      const showPreviewValue = footer.showPreview === true || (typeof footer.showPreview === "string" && footer.showPreview === "true") || (typeof footer.showPreview === "number" && footer.showPreview === 1);
      
      const saveData = {
        sections: footer.sections,
        socialLinks: footer.socialLinks,
        copyright: footer.copyright,
        description: footer.description,
        showPreview: showPreviewValue, // Explicitly set as boolean
        showCategories: footer.showCategories || false,
        showProducts: footer.showProducts || false,
        showSocialIcons: footer.showSocialIcons || false,
        showSocialLinks: footer.showSocialLinks || false,
        gridSettings: footer.gridSettings || { productsPerRow: 4, blogsPerRow: 4 },
      };
      
      console.log("Sending to backend - showPreview:", showPreviewValue, "full data:", JSON.stringify(saveData));
      const result = await updateFooter(saveData);
      console.log("Backend response:", result);
      
      removeCachedData(CACHE_KEYS.FOOTER);
      removeCachedData(CACHE_KEYS.FOOTER_EDITOR);
      success("Footer settings saved successfully!");
      
      // Reload to verify it was saved
      await loadFooter();
    } catch (err) {
      console.error("Failed to save footer:", err);
      error("Failed to save footer settings");
    } finally {
      setIsLoading(false);
    }
  };

  const addSectionFromSelection = () => {
    if (selectedPageIds.size === 0) {
      error("Select at least one page");
      return;
    }
    if (!newSectionTitle.trim()) {
      error("Please enter a group name");
      return;
    }
    const newLinks = pages
      .filter((p) => selectedPageIds.has(p._id))
      .map((p, idx) => ({
        label: p.title,
        url: p.slug.startsWith("/") ? p.slug : `/${p.slug}`,
        order: idx,
      }));

    setFooter((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          title: newSectionTitle.trim(),
          links: newLinks,
          order: prev.sections.length,
          enabled: newSectionEnabled,
        },
      ],
    }));
    setSelectedPageIds(new Set());
    setNewSectionEnabled(true);
    setNewSectionTitle("");
    setShowAddModal(false);
  };

  const updateSection = (index: number, field: string, value: any) => {
    const newSections = [...footer.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setFooter({ ...footer, sections: newSections });
  };

  const addLinkToSection = (sectionIndex: number) => {
    const newSections = [...footer.sections];
    newSections[sectionIndex].links.push({
      label: "Page 1",
      url: "/",
      order: newSections[sectionIndex].links.length,
    });
    setFooter({ ...footer, sections: newSections });
  };

  const updateLink = (sectionIndex: number, linkIndex: number, field: string, value: string) => {
    const newSections = [...footer.sections];
    newSections[sectionIndex].links[linkIndex] = {
      ...newSections[sectionIndex].links[linkIndex],
      [field]: value,
    };
    setFooter({ ...footer, sections: newSections });
  };

  const removeLink = (sectionIndex: number, linkIndex: number) => {
    const newSections = [...footer.sections];
    newSections[sectionIndex].links.splice(linkIndex, 1);
    setFooter({ ...footer, sections: newSections });
  };

  const removeSection = (index: number) => {
    const newSections = footer.sections.filter((_, i) => i !== index);
    setFooter({ ...footer, sections: newSections });
  };

  const toggleSectionEnabled = (index: number) => {
    const newSections = [...footer.sections];
    newSections[index] = { ...newSections[index], enabled: newSections[index].enabled === false ? true : false };
    setFooter({ ...footer, sections: newSections });
  };

  const normalizeSlug = (url: string) => {
    if (!url) return "";
    try {
      // strip domain if absolute
      const u = new URL(url, "http://placeholder");
      return u.pathname.replace(/\/+$/, "") || "/";
    } catch {
      return url.replace(/\/+$/, "") || "/";
    }
  };

  const usedPageIds = useMemo(() => {
    return new Set<string>(
      footer.sections.flatMap((section) =>
        section.links
          .map((link) => {
            const linkPath = normalizeSlug(link.url);
            const match = pages.find((p) => {
              const pagePath = normalizeSlug(p.slug.startsWith("/") ? p.slug : `/${p.slug}`);
              return pagePath === linkPath;
            });
            return match?._id || "";
          })
          .filter(Boolean)
      )
    );
  }, [footer.sections, pages]);

  useEffect(() => {
    if (showAddModal) {
      setSelectedPageIds(new Set());
      setNewSectionEnabled(true);
      setNewSectionTitle("");
    }
  }, [showAddModal]);

  if (initialLoading) {
    return <PageLoader />;
  }

  return (
    <>
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold theme-heading">Footer</h1>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 theme-button"
        >
          {isLoading && <CircularLoader size={16} color="white" />}
          <Save size={18} />
          Save Changes
        </button>
      </div>

      {/* Footer Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {footer.sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2 min-w-0">
              <GripVertical className="w-4 h-4 text-gray-400 cursor-grab shrink-0" />
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(sectionIndex, "title", e.target.value)}
                  className="font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 flex-1 min-w-0"
                  style={{ color: "#111827" }}
                />
              <label className="flex items-center gap-1 text-sm text-gray-600 shrink-0 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={section.enabled !== false}
                  onChange={() => toggleSectionEnabled(sectionIndex)}
                  className="w-4 h-4 border-gray-300 rounded"
                  style={{ accentColor: "var(--theme-primary)" }}
                />
                <span>Show</span>
              </label>
              <button
                onClick={() => removeSection(sectionIndex)}
                className="p-1 text-gray-400 hover:text-red-500 shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {section.links.map((link, linkIndex) => (
                <div key={linkIndex} className="flex items-center gap-2 min-w-0">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateLink(sectionIndex, linkIndex, "label", e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded outline-none min-w-0 text-gray-900"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--theme-primary)";
                      e.currentTarget.style.boxShadow = "0 0 0 1px var(--theme-primary)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "";
                      e.currentTarget.style.boxShadow = "";
                    }}
                    placeholder="Link label"
                  />
                  <button
                    onClick={() => removeLink(sectionIndex, linkIndex)}
                    className="p-1 text-gray-400 hover:text-red-500 shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {section.links.length === 0 && (
                <p className="text-sm text-gray-400">No links yet</p>
              )}
              <button
                onClick={() => addLinkToSection(sectionIndex)}
                className="flex items-center gap-1 text-sm font-medium mt-2"
                style={{ color: "var(--theme-primary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--theme-dark)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--theme-primary)";
                }}
              >
                <Plus size={16} />
                Add Link
              </button>
            </div>
          </div>
        ))}

        {/* Add Section Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-colors"
          style={{ borderColor: "border-gray-300" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--theme-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "";
          }}
        >
          <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Add Section</p>
        </button>
      </div>

      {/* Permanent Columns - Categories and Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold theme-heading">Permanent Columns</h2>
          <p className="text-sm text-gray-600 mt-1">Show popular categories and products in footer</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories Column */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Categories</h3>
                <p className="text-xs text-gray-500">Show 3 popular categories</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={footer.showCategories}
                onChange={(e) => setFooter({ ...footer, showCategories: e.target.checked })}
                className="sr-only peer"
              />
              <div
                className="w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-2px after:left-2px after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{
                  backgroundColor: footer.showCategories ? "var(--theme-primary)" : "#E5E7EB",
                  boxShadow: footer.showCategories ? "0 0 0 2px color-mix(in srgb, var(--theme-primary) 30%, transparent)" : "none",
                }}
              />
            </label>
          </div>

          {/* Products Column */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Products</h3>
                <p className="text-xs text-gray-500">Show 3 popular products</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={footer.showProducts}
                onChange={(e) => setFooter({ ...footer, showProducts: e.target.checked })}
                className="sr-only peer"
              />
              <div
                className="w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-2px after:left-2px after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{
                  backgroundColor: footer.showProducts ? "var(--theme-primary)" : "#E5E7EB",
                  boxShadow: footer.showProducts ? "0 0 0 2px color-mix(in srgb, var(--theme-primary) 30%, transparent)" : "none",
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Social Icons and Links */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold theme-heading">Social Media</h2>
          <p className="text-sm text-gray-600 mt-1">Manage social icons and links display in footer</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Social Icons */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <PanelBottom className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Social Icons</h3>
                <p className="text-xs text-gray-500">Show icons under company name</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={footer.showSocialIcons}
                onChange={(e) => setFooter({ ...footer, showSocialIcons: e.target.checked })}
                className="sr-only peer"
              />
              <div
                className="w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-2px after:left-2px after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{
                  backgroundColor: footer.showSocialIcons ? "var(--theme-primary)" : "#E5E7EB",
                  boxShadow: footer.showSocialIcons ? "0 0 0 2px color-mix(in srgb, var(--theme-primary) 30%, transparent)" : "none",
                }}
              />
            </label>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <PanelBottom className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Social Links</h3>
                <p className="text-xs text-gray-500">Show links column with platform names</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={footer.showSocialLinks}
                onChange={(e) => setFooter({ ...footer, showSocialLinks: e.target.checked })}
                className="sr-only peer"
              />
              <div
                className="w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-2px after:left-2px after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{
                  backgroundColor: footer.showSocialLinks ? "var(--theme-primary)" : "#E5E7EB",
                  boxShadow: footer.showSocialLinks ? "0 0 0 2px color-mix(in srgb, var(--theme-primary) 30%, transparent)" : "none",
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Grid Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <h2 className="font-semibold theme-heading">Grid Settings</h2>
            <p className="text-sm text-gray-600 mt-1">Control the number of items displayed per row on the site</p>
          </div>
          <button
            onClick={async () => {
              setIsSavingGrid(true);
              try {
                await handleSave();
                success("Grid settings saved successfully!");
              } catch (err) {
                error("Failed to save grid settings");
              } finally {
                setIsSavingGrid(false);
              }
            }}
            disabled={isSavingGrid || initialLoading}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 theme-button"
          >
            {isSavingGrid && <CircularLoader size={16} color="white" />}
            <Save size={18} />
            Save
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Grid */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart size={18} />
              Product Grid
            </h3>
            <div className="flex gap-3">
              {[3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setFooter({ 
                    ...footer, 
                    gridSettings: { ...footer.gridSettings, productsPerRow: num } 
                  })}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    footer.gridSettings.productsPerRow === num
                      ? "border-var(--theme-primary) bg-var(--theme-primary)/10"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                  title={`${num} columns`}
                >
                  <GridIcon count={num} isSelected={footer.gridSettings.productsPerRow === num} />
                </button>
              ))}
            </div>
          </div>

          {/* Blog Grid */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={18} />
              Blog Grid
            </h3>
            <div className="flex gap-3">
              {[3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setFooter({ 
                    ...footer, 
                    gridSettings: { ...footer.gridSettings, blogsPerRow: num } 
                  })}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    footer.gridSettings.blogsPerRow === num
                      ? "border-var(--theme-primary) bg-var(--theme-primary)/10"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                  title={`${num} columns`}
                >
                  <GridIcon count={num} isSelected={footer.gridSettings.blogsPerRow === num} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="font-semibold theme-heading">Footer Preview</h2>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={footer.showPreview}
              onChange={(e) => setFooter({ ...footer, showPreview: e.target.checked })}
              className="w-4 h-4 border-gray-300 rounded"
              style={{ accentColor: "var(--theme-primary)" }}
            />
            <span className="text-sm text-gray-700">Show Footer Preview</span>
          </label>
        </div>
        {footer.showPreview && (
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6">
              {footer.sections.filter((s) => s.enabled !== false).slice(0,3).map((section, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-900 mb-3">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a
                          href={link.url}
                          className="text-sm text-gray-600 transition-colors"
                          style={{ color: "inherit" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--theme-primary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "";
                          }}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

      {/* Add Section Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Footer Column</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newSectionEnabled}
                  onChange={(e) => setNewSectionEnabled(e.target.checked)}
                  className="w-4 h-4 border-gray-300 rounded"
                  style={{ accentColor: "var(--theme-primary)" }}
                />
                <span className="text-sm text-gray-700">Show this column</span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="Enter group name (e.g., Quick Links, Support, etc.)"
                  required
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--theme-primary)";
                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(var(--theme-primary-rgb), 0.2)";
                  }}
                  onBlur={(e) => {
                    if (!e.currentTarget.value.trim()) {
                      e.currentTarget.style.borderColor = "#ef4444";
                    } else {
                      e.currentTarget.style.borderColor = "";
                    }
                    e.currentTarget.style.boxShadow = "";
                  }}
                  autoFocus
                />
                {!newSectionTitle.trim() && (
                  <p className="text-xs text-red-500 mt-1">Group name is required</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Choose pages to include</h4>
                <div className="border border-gray-200 rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto">
                  {pages.map((page) => {
                    const disabled = usedPageIds.has(page._id);
                    const checked = selectedPageIds.has(page._id);
                    return (
                      <label
                        key={page._id}
                        className={`flex items-center gap-2 text-sm ${disabled ? "text-gray-400" : "text-gray-800"}`}
                      >
                        <input
                          type="checkbox"
                          disabled={disabled}
                          checked={checked}
                          onChange={(e) => {
                            const next = new Set(selectedPageIds);
                            if (e.target.checked) next.add(page._id);
                            else next.delete(page._id);
                            setSelectedPageIds(next);
                          }}
                          className="w-4 h-4 border-gray-300 rounded"
                          style={{ accentColor: "var(--theme-primary)" }}
                        />
                        <span>{page.title}</span>
                        {disabled && <span className="text-xs text-gray-400">(already in another column)</span>}
                      </label>
                    );
                  })}
                  {pages.length === 0 && <p className="text-sm text-gray-500">No pages available.</p>}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addSectionFromSelection}
                  className="px-4 py-2 text-sm text-white rounded-lg flex items-center gap-2 theme-button"
                >
                  <Plus size={16} />
                  Add Column
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
