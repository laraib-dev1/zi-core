import { RichTextEditor } from "@mantine/rte";
import React, { useEffect, useState } from "react";
import { z, ZodIssue } from "zod";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageCropperModal from "./ImageCropperModal";

interface Category {
  _id: string;
  name: string;
}

type Status = "active" | "inactive";

export interface Product {
  id?: string;
  name: string;
  description: string;
   category: string | Category;
  price: number;
  currency: string;
  status: Status;
  discount?: number;
  // image URLs (if existing)
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
  image6?: string;
  // meta & videos
  metaFeatures?: string;
  metaInfo?: string;
  video1?: string;
  video2?: string;
}

interface ProductModalProps {
  open: boolean;
  mode: "add" | "edit" | "view";
  categories: Category[];
  data?: Product;
  onClose: () => void;
  onSubmit: (formData: ProductForm) => void;
}

export interface ProductForm extends Product {
  // files for upload (keys image1..image6)
  imageFiles?: Partial<Record<`image${1|2|3|4|5|6}`, File>>;
  category: string | Category;
}


const defaultImage = "/product.png";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.number().nonnegative("Price must be 0 or more"),
  currency: z.string().min(1, "Currency is required"),
  status: z.enum(["active", "inactive"]),
  discount: z.number().min(0).max(100).optional(),
  image1: z.string().optional(),
  image2: z.string().optional(),
  image3: z.string().optional(),
  image4: z.string().optional(),
  image5: z.string().optional(),
  image6: z.string().optional(),
  metaFeatures: z.string().optional(),
  metaInfo: z.string().optional(),
  video1: z.string().optional(),
  video2: z.string().optional(),
});

