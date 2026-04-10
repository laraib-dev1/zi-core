export type CompanyBrandData = {
  company?: string;
  logo?: string;
  favicon?: string;
  phone?: string;
};

export const DEFAULT_COMPANY_NAME = "Grace by Anu";

/** Shown on login/access auth layouts when company has no custom auth tagline saved yet. */
export const DEFAULT_AUTH_TAGLINE =
  "Handcrafted essentials with a touch of elegance.";

export function resolveCompanyAssetUrl(value?: string): string {
  if (!value || typeof value !== "string" || !value.trim()) return "";
  const trimmed = value.trim();

  if (trimmed.startsWith("data:")) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  const rawApiUrl = typeof import.meta.env.VITE_API_URL === "string" ? import.meta.env.VITE_API_URL : "";
  const baseUrl = rawApiUrl.replace(/\/$/, "").replace(/\/api$/, "");
  if (!baseUrl) return trimmed;

  return `${baseUrl}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

export function normalizePhoneForWhatsApp(phone?: string): string {
  return (phone || "").replace(/\D/g, "");
}

export function buildWhatsAppUrl(phone?: string, message?: string): string {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) return "#";
  const baseUrl = `https://wa.me/${normalized}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
}

export function applyCompanyBranding(company: CompanyBrandData | null | undefined): void {
  if (typeof document === "undefined") return;

  const companyName = company?.company?.trim() || DEFAULT_COMPANY_NAME;
  document.title = companyName;

  const iconSource = company?.logo || company?.favicon;
  const resolvedIcon = resolveCompanyAssetUrl(iconSource) || "/logo-removebg-preview.png";

  let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = resolvedIcon;
}
