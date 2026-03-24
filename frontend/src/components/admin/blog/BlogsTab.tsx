import React, { useEffect, useState } from "react";
import EnhancedDataTable from "../../../pages/admin/components/table/EnhancedDataTable";
import { DataTableSkeleton } from "@/components/ui/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FilterTabs from "@/components/ui/FilterTabs";
import { List, Grid } from "lucide-react";
import BlogModal from "./BlogModal";
import BlogGrid from "./BlogGrid";
import { getBlogs, deleteBlog } from "@/api/blog.api";
import { useToast } from "@/components/ui/toast";
import DeleteModal from "@/components/admin/product/DeleteModal";

interface Blog {
  id?: string;
  _id?: string;
  title: string;
  subTag?: string;
  description?: string;
  image?: string;
  category: string | { _id: string; name: string };
  categoryName?: string;
  niche?: string | { _id: string; name: string };
  nicheName?: string;
  author: string | { _id: string; name: string; email: string; avatar?: string };
  authorName?: string;
  tags?: string[];
  status: "published" | "unpublished" | "draft";
  views: number;
  shares?: number;
  comments: number;
  links?: number;
}

interface BlogsTabProps {
  catalogType?: string;
  typeLabel?: string;
}

export default function BlogsTab({ catalogType = "blog", typeLabel = "Blog" }: BlogsTabProps) {
  const { success, error } = useToast();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filtered, setFiltered] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selected, setSelected] = useState<Blog | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, [statusFilter, catalogType]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await getBlogs(statusFilter === "all" ? undefined : statusFilter, catalogType);
      const mapped = data.map((blog: any) => ({
        id: blog._id || blog.id,
        _id: blog._id || blog.id,
        title: blog.title || "",
        subTag: blog.subTag || "",
        description: blog.description || "",
        image: blog.image || "",
        category: typeof blog.category === "object" ? blog.category._id : blog.category,
        categoryName: typeof blog.category === "object" ? blog.category.name : "",
        niche: blog.niche ? (typeof blog.niche === "object" ? blog.niche._id : blog.niche) : null,
        nicheName: blog.niche ? (typeof blog.niche === "object" ? blog.niche.name : "") : "",
        author: typeof blog.author === "object" ? blog.author._id : blog.author,
        authorName: typeof blog.author === "object" ? blog.author.name : "",
        tags: blog.tags || [],
        status: blog.status || "draft",
        views: blog.views || 0,
        shares: blog.shares || 0,
        comments: blog.comments || 0,
        links: blog.links || 0,
      }));
      setBlogs(mapped);
      setFiltered(mapped);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      error(`Failed to load ${typeLabel.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search) {
      setFiltered(blogs);
      return;
    }
    const filteredBlogs = blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(search.toLowerCase()) ||
        blog.categoryName?.toLowerCase().includes(search.toLowerCase()) ||
        blog.nicheName?.toLowerCase().includes(search.toLowerCase()) ||
        blog.authorName?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(filteredBlogs);
  }, [search, blogs]);

  const openAdd = () => {
    setSelected(null);
    setModalMode("add");
    setModalOpen(true);
  };

  const openEdit = (blog: Blog) => {
    setSelected(blog);
    setModalMode("edit");
    setModalOpen(true);
  };

  const openView = (blog: Blog) => {
    setSelected(blog);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleDeleteClick = (blog: Blog) => {
    setDeleteTarget(blog);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) {
      error("Blog ID is missing!");
      return;
    }

    try {
      await deleteBlog(deleteTarget.id);
      success("Blog deleted successfully!");
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchBlogs();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to delete blog");
    }
  };

  const getColumns = () => {
    return [
      {
        name: "ID",
        selector: (row: Blog) => row.id || row._id || "",
        sortable: true,
        width: "80px",
      },
      {
        name: "Blog Title",
        selector: (row: Blog) => row.title,
        sortable: true,
        wrap: true,
      },
      {
        name: "Category",
        selector: (row: Blog) => row.categoryName || "",
        sortable: true,
      },
      {
        name: "Niche",
        selector: (row: Blog) => row.nicheName || "-",
        sortable: true,
      },
      {
        name: "Author",
        selector: (row: Blog) => row.authorName || "",
        sortable: true,
      },
      {
        name: "Views",
        selector: (row: Blog) => row.views || 0,
        sortable: true,
        width: "80px",
      },
      {
        name: "Comments",
        selector: (row: Blog) => row.comments || 0,
        sortable: true,
        width: "100px",
      },
      {
        name: "Status",
        cell: (row: Blog) => (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              row.status === "published"
                ? "bg-green-100 text-green-800"
                : row.status === "unpublished"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.status}
          </span>
        ),
        sortable: true,
      },
    ];
  };

  const statusTabs = [
    { id: "all", label: "All" },
    { id: "published", label: "Published" },
    { id: "unpublished", label: "Unpublished" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold theme-heading">{typeLabel}</h2>
        <Button className="theme-button text-white" onClick={openAdd}>
          + Add {typeLabel}
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4">
        <FilterTabs tabs={statusTabs} activeTab={statusFilter} onTabChange={setStatusFilter} />
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder={`Search ${typeLabel.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "theme-button text-white" : ""}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "theme-button text-white" : ""}
          >
            <Grid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <DataTableSkeleton rows={8} />
      ) : viewMode === "list" ? (
        <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
          <EnhancedDataTable<Blog>
            columns={getColumns()}
            data={filtered}
            onView={openView}
            onEdit={openEdit}
            onDelete={handleDeleteClick}
            pagination
          />
        </div>
      ) : (
        <BlogGrid blogs={filtered} onView={openView} onEdit={openEdit} onDelete={handleDeleteClick} />
      )}

      {/* Modals */}
      <BlogModal
        open={modalOpen}
        mode={modalMode}
        data={selected || undefined}
        catalogType={catalogType}
        typeLabel={typeLabel}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        onSubmit={async () => {
          setModalOpen(false);
          setSelected(null);
          fetchBlogs();
        }}
      />

      <DeleteModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
        title={`Delete ${typeLabel}`}
        message={`Are you sure you want to delete this ${typeLabel.toLowerCase()}? This action cannot be undone.`}
      />
    </div>
  );
}
