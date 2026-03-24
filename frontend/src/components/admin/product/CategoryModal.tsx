import React from "react";
import { z, ZodIssue } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageCropperModal from "./ImageCropperModal";

interface Category {
  id?: string;
  name: string;
  icon: string;
  iconFile?: File; 
  products: number;
}

interface CategoryModalProps {
  open: boolean;
  mode: "add" | "edit" | "view";
  data?: Category;
  onClose: () => void;
  onSubmit: (formData: Category) => void;
}

// Zod schema for validation
const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  icon: z.string().min(1, "Icon is required"),
  products: z
    .number()
    .int()
    .nonnegative("Products must be 0 or more")
    .optional(),
});

export default function CategoryModal({
  open,
  mode,
  data,
  onClose,
  onSubmit,
}: CategoryModalProps) {
  const [form, setForm] = React.useState<Category>({
    name: data?.name || "",
    icon: data?.icon || "",
    products: data?.products || 0,
  });

  const [error, setError] = React.useState<{ name?: string; icon?: string; products?: string }>({});
const [cropModalOpen, setCropModalOpen] = React.useState(false);
  const [selectedFileForCrop, setSelectedFileForCrop] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setForm({
      name: data?.name || "",
      icon: data?.icon || "",
      products: data?.products || 0,
    });
    setError({});
  }, [data, open]);

  const isView = mode === "view";

   // open cropper when file selected
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileForCrop(file);
    setCropModalOpen(true);
  };

  // when crop done
  const handleCropDone = (croppedBlob: Blob) => {
  const file = new File([croppedBlob], "category.jpg", {
    type: "image/jpeg",
  });

  setForm(prev => ({
    ...prev,
    iconFile: file,                 // real file
    icon: URL.createObjectURL(file) // preview only
  }));

  setCropModalOpen(false);
};

const handleSubmit = async () => {
  if (isSubmitting) return;
  
  // Validate form
  const updatedForm = { ...form, icon: form.icon || "/category.png" };
  const result = categorySchema.safeParse(updatedForm);
  if (!result.success) {
    const issues: Record<string, string> = {};
    result.error.issues.forEach((err) => {
      const key = err.path[0] as string;
      if (key) issues[key] = err.message;
    });
    setError(issues);
    return;
  }
  
  setIsSubmitting(true);
  try {
    await Promise.resolve(onSubmit(updatedForm));
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={onClose} >
      <DialogContent className=" bg-white text-black">
        <DialogHeader>
          <DialogTitle className="theme-heading">
            {mode === "add" && "Add Category"}
            {mode === "edit" && "Edit Category"}
            {mode === "view" && "View Category"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-900">Name</label>
            <Input
              value={form.name}
              disabled={isView}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={error.name ? "border-red-500" : ""}
            />
            {error.name && <p className="text-red-500 text-sm">{error.name}</p>}
          </div>

          {/* Products */}
          <div>
            <label className="text-sm font-medium text-gray-900">Products</label>
            <Input
              type="number"
              value={form.products}
              disabled={isView}
              onChange={(e) =>
                setForm({ ...form, products: Number(e.target.value) })
              }
              className={error.products ? "border-red-500" : ""}
            />
            {error.products && <p className="text-red-500 text-sm">{error.products}</p>}
          </div>

          {/* Icon */}
          <div>
            <label className="text-sm font-medium text-gray-900">Icon (1:1) *</label>
            {isView ? (
              <img
                src={(form.icon && form.icon.trim() !== "") ? form.icon : "/category.png"}
                alt="icon"
                className="w-24 h-24 object-cover rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== window.location.origin + "/category.png") {
                    target.src = "/category.png";
                  }
                }}
              />
            ) : (
              <>
                <input type="file" accept="image/*" onChange={handleFileSelect} />
                <img
                  src={(form.icon && form.icon.trim() !== "") ? form.icon : "/category.png"}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded mt-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== window.location.origin + "/category.png") {
                      target.src = "/category.png";
                    }
                  }}
                />
              </>
            )}
            {error.icon && <p className="text-red-500 text-sm">{error.icon}</p>}
          </div>
        </div>
 <ImageCropperModal
          open={cropModalOpen}
          file={selectedFileForCrop}
          onClose={() => setCropModalOpen(false)}
          onCropDone={handleCropDone}
          aspect={1} // always 1:1 for category icon
        />
        {!isView && (
          <DialogFooter>
            <Button className="text-white theme-button" onClick={handleSubmit} loading={isSubmitting}>
              {mode === "add" ? "Add" : "Update"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
