import React, { useEffect, useState } from "react";
import { RichTextEditor } from "@mantine/rte";
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
import ImageCropperModal from "@/components/admin/product/ImageCropperModal";
import { getBlogCategories, getBlogNiches, getBlogAuthors } from "@/api/blog.api";
import { createBlog, updateBlog } from "@/api/blog.api";
import { createApplication, updateApplication } from "@/api/application.api";
import { useToast } from "@/components/ui/toast";

interface Blog {
  id?: string;
  _id?: string;
  title: string;
  subTag?: string;
  description?: string;
  image?: string;
  category: string | { _id: string; name: string };
  niche?: string | { _id: string; name: string };
  author: string | { _id: string; name: string; email: string; avatar?: string };
  tags?: string[];
  status: "published" | "unpublished" | "draft";
  views?: number;
  shares?: number;
  comments?: number;
  links?: number;
}

interface BlogModalProps {
  open: boolean;
  mode: "add" | "edit" | "view";
  data?: Blog;
  catalogType?: string;
  typeLabel?: string;
  onClose: () => void;
  onSubmit: () => void;
}

export default function BlogModal({ open, mode, data, catalogType = "blog", typeLabel = "Blog", onClose, onSubmit }: BlogModalProps) {
  const { success, error } = useToast();
  const isView = mode === "view";
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [niches, setNiches] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedFileForCrop, setSelectedFileForCrop] = useState<File | null>(null);
  const isApplication = catalogType === "applications";

  const getCategoryId = (cat: string | { _id: string; name: string } | undefined): string => {
    if (!cat) return "";
    return typeof cat === "object" ? cat._id : cat;
  };

  const getNicheId = (niche: string | { _id: string; name: string } | undefined): string => {
    if (!niche) return "";
    return typeof niche === "object" ? niche._id : niche;
  };

  const getAuthorId = (author: string | { _id: string; name: string; email: string; avatar?: string } | undefined): string => {
    if (!author) return "";
    return typeof author === "object" ? author._id : author;
  };

  const [form, setForm] = useState({
    title: data?.title || "",
    subTag: data?.subTag || "",
    description: data?.description || "",
    image: data?.image || "",
    category: getCategoryId(data?.category),
    niche: getNicheId(data?.niche),
    author: getAuthorId(data?.author),
    tags: data?.tags?.join(", ") || "",
    status: data?.status || "draft",
    imageFile: null as File | null,
    shortDescription: (data as any)?.shortDescription || "",
    latestVersionLabel: (data as any)?.latestVersionLabel || "",
    latestVersionSize: (data as any)?.latestVersionSize || "",
    downloadsList: ((data as any)?.downloadsList || []) as Array<{
      type: string;
      label: string;
      url: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      file?: File | null;
    }>,
  });

  useEffect(() => {
    if (open) {
      fetchData();
      setForm({
        title: data?.title || "",
        subTag: data?.subTag || "",
        description: data?.description || "",
        image: data?.image || "",
        category: getCategoryId(data?.category),
        niche: getNicheId(data?.niche),
        author: getAuthorId(data?.author),
        tags: data?.tags?.join(", ") || "",
        status: data?.status || "draft",
        imageFile: null,
        shortDescription: (data as any)?.shortDescription || "",
        latestVersionLabel: (data as any)?.latestVersionLabel || "",
        latestVersionSize: (data as any)?.latestVersionSize || "",
        downloadsList: ((data as any)?.downloadsList || []).map((x: any) => ({ ...x, file: null })),
      });
    }
  }, [open, data, catalogType]);

  useEffect(() => {
    if (form.category) {
      fetchNiches(form.category);
    } else {
      setNiches([]);
    }
  }, [form.category]);

  const fetchData = async () => {
    try {
      const [cats, auths] = await Promise.all([getBlogCategories(catalogType), getBlogAuthors(catalogType)]);
      setCategories(Array.isArray(cats) ? cats : []);
      setAuthors(Array.isArray(auths) ? auths : []);
      if (form.category) {
        const nics = await getBlogNiches(form.category, catalogType);
        setNiches(Array.isArray(nics) ? nics : []);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      error("Failed to load categories or authors");
    }
  };

  const fetchNiches = async (categoryId: string) => {
    try {
      if (!categoryId) {
        setNiches([]);
        return;
      }
      const nics = await getBlogNiches(categoryId, catalogType);
      setNiches(Array.isArray(nics) ? nics : []);
    } catch (err) {
      console.error("Failed to fetch niches:", err);
      setNiches([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileForCrop(file);
    setCropModalOpen(true);
  };

  const handleCropDone = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], "blog-image.jpg", { type: "image/jpeg" });
    setForm({ ...form, imageFile: file, image: URL.createObjectURL(croppedBlob) });
    setCropModalOpen(false);
    setSelectedFileForCrop(null);
  };

  const handleSubmit = async () => {
    if (isView) {
      onClose();
      return;
    }

    if (!form.title.trim()) {
      error("Title is required");
      return;
    }
    if (!form.description.trim()) {
      error("Description is required");
      return;
    }
    if (!form.category) {
      if (!isApplication) {
        error("Category is required");
        return;
      }
    }
    if (!form.author) {
      if (!isApplication) {
        error("Author is required");
        return;
      }
    }

    try {
      setLoading(true);
      const tagsArray = form.tags
        ? form.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : [];

      if (isApplication) {
        const appPayload = {
          title: form.title,
          subTag: form.subTag,
          shortDescription: form.shortDescription,
          description: form.description,
          tags: tagsArray,
          status: form.status,
          imageFile: form.imageFile || undefined,
          latestVersionLabel: form.latestVersionLabel,
          latestVersionSize: form.latestVersionSize,
          downloadsList: form.downloadsList.map((x) => ({
            type: x.type || "other",
            label: x.label || "",
            url: x.url || "",
            fileUrl: x.fileUrl || "",
            fileName: x.fileName || "",
            fileSize: x.fileSize || 0,
            file: x.file || undefined,
          })),
        };
        if (mode === "add") {
          await createApplication(appPayload);
          success(`${typeLabel} created successfully!`);
        } else if (mode === "edit" && (data?.id || data?._id)) {
          const appId = data?.id || data?._id;
          if (appId) {
            await updateApplication(appId, appPayload);
            success(`${typeLabel} updated successfully!`);
          }
        }
      } else {
        const blogData = {
          catalogType,
          title: form.title,
          subTag: form.subTag,
          description: form.description,
          category: form.category,
          niche: form.niche || undefined,
          author: form.author,
          tags: tagsArray,
          status: form.status,
          imageFile: form.imageFile || undefined,
        };

        if (mode === "add") {
          await createBlog(blogData);
          success(`${typeLabel} created successfully!`);
        } else if (mode === "edit" && (data?.id || data?._id)) {
          const blogId = data.id || data._id;
          if (blogId) {
            await updateBlog(blogId, blogData);
            success(`${typeLabel} updated successfully!`);
          }
        }
      }

      // Reset form
      setForm({
        title: "",
        subTag: "",
        description: "",
        image: "",
        category: "",
        niche: "",
        author: "",
        tags: "",
        status: "draft",
        imageFile: null,
        shortDescription: "",
        latestVersionLabel: "",
        latestVersionSize: "",
        downloadsList: [],
      });
      
      onClose();
      // Call onSubmit after a small delay to ensure modal is closed
      setTimeout(() => {
        onSubmit();
      }, 100);
    } catch (err: any) {
      error(err.response?.data?.message || `Failed to save ${typeLabel.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl w-full h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold theme-heading">
              {mode === "add" ? `Add ${typeLabel}` : mode === "edit" ? `Edit ${typeLabel}` : `View ${typeLabel}`}
            </DialogTitle>
            <DialogDescription>
              {mode === "add" ? `Create a new ${typeLabel.toLowerCase()}` : mode === "edit" ? `Update ${typeLabel.toLowerCase()} details` : `View ${typeLabel.toLowerCase()} details`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-gray-900">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={`Enter ${typeLabel.toLowerCase()} title`}
                disabled={isView}
                className="w-full text-gray-900"
              />
            </div>

            {/* Sub Tag and Category in same row */}
            {!isApplication && <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Sub Tag</label>
                <Input
                  value={form.subTag}
                  onChange={(e) => setForm({ ...form, subTag: e.target.value })}
                  placeholder="Enter sub tag"
                  disabled={isView}
                  className="w-full text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Category</label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value, niche: "" })}
                  disabled={isView}
                >
                  <SelectTrigger className="text-gray-900">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categories.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">No categories available</div>
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
            </div>}

            {/* Sub Niche */}
            {!isApplication && form.category && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Sub Niche (Optional)</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      value={form.niche || undefined}
                      onValueChange={(value) => setForm({ ...form, niche: value })}
                      disabled={isView}
                    >
                    <SelectTrigger className="text-gray-900">
                      <SelectValue placeholder="Select niche (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {niches.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">No niches available for this category</div>
                      ) : (
                        niches.map((niche) => (
                          <SelectItem key={niche._id || niche.id} value={niche._id || niche.id} className="text-gray-900">
                            {niche.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  </div>
                  {form.niche && !isView && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setForm({ ...form, niche: "" })}
                      className="text-gray-900"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Rich Body */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Rich Body</label>
              <RichTextEditor
                value={form.description}
                onChange={(value) => setForm({ ...form, description: value })}
                readOnly={isView}
                className="w-full bg-white text-gray-900"
              />
            </div>

            {isApplication && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Short Description</label>
                  <Input
                    value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                    placeholder="Small description for app tiles"
                    disabled={isView}
                    className="w-full text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900">Latest Version Label</label>
                    <Input
                      value={form.latestVersionLabel}
                      onChange={(e) => setForm({ ...form, latestVersionLabel: e.target.value })}
                      placeholder="APK - v35MB"
                      disabled={isView}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900">Latest Version Size</label>
                    <Input
                      value={form.latestVersionSize}
                      onChange={(e) => setForm({ ...form, latestVersionSize: e.target.value })}
                      placeholder="35MB"
                      disabled={isView}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-900">Download Options</label>
                    {!isView && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setForm({
                            ...form,
                            downloadsList: [...form.downloadsList, { type: "other", label: "", url: "", file: null }],
                          })
                        }
                      >
                        + Add Option
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {form.downloadsList.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-2">
                          <Select
                            value={item.type || "other"}
                            onValueChange={(value) => {
                              const next = [...form.downloadsList];
                              next[idx] = { ...next[idx], type: value };
                              setForm({ ...form, downloadsList: next });
                            }}
                            disabled={isView}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-white">
                              {["apk", "ios", "windows", "website", "exe", "other"].map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3">
                          <Input
                            value={item.label || ""}
                            onChange={(e) => {
                              const next = [...form.downloadsList];
                              next[idx] = { ...next[idx], label: e.target.value };
                              setForm({ ...form, downloadsList: next });
                            }}
                            placeholder="Label"
                            disabled={isView}
                          />
                        </div>
                        <div className="col-span-4">
                          <Input
                            value={item.url || ""}
                            onChange={(e) => {
                              const next = [...form.downloadsList];
                              next[idx] = { ...next[idx], url: e.target.value };
                              setForm({ ...form, downloadsList: next });
                            }}
                            placeholder="URL (website/store)"
                            disabled={isView}
                          />
                        </div>
                        <div className="col-span-2">
                          {!isView && (
                            <input
                              type="file"
                              onChange={(e) => {
                                const f = e.target.files?.[0] || null;
                                const next = [...form.downloadsList];
                                next[idx] = { ...next[idx], file: f, fileName: f?.name || item.fileName || "" };
                                setForm({ ...form, downloadsList: next });
                              }}
                            />
                          )}
                          {isView && <span className="text-xs text-gray-600 truncate">{item.fileName || "-"}</span>}
                        </div>
                        <div className="col-span-1">
                          {!isView && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const next = form.downloadsList.filter((_, i) => i !== idx);
                                setForm({ ...form, downloadsList: next });
                              }}
                            >
                              X
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Image</label>
              <div className="flex items-center gap-4">
                {form.image && (
                  <img
                    src={form.image}
                    alt={typeLabel}
                    className="w-48 aspect-[16/9] object-cover rounded border"
                  />
                )}
                {!isView && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="blog-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("blog-image-upload")?.click()}
                    >
                      {form.image ? "Change Image" : "Upload Image"}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Author and Status */}
            <div className={`grid ${isApplication ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
              {!isApplication && <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Author</label>
                <Select
                  value={form.author}
                  onValueChange={(value) => setForm({ ...form, author: value })}
                  disabled={isView}
                >
                  <SelectTrigger className="text-gray-900">
                    <SelectValue placeholder="Select author" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {authors.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">No authors available</div>
                    ) : (
                      authors.map((author) => (
                        <SelectItem key={author._id || author.id} value={author._id || author.id} className="text-gray-900">
                          {author.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Status</label>
                <Select
                  value={form.status}
                  onValueChange={(value: any) => setForm({ ...form, status: value })}
                  disabled={isView}
                >
                  <SelectTrigger className="text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="draft" className="text-gray-900">Draft</SelectItem>
                    <SelectItem value="published" className="text-gray-900">Published</SelectItem>
                    <SelectItem value="unpublished" className="text-gray-900">Unpublished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Tags (comma separated)</label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
                disabled={isView}
                className="w-full text-gray-900"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              {isView ? "Close" : "Discard"}
            </Button>
            {!isView && (
              <Button
                className="theme-button text-white"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Saving..." : mode === "add" ? `Add ${typeLabel}` : "Update"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImageCropperModal
        open={cropModalOpen}
        onClose={() => {
          setCropModalOpen(false);
          setSelectedFileForCrop(null);
        }}
        onCropDone={handleCropDone}
        file={selectedFileForCrop || null}
        aspect={16 / 9}
      />
    </>
  );
}
