import API from "./axios";

const urls = (import.meta.env.VITE_API_URLS || "").split(",").map((u: string) => u.trim()).filter(Boolean);
const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const apiUrl = urls.length ? (isLocalhost ? urls[0] : (urls[1] || urls[0])) : (import.meta.env.VITE_API_URL || "");
const BASE_URL = apiUrl ? String(apiUrl).replace("/api", "") : "";

export type Banner2Slot =
  | "hero-bg"
  | "hero-right"
  | "cta-bg"
  | "hero-business"
  | "unlock-image"
  | "feature-1"
  | "feature-2"
  | "text-image"
  | "detail-hero"
  | "about-1"
  | "about-2"
  | "about-3"
  | "about-4"
  | "team-1"
  | "team-2"
  | "team-3"
  | "team-4";

export interface Banner2 {
  _id: string;
  slot: Banner2Slot | string;
  imageUrl: string;
  targetUrl: string;
  updatedAt?: string;
}

function getFullUrl(img: string | null): string {
  if (!img || !img.trim()) return "";
  if (img.startsWith("http")) return img;
  return `${BASE_URL}${img}`;
}

export const getBanners2 = async (): Promise<Banner2[]> => {
  const res = await API.get("/banners2");
  const raw = res?.data?.data;
  const list = Array.isArray(raw) ? raw : [];
  return list.map((b: any) => {
    const imageUrl = b && (b.imageUrl != null) ? String(b.imageUrl).trim() : "";
    return {
      _id: b?._id ?? "",
      slot: b?.slot != null ? String(b.slot) : "",
      imageUrl: getFullUrl(imageUrl),
      targetUrl: b?.targetUrl != null ? String(b.targetUrl) : "",
      updatedAt: b?.updatedAt,
    };
  });
};

export const updateBanner2 = async (
  slot: Banner2Slot | string,
  options: { targetUrl: string; file?: File | null; clearImage?: boolean }
): Promise<Banner2> => {
  const form = new FormData();
  form.append("targetUrl", options.targetUrl || "");
  if (options.file) form.append("image", options.file);
  if (options.clearImage) form.append("clearImage", "true");
  const res = await API.put(`/banners2/${slot}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const b = res.data.data;
  return {
    _id: b._id,
    slot: b.slot,
    imageUrl: getFullUrl(b.imageUrl),
    targetUrl: b.targetUrl || "",
    updatedAt: b.updatedAt,
  };
};

/** Recommended image sizes for each slot on the second landing page */
export const BANNER2_SLOT_SIZES: Record<string, string> = {
  // Hero background – 21:9 to match HeroBannerFull
  "hero-bg": "2520×1080, 21:9 (full-width hero background)",
  // Hero right image – square card in HeroBannerFull
  "hero-right": "1080×1080, 1:1 (hero right-side image)",
  // Call to Action background – used as full-width background (16:9 works well)
  "cta-bg": "1920×1080, 16:9 (Call to Action section background)",
  // Business hero image – fixed 16:9 card in HeroBannerBusiness
  "hero-business": "1920×1080, 16:9 (Hero Business section image)",
  // Unlock Potential section illustration – 16:9 image area
  "unlock-image": "1920×1080, 16:9 (Unlock Potential section)",
  // Features Details block images – 3:2 cards
  "feature-1": "900×600, 3:2 (Features Details block 1)",
  "feature-2": "900×600, 3:2 (Features Details block 2)",
  // Text + Image section – 3:2 image card
  "text-image": "900×600, 3:2 (Text + Image section)",
  // Detail sidebar hero – 16:9 content image
  "detail-hero": "800×450, 16:9 (Detail sidebar hero image)",
  // About/Portfolio gallery images – square gallery (1:1)
  "about-1": "800×800, 1:1 (About/Portfolio image 1)",
  "about-2": "800×800, 1:1 (About/Portfolio image 2)",
  "about-3": "800×800, 1:1 (About/Portfolio image 3)",
  "about-4": "800×800, 1:1 (About/Portfolio image 4)",
  // Team member portraits – square cards (1:1)
  "team-1": "800×800, 1:1 square (Team member 1)",
  "team-2": "800×800, 1:1 square (Team member 2)",
  "team-3": "800×800, 1:1 square (Team member 3)",
  "team-4": "800×800, 1:1 square (Team member 4)",
};