export default function ProductModal({
  open,
  mode,
  categories,
  data,
  onClose,
  onSubmit,
}: ProductModalProps) {
  const isView = mode === "view";
const [cropModalOpen, setCropModalOpen] = useState(false);
const [selectedFileForCrop, setSelectedFileForCrop] = useState<File | null>(null);
const [currentImageKey, setCurrentImageKey] =
  useState<`image${1|2|3|4|5|6}` | null>(null);
const [toggles, setToggles] = useState({
  images: true,
  discount: true,
  metaFeatures: true,
  metaInfo: true,
  videos: true,
});

const toggleSection = (name: keyof typeof toggles) => {
  setToggles(prev => ({ ...prev, [name]: !prev[name] }));
};

  const [form, setForm] = React.useState<ProductForm>({
    name: data?.name || "",
    description: data?.description || "",
    category: typeof data?.category === "object" ? data.category._id : data?.category || (categories[0]?._id ?? ""),
    price: data?.price || 0,
    currency: data?.currency || "PKR",
    status: data?.status || "active",
    discount: data?.discount || 0,
    image1: data?.image1 || "",
    image2: data?.image2 || "",
    image3: data?.image3 || "",
    image4: data?.image4 || "",
    image5: data?.image5 || "",
    image6: data?.image6 || "",
    metaFeatures: data?.metaFeatures || "",
    metaInfo: data?.metaInfo || "",
    video1: data?.video1 || "",
    video2: data?.video2 || "",
    imageFiles: {},
  });
type ImageField = "image1" | "image2" | "image3" | "image4" | "image5" | "image6";

  const [error, setError] = React.useState<Partial<Record<keyof Product, string>>>({});

  React.useEffect(() => {
    setForm({
      name: data?.name || "",
      description: data?.description || "",
      category: typeof data?.category === "object" ? data.category._id : data?.category || (categories[0]?._id ?? ""),
      price: data?.price || 0,
      currency: data?.currency || "PKR",
      status: data?.status || "active",
      discount: data?.discount || 0,
      image1: data?.image1 || "",
      image2: data?.image2 || "",
      image3: data?.image3 || "",
      image4: data?.image4 || "",
      image5: data?.image5 || "",
      image6: data?.image6 || "",
      metaFeatures: data?.metaFeatures || "",
      metaInfo: data?.metaInfo || "",
      video1: data?.video1 || "",
      video2: data?.video2 || "",
      imageFiles: {},
    });
    setError({});
  }, [data, open]);

  // preview URL helper (prefer file preview if present)
  const previewFor = (key: `image${1|2|3|4|5|6}`) =>
    (form.imageFiles && (form.imageFiles as any)[key]
      ? URL.createObjectURL((form.imageFiles as any)[key] as File)
      : (form as any)[key]) || defaultImage;

  // const handleSelectFile = (key: `image${1|2|3|4|5|6}`, file?: File) => {
  //   if (!file) return;
  //   // size check (< 1MB)
  //   if (file.size > 1024 * 1024) {
  //     setError(prev => ({ ...prev, [key]: "Image must be smaller than 1MB" }));
  //     return;
  //   }
  //   // aspect ratio validation via Image
  //   const img = new Image();
  //   img.src = URL.createObjectURL(file);
  //   img.onload = () => {
  //     const aspectRatio = img.width / img.height;
  //     if (Math.abs(aspectRatio - 4 / 3) > 0.02) {
  //       setError(prev => ({ ...prev, [key]: "Image must be 4:3 aspect ratio" }));
  //       return;
  //     }
  //     // ok
  //     setForm(prev => ({
  //       ...prev,
  //       imageFiles: { ...(prev.imageFiles || {}), [key]: file },
  //       // set the preview URL in imageX (only for UI; not necessary but useful)
  //       [key]: URL.createObjectURL(file),
  //     } as ProductForm));
  //     setError(prev => ({ ...prev, [key]: undefined }));
  //   };
  //   img.onerror = () => {
  //     setError(prev => ({ ...prev, [key]: "Invalid image file" }));
  //   };
  // };

  const handleSelectFile = (key: `image${1|2|3|4|5|6}`, file?: File) => {
  if (!file) return;

  setCurrentImageKey(key);       // किस image के लिए crop हो रहा है
  setSelectedFileForCrop(file);  // cropper को भेजने के लिए file
  setCropModalOpen(true);        // modal open
};

  const handleCropDone = (croppedBlob: Blob) => {
  if (!currentImageKey) return;

  const file = new File([croppedBlob], "cropped.jpg", { type: "image/jpeg" });

  // validate size <1MB
  if (file.size > 1024 * 1024) {
    setError(prev => ({ ...prev, [currentImageKey]: "Image must be smaller than 1MB" }));
    return;
  }

  // validate aspect ratio
  const img = new Image();
  const url = URL.createObjectURL(file);

  img.onload = () => {
    const aspectRatio = img.width / img.height;

    if (Math.abs(aspectRatio - 3 / 4) > 0.02) {
      setError(prev => ({ ...prev, [currentImageKey]: "Image must be 3:4 aspect ratio" }));
      return;
    }

    // Save into form
    setForm(prev => ({
      ...prev,
      imageFiles: { ...(prev.imageFiles || {}), [currentImageKey]: file },
      [currentImageKey]: url, // preview
    }));

    setError(prev => ({ ...prev, [currentImageKey]: undefined }));
  };

  img.src = url;

  setCropModalOpen(false);
};

  
  const handleRemoveImage = (key: `image${1|2|3|4|5|6}`) => {
    setForm(prev => {
      const newFiles = { ...(prev.imageFiles || {}) };
      delete (newFiles as any)[key];
      return {
        ...prev,
        imageFiles: newFiles,
        [key]: "", // remove preview / url
      } as ProductForm;
    });
    setError(prev => ({ ...prev, [key]: undefined }));
  };

  const currencies = ["PKR", "USD", "EUR", "GBP", "JPY", "CAD", "AUD"];

// const handleSubmit = () => {
//   const categoryId = typeof form.category === "object" ? form.category._id : form.category;

//   const candidate = { ...form, category: categoryId };

//   const result = productSchema.safeParse(candidate);
//   if (!result.success) {
//     const issues: Partial<Record<keyof Product, string>> = {};
//     result.error.issues.forEach((err: ZodIssue) => {
//       const key = err.path[0] as keyof Product;
//       if (key) issues[key] = err.message;
//     });
//     setError(issues);
//     return;
//   }

//   if (mode === "add") {
//     const hasFile1 = !!(form.imageFiles && (form.imageFiles as any).image1);
//     const hasUrl1 = !!form.image1;
//     if (!hasFile1 && !hasUrl1) {
//       setError(prev => ({ ...prev, image1: "Primary image is required" }));
//       return;
//     }
//   }

//   // ✅ Final payload
//   const payload: ProductForm = {
//     ...form,
//     category: categoryId,       // string ID
//     metaInfo: form.metaInfo,    // HTML string
//   };

//   console.log("Sending payload:", payload);
//   onSubmit(payload);
// };


const handleSubmit = () => {
  // Convert category to string ID if it's an object
  const categoryId = typeof form.category === "object" ? form.category._id : form.category;

  // Prepare candidate for validation
  const candidate = { ...form, category: categoryId };

  // Validate using Zod
  const result = productSchema.safeParse(candidate);
  if (!result.success) {
    const issues: Partial<Record<keyof Product, string>> = {};
    result.error.issues.forEach((err: ZodIssue) => {
      const key = err.path[0] as keyof Product;
      if (key) issues[key] = err.message;
    });
    setError(issues);
    return;
  }

  // Ensure primary image exists in add mode
  if (mode === "add") {
    const hasFile1 = !!(form.imageFiles && (form.imageFiles as any).image1);
    const hasUrl1 = !!form.image1;
    if (!hasFile1 && !hasUrl1) {
      setError(prev => ({ ...prev, image1: "Primary image is required" }));
      return;
    }
  }

  // Final payload
  const payload: ProductForm = {
    ...form,
    category: categoryId,       // string ID
    metaInfo: form.metaInfo,    // HTML string
  };

  console.log("Sending payload:", payload);

  // Call the parent onSubmit
  onSubmit(payload);
};




  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {mode === "add" && "Add Product"}
            {mode === "edit" && "Edit Product"}
            {mode === "view" && "View Product"}
            
          </DialogTitle>
        </DialogHeader>
<DialogDescription className="text-gray-700">
      Fill in all product details below.
    </DialogDescription>
        <div className="p-4 space-y-4">
          {/* Top row: name */}
          <div>
            <label className="text-sm font-medium text-gray-900">Product Title</label>
            <Input
              value={form.name}
              disabled={isView}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={error.name ? "border-red-500" : ""}
            />
            {error.name && <p className="text-red-500 text-sm">{error.name}</p>}
          </div>

          {/* Category / Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-900">Category</label>
              <select
  value={typeof form.category === "string" ? form.category : form.category._id}
  onChange={(e) => setForm({ ...form, category: e.target.value })}
  disabled={isView}
  className="border rounded p-2 w-full"
>
  
  {categories.map((cat) => (
    <option key={cat._id} value={cat._id}>
      {cat.name}
    </option>
  ))}
</select>

              {error.category && <p className="text-red-500 text-sm">{error.category}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">Price</label>
              <Input
                type="number"
                value={form.price}
                disabled={isView}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className={error.price ? "border-red-500" : ""}
              />
              {error.price && <p className="text-red-500 text-sm">{error.price}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                disabled={isView}
                className="border rounded p-2 w-full"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {error.currency && <p className="text-red-500 text-sm">{error.currency}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-900">Description</label>
            <Textarea
              value={form.description}
              disabled={isView}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`w-full text-left min-h-32 ${error.description ? "border-red-500" : ""}`}
            />
            {error.description && <p className="text-red-500 text-sm">{error.description}</p>}
          </div>

          {/* % Off + Sale Rate simplified (left as inputs) */}
          <div className="border-t pt-3">
            <label className="flex items-center gap-2">
             <input
  type="checkbox"
  checked={toggles.discount}
  onChange={() => toggleSection("discount")}
  disabled={isView}
/>

              <span className="text-sm font-medium text-gray-900">% Off</span>
            </label>
             {toggles.discount && (
            <div className="flex gap-3 mt-2">
              <Input
                type="number"
                value={form.discount}
                disabled={isView}
                onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                className="flex-1"
                placeholder="%"
              />
              <Input
                value={form.metaInfo || ""}
                disabled={isView}
                onChange={(e) => setForm({ ...form, metaInfo: e.target.value })}
                placeholder="Sale Rate"
                className="w-48"
              />
            </div>
            )}
          </div>
          {/* Images grid */}
<div className="border-t pt-3">
  <label className="flex items-center gap-2">
    <div className="flex items-center gap-2 mb-3">
  <input
    type="checkbox"
    checked={toggles.images}
    onChange={() => toggleSection("images")}
    disabled={isView}
  />
  <label className="font-semibold text-gray-900">Images</label>
</div>
  </label>
    {toggles.images && (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">

    {/* MAIN LARGE IMAGE (image1) */}

    <div
      className="col-span-2 relative group cursor-pointer"
      onClick={() => !isView && document.getElementById("file-image1")?.click()}
    >
      <div className="w-full h-[360px] bg-gray-50 rounded overflow-hidden border flex items-center justify-center">
        <img src={previewFor("image1")} className="w-full h-full object-cover" />
      </div>

      {/* Remove Button */}
      {!isView && form.image1 && (
        <button
          onClick={(e) => { e.stopPropagation(); handleRemoveImage("image1"); }}
          className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
        >
          ✕
        </button>
      )}

      <input
        id="file-image1"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleSelectFile("image1", e.target.files?.[0])}
      />

      {error.image1 && <p className="text-red-500 text-sm">{error.image1}</p>}
    </div>

    {/* RIGHT-SIDE SMALL IMAGES */}
    <div className="space-y-3">
      {/* First row image2, image3 */}
      <div className="grid grid-cols-2 gap-3">
        {[2, 3].map((n) => (
          <div
            key={n}
            className="relative group cursor-pointer h-36 bg-gray-50 rounded border overflow-hidden flex items-center justify-center"
            onClick={() => !isView && document.getElementById(`file-image${n}`)?.click()}
          >
            <img
              src={previewFor(`image${n}` as ImageField)}
              className="w-full h-full object-cover"
            />

            {!isView && form[`image${n}` as ImageField] && (
              <button
                onClick={(e) => { e.stopPropagation(); handleRemoveImage(`image${n}` as ImageField); }}
                className="absolute top-1 right-1 bg-white text-gray-900 rounded-full w-6 h-6 flex items-center justify-center  group-hover:opacity-100 transition"
              >
                ✕
              </button>
            )}

            <input
              id={`file-image${n}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleSelectFile(`image${n}` as any, e.target.files?.[0])}
            />
          </div>
        ))}
      </div>

      {/* Second row image4, image5 */}
      <div className="grid grid-cols-2 gap-3">
        {[4, 5].map((n) => (
          <div
            key={n}
            className="relative group cursor-pointer h-36 bg-gray-50 rounded border overflow-hidden flex items-center justify-center"
            onClick={() => !isView && document.getElementById(`file-image${n}`)?.click()}
          >
            <img
              src={previewFor(`image${n}` as ImageField)}
              className="w-full h-full object-cover"
            />

            {!isView && form[`image${n}` as ImageField] && (
              <button
                onClick={(e) => { e.stopPropagation(); handleRemoveImage(`image${n}` as ImageField); }}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            )}

            <input
              id={`file-image${n}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleSelectFile(`image${n}` as any, e.target.files?.[0])}
            />
          </div>
        ))}
      </div>
    </div>

  </div>
  )}
