import React, { useEffect, useState } from "react";
import EnhancedDataTable from "../../../pages/admin/components/table/EnhancedDataTable";
import { DataTableSkeleton } from "@/components/ui/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FilterTabs from "@/components/ui/FilterTabs";
import BlogCategoryModal from "./BlogCategoryModal";
import BlogNicheModal from "./BlogNicheModal";
import { getBlogCategories, deleteBlogCategory } from "@/api/blog.api";
import { getBlogNiches, deleteBlogNiche } from "@/api/blog.api";
import { useToast } from "@/components/ui/toast";
import DeleteModal from "@/components/admin/product/DeleteModal";

interface Category {
  id?: string;
  _id?: string;
  name: string;
  blogs: number;
}

interface Niche {
  id?: string;
  _id?: string;
  name: string;
  category: string | { _id: string; name: string };
  categoryName?: string;
  blogs: number;
}

interface BlogCategoriesTabProps {
  catalogType?: string;
  typeLabel?: string;
}

export default function BlogCategoriesTab({ catalogType = "blog", typeLabel = "Blog" }: BlogCategoriesTabProps) {
  const { success, error } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<"categories" | "niches">("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [nicheModalOpen, setNicheModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<"add" | "edit" | "view">("add");
  const [nicheModalMode, setNicheModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedNiche, setSelectedNiche] = useState<Niche | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | Niche | null>(null);
  const [deleteType, setDeleteType] = useState<"category" | "niche">("category");

  useEffect(() => {
    fetchData();
  }, [activeSubTab, catalogType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeSubTab === "categories") {
        const data = await getBlogCategories(catalogType);
        setCategories(Array.isArray(data) ? data.map((cat: any) => ({ id: cat._id, _id: cat._id, name: cat.name, blogs: cat.blogs || 0 })) : []);
      } else {
        const data = await getBlogNiches(undefined, catalogType); // Get all niches for this type
        setNiches(
          Array.isArray(data) ? data.map((niche: any) => ({
            id: niche._id,
            _id: niche._id,
            name: niche.name,
            category: typeof niche.category === "object" ? niche.category._id : niche.category,
            categoryName: typeof niche.category === "object" ? niche.category.name : "",
            blogs: niche.blogs || 0,
          })) : []
        );
      }
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      error(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredNiches = niches.filter(
    (niche) =>
      niche.name.toLowerCase().includes(search.toLowerCase()) ||
      niche.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  const openCategoryAdd = () => {
    setSelectedCategory(null);
    setCategoryModalMode("add");
    setCategoryModalOpen(true);
  };

  const openCategoryEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setCategoryModalMode("edit");
    setCategoryModalOpen(true);
  };

  const openCategoryView = (cat: Category) => {
    setSelectedCategory(cat);
    setCategoryModalMode("view");
    setCategoryModalOpen(true);
  };

  const openNicheAdd = () => {
    setSelectedNiche(null);
    setNicheModalMode("add");
    setNicheModalOpen(true);
  };

  const openNicheEdit = (niche: Niche) => {
    setSelectedNiche(niche);
    setNicheModalMode("edit");
    setNicheModalOpen(true);
  };

  const openNicheView = (niche: Niche) => {
    setSelectedNiche(niche);
    setNicheModalMode("view");
    setNicheModalOpen(true);
  };

  const handleDeleteClick = (item: Category | Niche, type: "category" | "niche") => {
    setDeleteTarget(item);
    setDeleteType(type);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) {
      error("ID is missing!");
      return;
    }

    try {
      if (deleteType === "category") {
        await deleteBlogCategory(deleteTarget.id);
        success("Category deleted successfully!");
      } else {
        await deleteBlogNiche(deleteTarget.id);
        success("Niche deleted successfully!");
      }
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to delete");
    }
  };

  const getCategoryColumns = () => [
    {
      name: "ID",
      selector: (row: Category) => row.id || row._id || "",
      sortable: true,
      width: "80px",
    },
    {
      name: "Category",
      selector: (row: Category) => row.name,
      sortable: true,
    },
    {
      name: typeLabel,
      selector: (row: Category) => row.blogs || 0,
      sortable: true,
      width: "100px",
    },
  ];

  const getNicheColumns = () => [
    {
      name: "ID",
      selector: (row: Niche) => row.id || row._id || "",
      sortable: true,
      width: "80px",
    },
    {
      name: "Niche",
      selector: (row: Niche) => row.name,
      sortable: true,
    },
    {
      name: "Category",
      selector: (row: Niche) => row.categoryName || "",
      sortable: true,
    },
    {
      name: typeLabel,
      selector: (row: Niche) => row.blogs || 0,
      sortable: true,
      width: "100px",
    },
  ];

  const subTabs = [
    { id: "categories", label: "Categories" },
    { id: "niches", label: "Niches" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold theme-heading">{typeLabel} Categories & Niches</h2>
        <Button
          className="theme-button text-white"
          onClick={activeSubTab === "categories" ? openCategoryAdd : openNicheAdd}
        >
          + Add New
        </Button>
      </div>

      {/* Sub Tabs */}
      <div className="mb-4">
        <FilterTabs tabs={subTabs} activeTab={activeSubTab} onTabChange={(tab) => setActiveSubTab(tab as any)} />
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md"
        />
      </div>

      {/* Table */}
      {loading ? (
        <DataTableSkeleton rows={8} />
      ) : (
        <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
          {activeSubTab === "categories" ? (
            <EnhancedDataTable<Category>
              columns={getCategoryColumns()}
              data={filteredCategories}
              onView={openCategoryView}
              onEdit={openCategoryEdit}
              onDelete={(cat) => handleDeleteClick(cat, "category")}
              pagination
            />
          ) : (
            <EnhancedDataTable<Niche>
              columns={getNicheColumns()}
              data={filteredNiches}
              onView={openNicheView}
              onEdit={openNicheEdit}
              onDelete={(niche) => handleDeleteClick(niche, "niche")}
              pagination
            />
          )}
        </div>
      )}

      {/* Modals */}
      <BlogCategoryModal
        open={categoryModalOpen}
        mode={categoryModalMode}
        data={selectedCategory || undefined}
        catalogType={catalogType}
        typeLabel={typeLabel}
        onClose={() => {
          setCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={async () => {
          setCategoryModalOpen(false);
          setSelectedCategory(null);
          fetchData();
        }}
      />

      <BlogNicheModal
        open={nicheModalOpen}
        mode={nicheModalMode}
        data={selectedNiche || undefined}
        catalogType={catalogType}
        typeLabel={typeLabel}
        onClose={() => {
          setNicheModalOpen(false);
          setSelectedNiche(null);
        }}
        onSubmit={async () => {
          setNicheModalOpen(false);
          setSelectedNiche(null);
          fetchData();
        }}
      />

      <DeleteModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
        title={`Delete ${deleteType === "category" ? "Category" : "Niche"}`}
        message={`Are you sure you want to delete this ${typeLabel.toLowerCase()} ${deleteType}? This action cannot be undone.`}
      />
    </div>
  );
}
