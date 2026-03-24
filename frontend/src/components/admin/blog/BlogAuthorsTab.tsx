import React, { useEffect, useState } from "react";
import EnhancedDataTable from "../../../pages/admin/components/table/EnhancedDataTable";
import { DataTableSkeleton } from "@/components/ui/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BlogAuthorModal from "./BlogAuthorModal";
import { getBlogAuthors, deleteBlogAuthor } from "@/api/blog.api";
import { useToast } from "@/components/ui/toast";
import DeleteModal from "@/components/admin/product/DeleteModal";

interface Author {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  blogs: number;
}

interface BlogAuthorsTabProps {
  catalogType?: string;
  typeLabel?: string;
}

export default function BlogAuthorsTab({ catalogType = "blog", typeLabel = "Blog" }: BlogAuthorsTabProps) {
  const { success, error } = useToast();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [filtered, setFiltered] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selected, setSelected] = useState<Author | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Author | null>(null);

  useEffect(() => {
    fetchAuthors();
  }, [catalogType]);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const data = await getBlogAuthors(catalogType);
      const mapped = data.map((author: any) => ({
        id: author._id,
        _id: author._id,
        name: author.name,
        email: author.email,
        avatar: author.avatar,
        bio: author.bio,
        blogs: author.blogs || 0,
      }));
      setAuthors(mapped);
      setFiltered(mapped);
    } catch (err) {
      console.error("Failed to fetch authors:", err);
      error(`Failed to load ${typeLabel} authors`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search) {
      setFiltered(authors);
      return;
    }
    const filteredAuthors = authors.filter(
      (author) =>
        author.name.toLowerCase().includes(search.toLowerCase()) ||
        author.email.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(filteredAuthors);
  }, [search, authors]);

  const openAdd = () => {
    setSelected(null);
    setModalMode("add");
    setModalOpen(true);
  };

  const openEdit = (author: Author) => {
    setSelected(author);
    setModalMode("edit");
    setModalOpen(true);
  };

  const openView = (author: Author) => {
    setSelected(author);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleDeleteClick = (author: Author) => {
    setDeleteTarget(author);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) {
      error("Author ID is missing!");
      return;
    }

    try {
      await deleteBlogAuthor(deleteTarget.id);
      success("Author deleted successfully!");
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchAuthors();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to delete author");
    }
  };

  const getColumns = () => [
    {
      name: "ID",
      selector: (row: Author) => row.id || row._id || "",
      sortable: true,
      width: "80px",
    },
    {
      name: "Name",
      selector: (row: Author) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row: Author) => row.email,
      sortable: true,
    },
    {
      name: typeLabel,
      selector: (row: Author) => row.blogs || 0,
      sortable: true,
      width: "100px",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold theme-heading">{typeLabel} Author Profile</h2>
        <Button className="theme-button text-white" onClick={openAdd}>
          + Add Author
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Search authors..."
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
          <EnhancedDataTable<Author>
            columns={getColumns()}
            data={filtered}
            onView={openView}
            onEdit={openEdit}
            onDelete={handleDeleteClick}
            pagination
          />
        </div>
      )}

      {/* Modals */}
      <BlogAuthorModal
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
          fetchAuthors();
        }}
      />

      <DeleteModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Author"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