</div>

<ImageCropperModal
  open={cropModalOpen}
  onClose={() => setCropModalOpen(false)}
  file={selectedFileForCrop}
  onCropDone={handleCropDone}
   aspect={3 / 4}
/>


          {/* Advance Meta Info */}
<div className="border-t pt-3">
  <label className="flex items-center gap-2">
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          checked={toggles.metaFeatures}
          onChange={() => toggleSection("metaFeatures")}
          disabled={isView}
        />
        <label className="font-semibold text-gray-900">Meta Features</label>
      </div>
    </div>
  </label>

  {toggles.metaFeatures && (
    <div className="grid grid-cols-1 gap-3 mt-2">
      {/* Meta Features rich text editor */}
      <div>
        <label className="font-medium mb-1 text-gray-900">Meta Features</label>
        <RichTextEditor
          value={form.metaFeatures || ""}
          readOnly={isView}
          onChange={(value) => setForm({ ...form, metaFeatures: value })}
          className="w-full bg-white text-gray-900"
        />
      </div>

      {/* Meta Info rich text editor */}
      <div>
        <label className="font-medium mb-1 text-gray-900">Meta Info</label>
        <RichTextEditor
  value={form.metaInfo || ""}
  readOnly={isView}
  onChange={(value) => setForm({ ...form, metaInfo: value })}
  className="w-full bg-white text-gray-900"
/>

      </div>
    </div>
  )}
</div>


          {/* Demo Videos */}
          <div className="border-t pt-3">
            <label className="flex items-center gap-2">
              <div className="mb-4">
  <div className="flex items-center gap-2 mb-2">
    <input
      type="checkbox"
      checked={toggles.videos}
      onChange={() => toggleSection("videos")}
      disabled={isView}
    />
    <label className="font-semibold text-gray-900">Demo Videos</label>
  </div>

  {toggles.videos && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Video 1 - required */}
      <Input
        placeholder="Video URL 1"
        value={form.video1}
        disabled={isView}
        required={toggles.videos}
        onChange={(e) =>
          setForm({ ...form, video1: e.target.value })
        }
      />

      {/* Video 2 - optional */}
      <Input
        placeholder="Video URL 2 (optional)"
        value={form.video2}
        disabled={isView}
        onChange={(e) =>
          setForm({ ...form, video2: e.target.value })
        }
      />
    </div>
  )}
</div>
            </label>
          </div>

        </div>

        {!isView && (
          <DialogFooter>
            <Button 
              className="text-white" 
              style={{ 
                backgroundColor: "var(--theme-primary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--theme-dark)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--theme-primary)";
              }}
              onClick={handleSubmit}
            >
              {mode === "add" ? "Add" : "Update"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}