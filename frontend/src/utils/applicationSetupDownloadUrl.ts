import API from "@/api/axios";

/**
 * Public download href for an application setup row.
 * `storageUrl` (Drive / Dropbox / etc.) is preferred so large installers need not use Cloudinary quota.
 * When the file was stored gzip-compressed on Cloudinary, use the API endpoint that restores the original bytes.
 */
export function applicationSetupFileHref(
  applicationId: string,
  typeKey: string,
  row: {
    storageUrl?: string;
    fileUrl?: string;
    url?: string;
    setupFileGzipped?: boolean;
    setupFileEncoding?: string;
  }
): string {
  const storageUrl = String(row.storageUrl || "").trim();
  if (storageUrl) return storageUrl;
  const fileUrl = String(row.fileUrl || "").trim();
  const webUrl = String(row.url || "").trim();
  if (!fileUrl) return webUrl || "#";
  const enc = String(row.setupFileEncoding || "").toLowerCase();
  const needsProxy = row.setupFileGzipped === true || (enc !== "" && enc !== "none");
  if (needsProxy) {
    const base = String(API.defaults.baseURL || "").replace(/\/$/, "");
    if (!base) return fileUrl;
    return `${base}/applications/${encodeURIComponent(applicationId)}/download-setup/${encodeURIComponent(String(typeKey).toLowerCase())}`;
  }
  return fileUrl;
}
