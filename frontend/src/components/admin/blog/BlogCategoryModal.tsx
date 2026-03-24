import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBlogCategory, updateBlogCategory } from "@/api/blog.api";
import { useToast } from "@/components/ui/toast";

interface Category {
  id?: string;
  _id?: string;
  name: string;
  blogs: number;
}

interface BlogCategoryModalProps {
  open: boolean;
  mode: "add" | "edit" | "view";
  data?: Category;
  catalogType?: string;
  typeLabel?: string;
  onClose: () => void;
  onSubmit: () => void;
}

export default function BlogCategoryModal({
  open,
  mode,
  data,
  catalogType = "blog",
  typeLabel = "Blog",
  onClose,
  onSubmit,
}: BlogCategoryModalProps) {
  const { success, error } = useToast();
  const isView = mode === "view";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: data?.name || "",
  });

  useEffect(() => {
    setForm({
      name: data?.name || "",
    });
  }, [data, open]);

  const handleSubmit = async () => {
    if (isView) {
      onClose();
      return;
    }

    if (!form.name.trim()) {
      error("Category name is required");
      return;
    }

    try {
      setLoading(true);
      if (mode === "add") {
        await createBlogCategory({ name: form.name, catalogType });
        success("Category created successfully!");
      } else if (mode === "edit" && data?.id) {
        await updateBlogCategory(data.id, { name: form.name });
        success("Category updated successfully!");
      }
      onSubmit();
      onClose();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold theme-heading">
            {mode === "add" ? `Add ${typeLabel} Category` : mode === "edit" ? "Edit Category" : "View Category"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" ? `Create a new ${typeLabel.toLowerCase()} category` : mode === "edit" ? "Update category details" : "View category details"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-gray-900">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Category Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter category name"
              disabled={isView}
              className="w-full text-gray-900"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isView ? "Close" : "Cancel"}
          </Button>
          {!isView && (
            <Button className="theme-button text-white" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : mode === "add" ? "Add" : "Update"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
