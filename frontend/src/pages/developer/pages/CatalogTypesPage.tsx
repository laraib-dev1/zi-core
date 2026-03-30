import React, { useState, useEffect } from "react";
import { FolderTree, Plus, X, Pencil } from "lucide-react";
import {
  getCatalogTypes,
  createCatalogType,
  updateCatalogType,
  deleteCatalogType,
} from "@/api/catalogtype.api";
import { getCachedData, setCachedData, removeCachedData, CACHE_KEYS } from "@/utils/cache";
import { useToast } from "@/components/ui/toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import PageLoader from "@/components/ui/PageLoader";
import CircularLoader from "@/components/ui/CircularLoader";

interface CatalogTypeItem {
  _id: string;
  slug: string;
  label: string;
  showInAdmin: boolean;
  order: number;
}

export default function CatalogTypesPage() {
  const { success, error } = useToast();
  const [types, setTypes] = useState<CatalogTypeItem[]>(() => {
    const cached = getCachedData<CatalogTypeItem[]>(CACHE_KEYS.CATALOG_TYPES_FULL);
    return Array.isArray(cached) ? cached : [];
  });
  const [loading, setLoading] = useState(!getCachedData(CACHE_KEYS.CATALOG_TYPES_FULL));
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<Record<string, boolean>>({});
  const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newType, setNewType] = useState({ slug: "", label: "", showInAdmin: true });
  const [editTypeId, setEditTypeId] = useState<string | null>(null);
  const [editType, setEditType] = useState({ slug: "", label: "", showInAdmin: true });
  const [errors, setErrors] = useState<{ slug?: string; label?: string }>({});

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    if (!getCachedData(CACHE_KEYS.CATALOG_TYPES_FULL)) setLoading(true);
    try {
      const data = await getCatalogTypes();
      setTypes(data);
      setCachedData(CACHE_KEYS.CATALOG_TYPES_FULL, data);
    } catch (err) {
      console.error("Failed to load catalog types:", err);
    } finally {
      setLoading(false);
    }
  };

  const invalidateCatalogCache = () => {
    removeCachedData(CACHE_KEYS.CATALOG_TYPES);
    removeCachedData(CACHE_KEYS.CATALOG_TYPES_FULL);
    removeCachedData(CACHE_KEYS.ENABLED_LANDING_SECTIONS);
    removeCachedData(CACHE_KEYS.LANDING_SECTIONS);
    removeCachedData(CACHE_KEYS.LANDING_SECTIONS_FULL);
  };

  const toggleShow = async (id: string, current: boolean) => {
    if (toggleLoading[id]) return;
    setToggleLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await updateCatalogType(id, { showInAdmin: !current });
      invalidateCatalogCache();
      await loadTypes();
    } catch (err) {
      console.error("Failed to toggle:", err);
    } finally {
      setToggleLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleAdd = async () => {
    const err: { slug?: string; label?: string } = {};
    const slug = (newType.slug || "").trim().toLowerCase().replace(/\s+/g, "-");
    if (!slug) err.slug = "Slug is required";
    if (!(newType.label || "").trim()) err.label = "Label is required";
    setErrors(err);
    if (Object.keys(err).length > 0) {
      error("Please fill required fields.");
      return;
    }
    setIsLoading(true);
    try {
      await createCatalogType({ slug, label: newType.label.trim(), showInAdmin: newType.showInAdmin });
      invalidateCatalogCache();
      success("Catalog type added.");
      await loadTypes();
      setShowAddModal(false);
      setNewType({ slug: "", label: "", showInAdmin: true });
      setErrors({});
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to add catalog type");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm || deleteLoading[deleteConfirm]) return;
    setDeleteLoading((prev) => ({ ...prev, [deleteConfirm]: true }));
    try {
      await deleteCatalogType(deleteConfirm);
      invalidateCatalogCache();
      setDeleteConfirm(null);
      await loadTypes();
      success("Catalog type removed.");
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to delete");
      setDeleteConfirm(null);
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [deleteConfirm]: false }));
    }
  };

  const openEdit = (type: CatalogTypeItem) => {
    setEditTypeId(type._id);
    setEditType({
      slug: type.slug,
      label: type.label,
      showInAdmin: type.showInAdmin,
    });
    setErrors({});
  };

  const handleEditSave = async () => {
    if (!editTypeId) return;
    const err: { slug?: string; label?: string } = {};
    const slug = (editType.slug || "").trim().toLowerCase().replace(/\s+/g, "-");
    if (!slug) err.slug = "Slug is required";
    if (!(editType.label || "").trim()) err.label = "Label is required";
    setErrors(err);
    if (Object.keys(err).length > 0) {
      error("Please fill required fields.");
      return;
    }

    setIsLoading(true);
    try {
      await updateCatalogType(editTypeId, {
        slug,
        label: editType.label.trim(),
        showInAdmin: editType.showInAdmin,
      });
      invalidateCatalogCache();
      await loadTypes();
      setEditTypeId(null);
      success("Catalog type updated.");
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to update catalog type");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-5xl">
      <ConfirmDialog
        open={deleteConfirm !== null}
        title="Delete Catalog Type"
        message="Remove this catalog type? It will no longer appear in the admin Catalog dropdown."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Delete"
        cancelText="Cancel"
      />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold theme-heading">Catalog Types</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors theme-button"
        >
          <Plus size={18} />
          Add Type
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
          <FolderTree className="w-5 h-5 theme-text-primary" />
          <h2 className="font-semibold theme-heading">Types (Projects, Courses, Services, Blog, etc.)</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {types.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">No catalog types yet. Add one to show in the admin Catalog dropdown.</div>
          ) : (
            types.map((t) => (
              <div
                key={t._id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{t.label}</h3>
                  <p className="text-sm text-gray-500">Slug: {t.slug} · Path: /admin/catalog/{t.slug}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => openEdit(t)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit type"
                  >
                    <Pencil size={16} />
                  </button>
                  <span className="text-xs text-gray-500">Show in Admin</span>
                  <button
                    onClick={() => toggleShow(t._id, t.showInAdmin)}
                    disabled={toggleLoading[t._id]}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                      t.showInAdmin ? "" : "bg-gray-300"
                    }`}
                    style={t.showInAdmin ? { backgroundColor: "var(--theme-primary)" } : {}}
                  >
                    {toggleLoading[t._id] ? (
                      <CircularLoader size={12} color="white" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                    ) : (
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                          t.showInAdmin ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(t._id)}
                    disabled={deleteLoading[t._id]}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {deleteLoading[t._id] ? (
                      <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <X size={18} />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Catalog Type</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Label *</label>
                <input
                  type="text"
                  value={newType.label}
                  onChange={(e) => {
                    setNewType((prev) => ({ ...prev, label: e.target.value }));
                    if (errors.label) setErrors((prev) => ({ ...prev, label: undefined }));
                  }}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none ${errors.label ? "border-red-500" : "border-gray-300"}`}
                  placeholder="e.g. Projects"
                />
                {errors.label && <p className="text-red-500 text-xs mt-1">{errors.label}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug * (URL-friendly)</label>
                <input
                  type="text"
                  value={newType.slug}
                  onChange={(e) => {
                    setNewType((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }));
                    if (errors.slug) setErrors((prev) => ({ ...prev, slug: undefined }));
                  }}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none ${errors.slug ? "border-red-500" : "border-gray-300"}`}
                  placeholder="e.g. projects"
                />
                {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newType.showInAdmin}
                  onChange={(e) => setNewType((prev) => ({ ...prev, showInAdmin: e.target.checked }))}
                  className="w-4 h-4 border-gray-300 rounded"
                  style={{ accentColor: "var(--theme-primary)" }}
                />
                <label className="text-sm text-gray-700">Show in Admin Catalog dropdown</label>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-white rounded-lg theme-button disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading && <CircularLoader size={16} color="white" />}
                  Add Type
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editTypeId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Catalog Type</h3>
              <button onClick={() => setEditTypeId(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Label *</label>
                <input
                  type="text"
                  value={editType.label}
                  onChange={(e) => {
                    setEditType((prev) => ({ ...prev, label: e.target.value }));
                    if (errors.label) setErrors((prev) => ({ ...prev, label: undefined }));
                  }}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none ${errors.label ? "border-red-500" : "border-gray-300"}`}
                  placeholder="e.g. Projects"
                />
                {errors.label && <p className="text-red-500 text-xs mt-1">{errors.label}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug * (URL-friendly)</label>
                <input
                  type="text"
                  value={editType.slug}
                  onChange={(e) => {
                    setEditType((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }));
                    if (errors.slug) setErrors((prev) => ({ ...prev, slug: undefined }));
                  }}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none ${errors.slug ? "border-red-500" : "border-gray-300"}`}
                  placeholder="e.g. projects"
                />
                {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editType.showInAdmin}
                  onChange={(e) => setEditType((prev) => ({ ...prev, showInAdmin: e.target.checked }))}
                  className="w-4 h-4 border-gray-300 rounded"
                  style={{ accentColor: "var(--theme-primary)" }}
                />
                <label className="text-sm text-gray-700">Show in Admin Catalog dropdown</label>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setEditTypeId(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-white rounded-lg theme-button disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading && <CircularLoader size={16} color="white" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
