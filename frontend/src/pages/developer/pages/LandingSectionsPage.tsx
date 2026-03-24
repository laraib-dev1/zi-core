import React, { useState, useEffect } from "react";
import { LayoutList, GripVertical } from "lucide-react";
import {
  getLandingSections,
  updateLandingSection,
  type LandingSectionItem,
} from "@/api/landingsection.api";
import { getCachedData, setCachedData, removeCachedData, CACHE_KEYS } from "@/utils/cache";
import { Skeleton } from "@/components/ui/skeleton";
import PageLoader from "@/components/ui/PageLoader";
import CircularLoader from "@/components/ui/CircularLoader";

export default function LandingSectionsPage() {
  const [sections, setSections] = useState<LandingSectionItem[]>(() => {
    const cached = getCachedData<LandingSectionItem[]>(CACHE_KEYS.LANDING_SECTIONS_FULL);
    return Array.isArray(cached) ? cached : [];
  });
  const [loading, setLoading] = useState(!getCachedData(CACHE_KEYS.LANDING_SECTIONS_FULL));
  const [toggleLoading, setToggleLoading] = useState<Record<string, boolean>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    if (!getCachedData(CACHE_KEYS.LANDING_SECTIONS_FULL)) setLoading(true);
    try {
      const data = await getLandingSections();
      setSections(data);
      setCachedData(CACHE_KEYS.LANDING_SECTIONS_FULL, data);
    } catch (error) {
      console.error("Failed to load landing sections:", error);
    } finally {
      setLoading(false);
    }
  };

  const invalidateLandingCache = () => {
    removeCachedData(CACHE_KEYS.ENABLED_LANDING_SECTIONS);
    removeCachedData(CACHE_KEYS.LANDING_SECTIONS);
    removeCachedData(CACHE_KEYS.LANDING_SECTIONS_FULL);
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

  const handleSaveOrder = async () => {
    if (isSavingOrder) return;
    setIsSavingOrder(true);
    try {
      const orderMap: Record<string, number> = {};
      sections.forEach((section, index) => {
        orderMap[section._id] = index;
      });

      await Promise.all(
        sections.map((section) => {
          const newOrder = orderMap[section._id];
          if (section.order === newOrder) return;
          return updateLandingSection(section._id, { order: newOrder });
        })
      );

      invalidateLandingCache();
      await loadSections();
    } catch (error) {
      console.error("Failed to save section order:", error);
    } finally {
      setIsSavingOrder(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold theme-heading">2nd Landing Page Sections</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutList className="w-5 h-5 theme-text-primary" />
            <h2 className="font-semibold theme-heading">
              Show / hide & reorder sections on the second landing page
            </h2>
          </div>
          <button
            onClick={handleSaveOrder}
            disabled={isSavingOrder || loading}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            {isSavingOrder ? "Saving..." : "Save Order"}
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between px-6 py-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-11 rounded-full" />
              </div>
            ))
          ) : (
            sections.map((section) => (
              <div
                key={section._id}
                className={`border-b border-gray-100 last:border-0 ${
                  draggingId === section._id ? "bg-gray-100" : ""
                }`}
              >
                <div
                  className={`flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors ${
                    draggingId === section._id ? "" : ""
                  }`}
                  draggable
                  onDragStart={() => setDraggingId(section._id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!draggingId || draggingId === section._id) return;
                    setSections((prev) => {
                      const fromIndex = prev.findIndex(
                        (s) => s._id === draggingId
                      );
                      const toIndex = prev.findIndex(
                        (s) => s._id === section._id
                      );
                      if (fromIndex === -1 || toIndex === -1) return prev;
                      const updated = [...prev];
                      const [moved] = updated.splice(fromIndex, 1);
                      updated.splice(toIndex, 0, moved);
                      return updated;
                    });
                  }}
                  onDragEnd={() => setDraggingId(null)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      className="p-1 text-gray-400 hover:text-gray-600 cursor-grab shrink-0"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{section.label}</h3>
                        {section.isCustom && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{section.sectionId}</p>
                    </div>
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
