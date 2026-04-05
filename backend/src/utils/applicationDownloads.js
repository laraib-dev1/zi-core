/** Must match admin / frontend setup order and multer field names `downloadFile_<type>`. */
export const APPLICATION_DOWNLOAD_TYPES = [
  "website",
  "playstore",
  "apk",
  "exe",
  "windows",
  "ios",
  "other",
];

export function sortDownloadsListByType(list) {
  const arr = Array.isArray(list) ? [...list] : [];
  const rank = (t) => {
    const key = String(t || "other").toLowerCase();
    const i = APPLICATION_DOWNLOAD_TYPES.indexOf(key);
    return i === -1 ? 999 : i;
  };
  return arr
    .sort((a, b) => rank(a?.type) - rank(b?.type))
    .map((d, i) => ({ ...d, order: i }));
}

export function buildPrevDownloadsByType(prevList) {
  const map = new Map();
  for (const p of Array.isArray(prevList) ? prevList : []) {
    const key = String(p?.type || "other").toLowerCase();
    map.set(key, p);
  }
  return map;
}

export function mergeDownloadFilename(incoming, prev) {
  const i = typeof incoming === "string" ? incoming.trim() : "";
  if (i) return i;
  return typeof prev === "string" && prev.trim() ? prev.trim() : "";
}

export function mergeDownloadFileSize(incoming, prev) {
  const n = Number(incoming);
  if (Number.isFinite(n) && n > 0) return n;
  const p = Number(prev);
  return Number.isFinite(p) && p > 0 ? p : 0;
}
