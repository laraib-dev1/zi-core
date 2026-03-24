import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutList,
  Code2,
  ChevronDown,
  ChevronUp,
  Save,
  Monitor,
  Tablet,
  Smartphone,
  ArrowLeft,
} from "lucide-react";
import {
  getLandingSections,
  updateLandingSection,
  type LandingSectionItem,
} from "@/api/landingsection.api";
import { getCachedData, setCachedData, removeCachedData, CACHE_KEYS } from "@/utils/cache";
import PageLoader from "@/components/ui/PageLoader";
import CircularLoader from "@/components/ui/CircularLoader";

type PreviewViewport = "desktop" | "tablet" | "mobile";

const VIEWPORT_WIDTHS: Record<PreviewViewport, number> = {
  desktop: 0, // 100%
  tablet: 768,
  mobile: 375,
};

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<LandingSectionItem[]>(() => {
    const cached = getCachedData<LandingSectionItem[]>(CACHE_KEYS.ADMIN_SECTIONS_FULL);
    return Array.isArray(cached) ? cached : [];
  });
  const [loading, setLoading] = useState(!getCachedData(CACHE_KEYS.ADMIN_SECTIONS_FULL));
  const [toggleLoading, setToggleLoading] = useState<Record<string, boolean>>({});
  const [codeSaveLoading, setCodeSaveLoading] = useState<Record<string, boolean>>({});
  const [expandedCodeId, setExpandedCodeId] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState<Record<string, string>>({});
  const [previewViewport, setPreviewViewport] = useState<PreviewViewport>("desktop");

  const customSections = sections.filter((s) => s.isCustom);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    if (!getCachedData(CACHE_KEYS.ADMIN_SECTIONS_FULL)) setLoading(true);
    try {
      const data = await getLandingSections();
      setSections(data);
      setCachedData(CACHE_KEYS.ADMIN_SECTIONS_FULL, data);
      setEditingCode((prev) => {
        const next = { ...prev };
        data.forEach((s) => {
          if (s.isCustom && s.code != null) next[s._id] = s.code;
        });
        return next;
      });
    } catch (error) {
      console.error("Failed to load custom sections:", error);
    } finally {
      setLoading(false);
    }
  };

  const invalidateLandingCache = () => {
    removeCachedData(CACHE_KEYS.ENABLED_LANDING_SECTIONS);
    removeCachedData(CACHE_KEYS.LANDING_SECTIONS);
    removeCachedData(CACHE_KEYS.LANDING_SECTIONS_FULL);
    removeCachedData(CACHE_KEYS.ADMIN_SECTIONS_FULL);
  };

  const toggleSection = async (id: string, enabled: boolean) => {
    if (toggleLoading[id]) return;
    setToggleLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await updateLandingSection(id, { enabled: !enabled });
      invalidateLandingCache();
      await loadSections();
    } catch (error) {
      console.error("Failed to toggle section:", error);
    } finally {
      setToggleLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleExpandCode = (id: string) => {
    setExpandedCodeId((prev) => (prev === id ? null : id));
    const section = sections.find((s) => s._id === id);
    if (section?.isCustom && editingCode[id] === undefined) {
      setEditingCode((prev) => ({ ...prev, [id]: section.code || "" }));
    }
  };

  const handleDiscardCode = (id: string) => {
    const section = sections.find((s) => s._id === id);
    if (section) {
      setEditingCode((prev) => ({ ...prev, [id]: section.code || "" }));
    }
  };

  const handleSaveCode = async (id: string) => {
    if (codeSaveLoading[id]) return;
    const code = editingCode[id] ?? "";
    setCodeSaveLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await updateLandingSection(id, { code });
      invalidateLandingCache();
      await loadSections();
    } catch (error) {
      console.error("Failed to save custom section code:", error);
    } finally {
      setCodeSaveLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  const expandedSection = customSections.find((s) => s._id === expandedCodeId);
  const isExpanded = Boolean(expandedSection);

  return (
    <div className={isExpanded ? "h-screen flex flex-col bg-gray-50" : "min-h-screen"}>
      {/* Top bar: Back to Admin (when full-width) + title */}
      <div className="flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>
        <h1 className="text-xl font-bold theme-heading">Custom Sections</h1>
      </div>

      {!isExpanded ? (
        /* List view – padded content */
        <div className="p-4 lg:p-6 max-w-5xl">
          <div className="mb-6">
            <p className="text-sm text-gray-500">
              Edit custom section HTML and control visibility on the Second Landing page. Click &quot;Edit code&quot; to open full editor and preview.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {customSections.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  <LayoutList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No custom sections yet</p>
                  <p className="text-sm mt-1">
                    Go to Developer panel → SpFolio → Sp Builder → Add Section → Custom to create one.
                  </p>
                </div>
              ) : (
                customSections.map((section) => (
                  <div
                    key={section._id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900">{section.label}</h3>
                        <p className="text-sm text-gray-500 truncate">{section.sectionId}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleExpandCode(section._id)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 shrink-0"
                      >
                        <Code2 className="w-4 h-4" />
                        <ChevronDown className="w-4 h-4" />
                        Edit code
                      </button>
                    </div>
                    <button
                      onClick={() => toggleSection(section._id, section.enabled)}
                      disabled={toggleLoading[section._id]}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        section.enabled ? "" : "bg-gray-300"
                      }`}
                      style={
                        section.enabled
                          ? { backgroundColor: "var(--theme-primary)" }
                          : {}
                      }
                      title={section.enabled ? "Visible on site" : "Hidden on site"}
                    >
                      {toggleLoading[section._id] ? (
                        <CircularLoader
                          size={12}
                          color="white"
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        />
                      ) : (
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            section.enabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Full-width editor (left) + preview (right) with viewport switcher */
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Left: Code editor - smaller width */}
          <div className="lg:w-[28%] w-full min-h-[40%] lg:min-h-0 min-w-0 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 bg-white">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                HTML Code — {expandedSection?.label}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDiscardCode(expandedSection!._id)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50"
                >
                  Discard
                </button>
                <button
                  onClick={() => handleSaveCode(expandedSection!._id)}
                  disabled={codeSaveLoading[expandedSection!._id]}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-white rounded-lg theme-button disabled:opacity-50"
                >
                  {codeSaveLoading[expandedSection!._id] ? (
                    <CircularLoader size={14} color="white" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {expandedSection?.code ? "Update" : "Save"}
                </button>
              </div>
            </div>
            <textarea
              value={editingCode[expandedSection!._id] ?? expandedSection?.code ?? ""}
              onChange={(e) =>
                setEditingCode((prev) => ({
                  ...prev,
                  [expandedSection!._id]: e.target.value,
                }))
              }
              placeholder="<div class='p-6'><h2>My Section</h2><p>Your HTML here...</p></div>"
              className="flex-1 w-full min-h-0 p-4 text-sm font-mono border-0 focus:outline-none focus:ring-0 resize-none"
              spellCheck={false}
            />
            <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setExpandedCodeId(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                <ChevronUp className="w-4 h-4 inline mr-1" />
                Close editor
              </button>
            </div>
          </div>

          {/* Right: Preview - larger width */}
          <div className="lg:w-[72%] w-full flex-1 min-h-0 flex flex-col bg-gray-100">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shrink-0">
              <span className="text-sm font-medium text-gray-700">Preview</span>
              <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setPreviewViewport("desktop")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition ${
                    previewViewport === "desktop"
                      ? "bg-white shadow text-gray-900 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Desktop view"
                >
                  <Monitor className="w-4 h-4" />
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport("tablet")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition ${
                    previewViewport === "tablet"
                      ? "bg-white shadow text-gray-900 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Tablet view (768px)"
                >
                  <Tablet className="w-4 h-4" />
                  Tablet
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport("mobile")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition ${
                    previewViewport === "mobile"
                      ? "bg-white shadow text-gray-900 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Mobile view (375px)"
                >
                  <Smartphone className="w-4 h-4" />
                  Mobile
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-auto p-4 flex justify-center">
              <div
                className="h-full min-h-[400px] bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm transition-all duration-200"
                style={{
                  width: VIEWPORT_WIDTHS[previewViewport] === 0 ? "100%" : `${VIEWPORT_WIDTHS[previewViewport]}px`,
                  maxWidth: "100%",
                }}
              >
                <iframe
                  title={`Preview: ${expandedSection?.label}`}
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=${previewViewport === "desktop" ? "device-width" : VIEWPORT_WIDTHS[previewViewport]}, initial-scale=1">
                        <style>
                          body { font-family: system-ui, sans-serif; margin: 0; padding: 1rem; }
                          * { box-sizing: border-box; }
                        </style>
                      </head>
                      <body>
                        ${editingCode[expandedSection!._id] ?? expandedSection?.code ?? "<p class='text-gray-400'>Add HTML to see preview</p>"}
                      </body>
                    </html>
                  `}
                  className="w-full h-full min-h-[360px] border-0"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
