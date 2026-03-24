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
import { Textarea } from "@/components/ui/textarea";
import ImageCropperModal from "@/components/admin/product/ImageCropperModal";
import { createBlogAuthor, updateBlogAuthor } from "@/api/blog.api";
import { useToast } from "@/components/ui/toast";

interface Author {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  socialLinks?: {
    facebook?: string;
    tiktok?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    other?: string;
  };
  blogs?: number;
}

interface BlogAuthorModalProps {
  open: boolean;
  mode: "add" | "edit" | "view";
  data?: Author;
  catalogType?: string;
  typeLabel?: string;
  onClose: () => void;
  onSubmit: () => void;
}

export default function BlogAuthorModal({
  open,
  mode,
  data,
  catalogType = "blog",
  typeLabel = "Blog",
  onClose,
  onSubmit,
}: BlogAuthorModalProps) {
  const { success, error } = useToast();
  const isView = mode === "view";
  const [loading, setLoading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedFileForCrop, setSelectedFileForCrop] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: data?.name || "",
    email: data?.email || "",
    bio: data?.bio || "",
    avatar: data?.avatar || "",
    facebook: data?.socialLinks?.facebook || "",
    tiktok: data?.socialLinks?.tiktok || "",
    instagram: data?.socialLinks?.instagram || "",
    youtube: data?.socialLinks?.youtube || "",
    linkedin: data?.socialLinks?.linkedin || "",
    other: data?.socialLinks?.other || "",
    avatarFile: null as File | null,
  });

  useEffect(() => {
    setForm({
      name: data?.name || "",
      email: data?.email || "",
      bio: data?.bio || "",
      avatar: data?.avatar || "",
      facebook: data?.socialLinks?.facebook || "",
      tiktok: data?.socialLinks?.tiktok || "",
      instagram: data?.socialLinks?.instagram || "",
      youtube: data?.socialLinks?.youtube || "",
      linkedin: data?.socialLinks?.linkedin || "",
      other: data?.socialLinks?.other || "",
      avatarFile: null,
    });
  }, [data, open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileForCrop(file);
    setCropModalOpen(true);
  };

  const handleCropDone = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], "author-avatar.jpg", { type: "image/jpeg" });
    setForm({ ...form, avatarFile: file, avatar: URL.createObjectURL(croppedBlob) });
    setCropModalOpen(false);
    setSelectedFileForCrop(null);
  };

  const handleSubmit = async () => {
    if (isView) {
      onClose();
      return;
    }

    if (!form.name.trim()) {
      error("Name is required");
      return;
    }
    if (!form.email.trim()) {
      error("Email is required");
      return;
    }

    try {
      setLoading(true);
      const authorData = {
        catalogType,
        name: form.name,
        email: form.email,
        bio: form.bio,
        facebook: form.facebook,
        tiktok: form.tiktok,
        instagram: form.instagram,
        youtube: form.youtube,
        linkedin: form.linkedin,
        other: form.other,
        avatarFile: form.avatarFile || undefined,
      };

      if (mode === "add") {
        await createBlogAuthor(authorData);
        success("Author created successfully!");
      } else if (mode === "edit" && data?.id) {
        await updateBlogAuthor(data.id, authorData);
        success("Author updated successfully!");
      }
      onSubmit();
      onClose();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to save author");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold theme-heading">
              {mode === "add" ? `Add ${typeLabel} Author` : mode === "edit" ? "Edit Author" : "View Author"}
            </DialogTitle>
            <DialogDescription>
              {mode === "add" ? `Add author for ${typeLabel}` : mode === "edit" ? "Update author details" : "View author details"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-gray-900">
            {/* Author Info */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Author</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Author Name</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter author name"
                    disabled={isView}
                    className="w-full text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Email</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter email"
                    disabled={isView}
                    className="w-full text-gray-900"
                  />
                </div>
              </div>

              {/* Avatar */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-900">Avatar</label>
                <div className="flex items-center gap-4">
                  {form.avatar && (
                    <img
                      src={form.avatar}
                      alt="Author"
                      className="w-24 h-24 object-cover rounded border"
                    />
                  )}
                  {!isView && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="author-avatar-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("author-avatar-upload")?.click()}
                      >
                        {form.avatar ? "Change Image" : "Upload Image"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Bio</label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Enter author bio"
                  disabled={isView}
                  className="w-full text-gray-900"
                  rows={3}
                />
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Social Links</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Facebook</label>
                  <Input
                    value={form.facebook}
                    onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                    placeholder="Facebook URL"
                    disabled={isView}
                    className="w-full text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Tiktok</label>
                  <Input
                    value={form.tiktok}
                    onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                    placeholder="Tiktok URL"
                    disabled={isView}
                    className="w-full text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Instagram</label>
                  <Input
                    value={form.instagram}
                    onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                    placeholder="Instagram URL"
                    disabled={isView}
                    className="w-full text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Youtube</label>
                  <Input
                    value={form.youtube}
                    onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                    placeholder="Youtube URL"
                    disabled={isView}
                    className="w-full text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Linkedin</label>
                  <Input
                    value={form.linkedin}
                    onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                    placeholder="Linkedin URL"
                    disabled={isView}
                    className="w-full text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Other</label>
                  <Input
                    value={form.other}
                    onChange={(e) => setForm({ ...form, other: e.target.value })}
                    placeholder="Other URL"
                    disabled={isView}
                    className="w-full text-gray-900"
                  />
                </div>
              </div>
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
                {loading ? "Saving..." : mode === "add" ? "Add Author" : "Update Profile"}
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
        file={selectedFileForCrop}
        aspect={1}
      />
    </>
  );
}
