import React, { useEffect, useState } from "react";
import { LayoutTemplate, Plus, X, GripVertical, MoreHorizontal, Code2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  getLandingSections,
  updateLandingSection,
  createLandingSection,
  type LandingSectionItem,
} from "@/api/landingsection.api";
import { getCachedData, removeCachedData, setCachedData, CACHE_KEYS } from "@/utils/cache";
import { isCatalogStyleLandingSectionId } from "@/utils/landingSectionCatalog";
import {
  getEditFieldDefsForSection,
  mergeContentForEditor,
  packContentForSave,
} from "@/utils/landingSectionContent";
import PageLoader from "@/components/ui/PageLoader";
import CircularLoader from "@/components/ui/CircularLoader";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

interface EditingSection extends LandingSectionItem {
  // Local-only fields can be added here later (e.g., isNew, tempId)
}

export default function SpFolioPage() {
  const { success, error } = useToast();

  const [allSections, setAllSections] = useState<LandingSectionItem[]>(() => {
    const cached = getCachedData<LandingSectionItem[]>(CACHE_KEYS.LANDING_SECTIONS_FULL);
    return Array.isArray(cached) ? [...cached].sort((a, b) => a.order - b.order) : [];
  });
  const [loading, setLoading] = useState(!getCachedData(CACHE_KEYS.LANDING_SECTIONS_FULL));

  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [editingSections, setEditingSections] = useState<EditingSection[]>([]);
  const [originalEnabledIds, setOriginalEnabledIds] = useState<string[]>([]);

  // For drag-and-drop reordering inside the builder list
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<Set<string>>(new Set());
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customSectionName, setCustomSectionName] = useState("");
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  const [editSection, setEditSection] = useState<LandingSectionItem | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editContentFields, setEditContentFields] = useState<Record<string, string>>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    if (!getCachedData(CACHE_KEYS.LANDING_SECTIONS_FULL)) setLoading(true);
    try {
      const data = await getLandingSections();
      setCachedData(CACHE_KEYS.LANDING_SECTIONS_FULL, data);
      const sorted = [...data].sort((a, b) => a.order - b.order);
      setAllSections(sorted);

      const enabledIds = sorted.filter((s) => s.enabled).map((s) => s._id);
      setOriginalEnabledIds(enabledIds);

      // When builder has never been opened, keep editing list in sync with current enabled set
      if (!isBuilderMode && editingSections.length === 0) {
        const initialEditing = sorted.filter((s) => enabledIds.includes(s._id));
        setEditingSections(initialEditing);
      }
    } catch (err) {
      console.error("Failed to load landing sections for SpFolio:", err);
      error("Failed to load sections for SpFolio.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnterBuilder = () => {
    if (!isBuilderMode) {
      // Initialize from current enabled sections if editing list is empty
      if (editingSections.length === 0) {
        const enabledSet = new Set(originalEnabledIds);
        const initialEditing = allSections.filter((s) => enabledSet.has(s._id));
        setEditingSections(initialEditing);
      }
      setIsBuilderMode(true);
    }
  };

  const handleDiscard = () => {
    // Reset editing list back to last-saved enabled set
    const enabledSet = new Set(originalEnabledIds);
    const resetEditing = allSections.filter((s) => enabledSet.has(s._id));
    setEditingSections(resetEditing);
    setIsBuilderMode(false);
    setShowAddModal(false);
    setSelectedToAdd(new Set());
  };

  const handleToggleEditingSection = (id: string) => {
    setEditingSections((prev) =>
      prev.map((sec) =>
        sec._id === id ? { ...sec, enabled: !sec.enabled } : sec
      )
    );
  };

  const handleToggleNavbarDropdown = async (section: LandingSectionItem, checked: boolean) => {
    try {
      const updated = await updateLandingSection(section._id, { showInNavbarDropdown: checked });
      removeCachedData(CACHE_KEYS.ENABLED_LANDING_SECTIONS);
      removeCachedData(CACHE_KEYS.LANDING_SECTIONS);
      removeCachedData(CACHE_KEYS.LANDING_SECTIONS_FULL);
      setEditingSections((prev) =>
        prev.map((s) => (s._id === updated._id ? { ...s, ...updated, enabled: s.enabled } : s))
      );
      setAllSections((prev) =>
        prev.map((s) => (s._id === updated._id ? { ...s, ...updated } : s)).sort((a, b) => a.order - b.order)
      );
      await loadSections();
      success(checked ? "Section will show in the navbar Other menu." : "Section hidden from the navbar Other menu.");
    } catch (err) {
      console.error("Failed to update navbar visibility:", err);
      error("Failed to update navbar visibility.");
    }
  };

  const handleRemoveFromList = (id: string) => {
    setEditingSections((prev) => prev.filter((sec) => sec._id !== id));
  };

  const handleOpenAddModal = () => {
    setSelectedToAdd(new Set());
    setShowAddModal(true);
  };

  const handleToggleSelectToAdd = (id: string) => {
    setSelectedToAdd((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleConfirmAdd = () => {
    if (selectedToAdd.size === 0) {
      setShowAddModal(false);
      return;
    }

    const currentIds = new Set(editingSections.map((s) => s._id));
    const toAdd = allSections.filter(
      (s) => selectedToAdd.has(s._id) && !currentIds.has(s._id)
    );

    const nextEditing = [...editingSections, ...toAdd].sort(
      (a, b) => a.order - b.order
    );

    setEditingSections(nextEditing);
    setShowAddModal(false);
    setSelectedToAdd(new Set());
  };

  const handleOpenCustomModal = () => {
    setCustomSectionName("");
    setShowCustomModal(true);
  };

  const handleOpenEditSection = (section: LandingSectionItem) => {
    if (isCatalogStyleLandingSectionId(section.sectionId)) return;
    const fresh = allSections.find((s) => s._id === section._id) ?? section;
    setEditSection(fresh);
    setEditLabel(fresh.label ?? "");
    setEditCode(typeof fresh.code === "string" ? fresh.code : "");
    setEditContentFields(mergeContentForEditor(fresh.sectionId, fresh.contentJson));
  };

  const handleCloseEditSection = () => {
    setEditSection(null);
    setEditLabel("");
    setEditCode("");
    setEditContentFields({});
  };

  const handleSaveEditSection = async () => {
    if (!editSection || isSavingEdit) return;
    const name = editLabel.trim();
    if (!name) {
      error("Section name is required.");
      return;
    }
    setIsSavingEdit(true);
    try {
      const defs = getEditFieldDefsForSection(editSection.sectionId);
      const payload: {
        label: string;
        code: string;
        contentJson?: string;
      } = { label: name, code: editCode };
      if (defs.length > 0) {
        payload.contentJson = packContentForSave(editSection.sectionId, editContentFields);
      }
      const updated = await updateLandingSection(editSection._id, payload);
      removeCachedData(CACHE_KEYS.ENABLED_LANDING_SECTIONS);
      removeCachedData(CACHE_KEYS.LANDING_SECTIONS);
      removeCachedData(CACHE_KEYS.LANDING_SECTIONS_FULL);
      setEditingSections((prev) =>
        prev.map((s) => (s._id === updated._id ? { ...updated, enabled: s.enabled } : s))
      );
      await loadSections();
      success("Section updated.");
      handleCloseEditSection();
    } catch (err) {
      console.error("Failed to update section:", err);
      error("Failed to update section.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCreateCustomSection = async () => {
    const name = customSectionName.trim();
    if (!name || isCreatingCustom) return;
    setIsCreatingCustom(true);
    try {
      const newSection = await createLandingSection(name);
      setAllSections((prev) => [...prev, newSection].sort((a, b) => a.order - b.order));
      setEditingSections((prev) =>
        [...prev, { ...newSection, enabled: true }].sort((a, b) => a.order - b.order)
      );
      success(`Custom section "${newSection.label}" created. Add HTML via Sp Builder → Edit on the section.`);
      setShowCustomModal(false);
      setShowAddModal(false);
      setCustomSectionName("");
    } catch (err) {
      console.error("Failed to create custom section:", err);
      error("Failed to create custom section.");
    } finally {
      setIsCreatingCustom(false);
    }
  };

  const handleUpdate = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const enabledIds = new Set(
        editingSections.filter((s) => s.enabled).map((s) => s._id)
      );

      // Compute a new global order based on the current editing list order.
      // Sections in the editing list come first (in their visual order),
      // followed by any remaining sections.
      const editingIdSet = new Set(editingSections.map((s) => s._id));
      const orderedCombined: LandingSectionItem[] = [
        ...editingSections,
        ...allSections.filter((s) => !editingIdSet.has(s._id)),
      ];

      const newOrderMap: Record<string, number> = {};
      orderedCombined.forEach((section, index) => {
        newOrderMap[section._id] = index;
      });

      // Build list of updates only where enabled/order actually change
      const updates = allSections.map(async (section) => {
        const shouldBeEnabled = enabledIds.has(section._id);
        const newOrder = newOrderMap[section._id] ?? section.order;

        const payload: { enabled?: boolean; order?: number } = {};
        if (section.enabled !== shouldBeEnabled) {
          payload.enabled = shouldBeEnabled;
        }
        if (section.order !== newOrder) {
          payload.order = newOrder;
        }

        if (Object.keys(payload).length === 0) return;

        return updateLandingSection(section._id, payload);
      });

      await Promise.all(updates);

      removeCachedData(CACHE_KEYS.ENABLED_LANDING_SECTIONS);
      removeCachedData(CACHE_KEYS.LANDING_SECTIONS);
      removeCachedData(CACHE_KEYS.LANDING_SECTIONS_FULL);

      success("SpFolio updated. Sections on the site are refreshed.");

      // Refresh source data & baseline
      await loadSections();

      const newEnabledIds = Array.from(enabledIds);
      setOriginalEnabledIds(newEnabledIds);
      setIsBuilderMode(false);
    } catch (err) {
      console.error("Failed to update landing sections from SpFolio:", err);
      error("Failed to update SpFolio sections.");
    } finally {
      setIsSaving(false);
    }
  };

  const availableToAdd = allSections.filter(
    (s) => !editingSections.some((e) => e._id === s._id)
  );

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold theme-heading">SpFolio</h1>
        {!isBuilderMode && (
          <button
            onClick={handleEnterBuilder}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors theme-button"
          >
            <LayoutTemplate className="w-4 h-4" />
            Sp Builder
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutTemplate className="w-5 h-5 theme-text-primary" />
            <div>
              <h2 className="font-semibold theme-heading">
                SpFolio - Client
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Manage which sections appear on the Second Landing page.
              </p>
            </div>
          </div>

          {isBuilderMode && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleDiscard}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
              >
                Discard
              </button>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
              <button
                onClick={handleUpdate}
                disabled={isSaving}
                className="px-4 py-2 text-sm rounded-lg text-white theme-button flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving && <CircularLoader size={14} color="white" />}
                Update
              </button>
            </div>
          )}
        </div>

        {/* Body - fills remaining viewport height, scrolls when content overflows */}
        <div className="divide-y divide-gray-100 max-h-[calc(100vh-220px)] min-h-[300px] overflow-y-auto">
          {!isBuilderMode && editingSections.length === 0 && (
            <div className="px-6 py-10 text-center text-gray-500">
              <p className="mb-2 font-medium">
                No SpFolio sections configured yet.
              </p>
              <p className="text-sm">
                Click <span className="font-semibold">Sp Builder</span> to
                start selecting sections for the Second Landing page.
              </p>
            </div>
          )}

          {!isBuilderMode && editingSections.length > 0 && (
            editingSections.map((section) => (
              <div
                key={section._id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{section.label}</h3>
                  <p className="text-sm text-gray-500">
                    {section.sectionId}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {section.enabled ? "Visible on site" : "Hidden on site"}
                </div>
              </div>
            ))
          )}

          {isBuilderMode && (
            <>
              {editingSections.length === 0 ? (
                <div className="px-6 py-10 text-center text-gray-500">
                  <p className="mb-2 font-medium">
                    No sections in this SpFolio.
                  </p>
                  <p className="text-sm">
                    Use <span className="font-semibold">Add Section</span> to
                    bring in blocks from the Second Landing page.
                  </p>
                </div>
              ) : (
                editingSections.map((section) => (
                  <div
                    key={section._id}
                    className={`flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors ${
                      draggingId === section._id ? "bg-gray-100 opacity-90" : ""
                    } ${draggingId ? "cursor-grabbing" : "cursor-grab"}`}
                    draggable
                    onDragStart={(e) => {
                      setDraggingId(section._id);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", section._id);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!draggingId || draggingId === section._id) return;
                      setEditingSections((prev) => {
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
                        className="p-1 text-gray-400 hover:text-gray-600 cursor-grab"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {section.label}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {section.sectionId}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Toggle switch (local while editing) */}
                      <button
                        onClick={() => handleToggleEditingSection(section._id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          section.enabled ? "" : "bg-gray-300"
                        }`}
                        style={
                          section.enabled
                            ? { backgroundColor: "var(--theme-primary)" }
                            : {}
                        }
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            section.enabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>

                      {/* Action dropdown for list-only delete */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            title="More actions"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          side="bottom"
                          sideOffset={4}
                          className="bg-white border rounded-md shadow-md text-gray-900 min-w-[160px]"
                        >
                          {!isCatalogStyleLandingSectionId(section.sectionId) && (
                            <DropdownMenuItem
                              className="cursor-pointer text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"
                              onClick={() => handleOpenEditSection(section)}
                            >
                              Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="cursor-default focus:bg-gray-50"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <div className="flex items-center justify-between gap-4 w-full py-0.5">
                              <span className="flex flex-col gap-0.5 text-left min-w-0">
                                <span className="text-sm text-gray-900">Show in navbar</span>
                                <span className="text-xs font-normal text-gray-500">
                                  Other pages dropdown & mobile submenu (Home, About, Portfolio, Contact, etc. follow enabled sections)
                                </span>
                              </span>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={section.showInNavbarDropdown !== false}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const next = !(section.showInNavbarDropdown !== false);
                                  handleToggleNavbarDropdown(section, next);
                                }}
                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                  section.showInNavbarDropdown !== false ? "" : "bg-gray-300"
                                }`}
                                style={
                                  section.showInNavbarDropdown !== false
                                    ? { backgroundColor: "var(--theme-primary)" }
                                    : undefined
                                }
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    section.showInNavbarDropdown !== false ? "translate-x-6" : "translate-x-1"
                                  }`}
                                />
                              </button>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:bg-red-50"
                            onClick={() => handleRemoveFromList(section._id)}
                          >
                            Delete from SpFolio
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Section Modal */}
      {isBuilderMode && showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Sections from Second Landing
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {availableToAdd.length === 0 ? (
              <p className="text-sm text-gray-500">
                All available sections are already in this SpFolio.
              </p>
            ) : (
              <div className="space-y-3">
                {availableToAdd.map((section) => {
                  const selected = selectedToAdd.has(section._id);
                  return (
                    <label
                      key={section._id}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        selected
                          ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/5"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex-1 mr-3">
                        <div className="font-medium text-gray-900 text-sm">
                          {section.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {section.sectionId}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => handleToggleSelectToAdd(section._id)}
                        className="w-4 h-4 border-gray-300 rounded"
                        style={{ accentColor: "var(--theme-primary)" }}
                      />
                    </label>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col gap-4 mt-6">
              <button
                type="button"
                onClick={handleOpenCustomModal}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Code2 className="w-4 h-4" />
                Custom
              </button>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAdd}
                  className="px-4 py-2 text-sm text-white rounded-lg theme-button disabled:opacity-50"
                  disabled={availableToAdd.length === 0}
                >
                  Add Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Section Modal (nested) */}
      {/* Edit section (static / custom — not catalog-style grids) */}
      {editSection && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit section</h3>
              <button
                type="button"
                onClick={handleCloseEditSection}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              <span className="font-medium text-gray-700">Section label</span> — used in the navbar{" "}
              <span className="font-medium">Other</span> menu (for sections not in the main links) and in builder lists.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section label</label>
            <input
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent mb-4"
            />
            {getEditFieldDefsForSection(editSection.sectionId).map((field) => (
              <div key={field.key} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                {field.multiline ? (
                  <textarea
                    value={editContentFields[field.key] ?? ""}
                    onChange={(e) =>
                      setEditContentFields((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    rows={
                      field.key === "bullets" || field.key === "features"
                        ? 5
                        : field.key === "logoSlides" || field.key === "statsLines"
                          ? 8
                          : 4
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent resize-y min-h-[80px]"
                  />
                ) : (
                  <input
                    type="text"
                    value={editContentFields[field.key] ?? ""}
                    onChange={(e) =>
                      setEditContentFields((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
                  />
                )}
              </div>
            ))}
            {getEditFieldDefsForSection(editSection.sectionId).length > 0 ? (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Optional: full HTML override
                </label>
                <p className="text-xs text-gray-500 mb-1">
                  If filled, this replaces the entire section (the fields above are ignored until this is cleared).
                </p>
                <textarea
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  rows={6}
                  placeholder="Leave empty to use the fields above."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent resize-y min-h-[80px]"
                />
              </>
            ) : (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">HTML content</label>
                <textarea
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  rows={12}
                  placeholder="Your custom section HTML"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent resize-y min-h-[160px]"
                />
              </>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={handleCloseEditSection}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditSection}
                disabled={!editLabel.trim() || isSavingEdit}
                className="px-4 py-2 text-sm text-white rounded-lg theme-button disabled:opacity-50 flex items-center gap-2"
              >
                {isSavingEdit && <CircularLoader size={14} color="white" />}
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {showCustomModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Create Custom Section
              </h3>
              <button
                onClick={() => {
                  setShowCustomModal(false);
                  setCustomSectionName("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Enter a name for your custom section. Add HTML in SpFolio (Sp Builder → Edit on the section).
            </p>
            <input
              type="text"
              value={customSectionName}
              onChange={(e) => setCustomSectionName(e.target.value)}
              placeholder="e.g. My Special Banner"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowCustomModal(false);
                  setCustomSectionName("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomSection}
                disabled={!customSectionName.trim() || isCreatingCustom}
                className="px-4 py-2 text-sm text-white rounded-lg theme-button disabled:opacity-50 flex items-center gap-2"
              >
                {isCreatingCustom && <CircularLoader size={14} color="white" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

