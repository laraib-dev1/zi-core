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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBlogNiche, updateBlogNiche, getBlogCategories, getBlogNiches } from "@/api/blog.api";
import { useToast } from "@/components/ui/toast";

interface Niche {
  id?: string;
  _id?: string;
  name: string;
  category: string | { _id: string; name: string };
  categoryName?: string;
  blogs: number;
}

interface BlogNicheModalProps {
  open: boolean;
  mode: "add" | "edit" | "view";
  data?: Niche;
  catalogType?: string;
  typeLabel?: string;
  onClose: () => void;
  onSubmit: () => void;
}

export default function BlogNicheModal({
  open,
  mode,
  data,
  catalogType = "blog",
  typeLabel = "Blog",
  onClose,
  onSubmit,
}: BlogNicheModalProps) {
  const { success, error } = useToast();
  const isView = mode === "view";
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const getCategoryId = (cat: string | { _id: string; name: string } | undefined): string => {
    if (!cat) return "";
    return typeof cat === "object" ? cat._id : cat;
  };

  const [form, setForm] = useState<{ name: string; category: string }>({
    name: data?.name || "",
    category: getCategoryId(data?.category),
  });

  useEffect(() => {
    if (open) {
      fetchCategories();
      setForm({
        name: data?.name || "",
        category: getCategoryId(data?.category),
      });
    }
  }, [data, open]);

  const fetchCategories = async () => {
    try {
      const data = await getBlogCategories(catalogType);
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleSubmit = async () => {
    if (isView) {
      onClose();
      return;
    }

    if (!form.name.trim()) {
      error("Niche name is required");
      return;
    }
    if (!form.category) {
      error("Category is required");
      return;
    }

    try {
      setLoading(true);
      if (mode === "add") {
        await createBlogNiche({ name: form.name, category: form.category, catalogType });
        success("Niche created successfully!");
      } else if (mode === "edit" && data?.id) {
        await updateBlogNiche(data.id, { name: form.name, category: form.category });
        success("Niche updated successfully!");
      }
      onSubmit();
      onClose();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to save niche");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold theme-heading">
            {mode === "add" ? `Add ${typeLabel} Niche` : mode === "edit" ? "Edit Niche" : "View Niche"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" ? `Create a new ${typeLabel.toLowerCase()} niche` : mode === "edit" ? "Update niche details" : "View niche details"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-gray-900">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Niche Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter niche name"
              disabled={isView}
              className="w-full text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Category</label>
            <Select
              value={form.category}
              onValueChange={(value) => setForm({ ...form, category: value })}
              disabled={isView}
            >
              <SelectTrigger className="text-gray-900">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {categories.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-gray-500">No categories available. Please add a category first.</div>
                ) : (
                  categories.map((cat) => (
                    <SelectItem key={cat._id || cat.id} value={cat._id || cat.id} className="text-gray-900">
                      {cat.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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
