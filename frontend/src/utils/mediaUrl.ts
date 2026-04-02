/** Must stay in sync with `api/axios.ts` host selection. Uploads are served at `/uploads` on the same host as `/api`, not under `/api`. */

function cleanEnvValue(value: string): string {
  return String(value || "")
    .replace(/\\n/g, "")
    .replace(/\r?\n/g, "")
    .replace(/^['"]|['"]$/g, "")
    .trim();
}

/** Origin of the backend (scheme + host + port), no trailing slash, no `/api` suffix. */
export function getApiOriginForPublicAssets(): string {
  const urls = cleanEnvValue(import.meta.env.VITE_API_URLS || "")
    .split(",")
    .map((u: string) => cleanEnvValue(u))
    .filter(Boolean);

  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const rawApiStyle = isLocal
    ? urls[0] || cleanEnvValue(import.meta.env.VITE_API_URL || "")
    : urls[1] || urls[0] || cleanEnvValue(import.meta.env.VITE_API_URL || "");

  let base = (rawApiStyle || "").trim().replace(/\/$/, "");
  if (base.endsWith("/api")) base = base.slice(0, -4);
  return base;
}

/** Turn API-relative image paths into absolute URLs for <img src>. Cloudinary / full URLs pass through. */
export function resolvePublicAssetUrl(raw: string | undefined | null): string {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  // Persisted blob:/data: URLs are invalid outside the tab that created them — never use as src.
  if (s.startsWith("blob:") || s.startsWith("data:")) return "";
  if (/^https?:\/\//i.test(s) || s.startsWith("//")) return s;
  const origin = getApiOriginForPublicAssets();
  if (!origin) return s.startsWith("/") ? s : `/${s}`;
  return `${origin}${s.startsWith("/") ? "" : "/"}${s}`;
}
