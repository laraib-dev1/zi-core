import API from "./axios"; // your axios instance

// Derive API base URL from VITE_API_URLS (same as axios) so one env var works in Vercel
const urls = (import.meta.env.VITE_API_URLS || "").split(",").map((u: string) => u.trim()).filter(Boolean);
const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const apiUrl = urls.length ? (isLocalhost ? urls[0] : (urls[1] || urls[0])) : (import.meta.env.VITE_API_URL || "");
const BASE_URL = apiUrl ? String(apiUrl).replace("/api", "") : "";

const mapImages = (p: any) => {
  const getFull = (img: string | null) => {
    if (!img || img.trim() === "") return "/product.png";
    if (img.startsWith("http") || img === "/product.png") return img;
    return `${BASE_URL}${img}`;
  };

  return {
    ...p,
    image1: getFull(p.image1),
    image2: getFull(p.image2),
    image3: getFull(p.image3),
    image4: getFull(p.image4),
    image5: getFull(p.image5),
    image6: getFull(p.image6),
  };
};

export const getProducts = async () => {
  const res = await API.get("/products");
  return res.data.data.map(mapImages);
};

export const getProduct = async (id: string) => {
  const res = await API.get(`/products/${id}`);
  return mapImages(res.data.data);
};

// ---------------- CREATE PRODUCT ----------------
export const createProduct = async (product: any) => {
  const formData = new FormData();

  Object.entries(product).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    // Skip image files for now
    if (key === "imageFiles") return;

    // If value is a File, append directly
    if (value instanceof File) {
      formData.append(key, value);
    } 
    // For numbers, convert to string
    else if (typeof value === "number") {
      formData.append(key, value.toString());
    } 
    // For arrays or objects, stringify
    else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } 
    // Otherwise, append as string
    else {
      formData.append(key, String(value));
    }
  });

  // Append image files
  if (product.imageFiles) {
    Object.entries(product.imageFiles).forEach(([key, file]) => {
      if (file instanceof File) {
        formData.append(key, file);
      }
    });
  }

  const res = await API.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data;
};

// ---------------- UPDATE PRODUCT ----------------
export const updateProduct = async (id: string | number, product: any) => {
  const formData = new FormData();

  Object.entries(product).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "imageFiles") return;

    if (value instanceof File) {
      formData.append(key, value);
    } else if (typeof value === "number") {
      formData.append(key, value.toString());
    } else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  if (product.imageFiles) {
    Object.entries(product.imageFiles).forEach(([key, file]) => {
      if (file instanceof File) {
        formData.append(key, file);
      }
    });
  }

  const res = await API.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data;
};


// ---------------- DELETE PRODUCT ----------------
export const deleteProduct = async (id: string | number) => {
  const res = await API.delete(`/products/${id}`);
  return res.data.success;
};
