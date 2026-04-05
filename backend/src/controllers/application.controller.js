import Application from "../models/Application.js";
import connectDB from "../config/db.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import {
  APPLICATION_DOWNLOAD_TYPES,
  sortDownloadsListByType,
  buildPrevDownloadsByType,
  mergeDownloadFilename,
  mergeDownloadFileSize,
} from "../utils/applicationDownloads.js";
import { prepareSetupFileForUpload, decompressSetupFileBuffer } from "../utils/setupFileCompression.js";

function normalizeList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Drop browser-only preview URLs (blob:/data:) so they are never persisted. Keep real http(s) and same-origin paths. */
function sanitizeScreenshotSlot(url) {
  if (typeof url !== "string") return "";
  const t = url.trim();
  if (!t || t.startsWith("blob:") || t.startsWith("data:")) return "";
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("//")) return t;
  if (t.startsWith("/") && t.length > 1) return t;
  return "";
}

/** Prefer new upload, else sanitized client value, else existing stored URL (so blob previews never wipe Cloudinary). */
function mergeScreenshotSlot(incomingVal, existingVal) {
  const fromIncoming = sanitizeScreenshotSlot(incomingVal);
  if (fromIncoming) return fromIncoming;
  return sanitizeScreenshotSlot(typeof existingVal === "string" ? existingVal : "");
}

/** Same rules as screenshot slots — use for any persisted image/file URL field. */
function mergeUrlField(incomingVal, existingVal) {
  const fromIncoming = sanitizeScreenshotSlot(typeof incomingVal === "string" ? incomingVal : "");
  if (fromIncoming) return fromIncoming;
  return sanitizeScreenshotSlot(typeof existingVal === "string" ? existingVal : "");
}

/** Strip blob:/data: from API responses so clients never try to load dead preview URLs (fixes Vercel console errors). */
function sanitizeApplicationForClient(doc) {
  if (!doc) return doc;
  const plain = typeof doc.toObject === "function" ? doc.toObject() : { ...doc };
  plain.image = sanitizeScreenshotSlot(plain.image || "");
  plain.media = plain.media || {};
  plain.media.banner = sanitizeScreenshotSlot(plain.media.banner || "");
  plain.media.inner = sanitizeScreenshotSlot(plain.media.inner || "");
  plain.media.screenshots = Array.isArray(plain.media.screenshots)
    ? plain.media.screenshots.map((u) => sanitizeScreenshotSlot(typeof u === "string" ? u : "")).filter(Boolean)
    : [];
  if (Array.isArray(plain.downloadsList)) {
    plain.downloadsList = plain.downloadsList.map((d) => ({
      ...d,
      storageUrl: sanitizeScreenshotSlot(typeof d?.storageUrl === "string" ? d.storageUrl : ""),
      fileUrl: sanitizeScreenshotSlot(typeof d?.fileUrl === "string" ? d.fileUrl : ""),
      setupFileGzipped: Boolean(d?.setupFileGzipped),
      setupFileEncoding: (() => {
        let enc = ["gzip", "brotli", "none"].includes(d?.setupFileEncoding) ? d.setupFileEncoding : "none";
        if (d?.setupFileGzipped && enc === "none") enc = "gzip";
        return enc;
      })(),
      iconUrl: sanitizeScreenshotSlot(typeof d?.iconUrl === "string" ? d.iconUrl : ""),
      icon: sanitizeScreenshotSlot(typeof d?.icon === "string" ? d.icon : ""),
      imageUrl: sanitizeScreenshotSlot(typeof d?.imageUrl === "string" ? d.imageUrl : ""),
      image: sanitizeScreenshotSlot(typeof d?.image === "string" ? d.image : ""),
    }));
  }
  return plain;
}

export const getApplications = async (req, res) => {
  try {
    await connectDB();
    const { status } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;
    const data = await Application.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: data.map((d) => sanitizeApplicationForClient(d)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    await connectDB();
    const item = await Application.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Application not found" });
    res.json({ success: true, data: sanitizeApplicationForClient(item) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** Public: stream setup file; decompress gzip/Brotli when stored compressed so installers match the original upload. */
export const downloadApplicationSetupFile = async (req, res) => {
  try {
    await connectDB();
    const id = req.params.id;
    const typeKey = String(req.params.type || "").toLowerCase();
    const item = await Application.findById(id);
    if (!item || item.status !== "published") {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    const row = (Array.isArray(item.downloadsList) ? item.downloadsList : []).find(
      (d) => String(d?.type || "").toLowerCase() === typeKey && d?.enabled !== false
    );
    const fileUrl = sanitizeScreenshotSlot(typeof row?.fileUrl === "string" ? row.fileUrl : "");
    if (!row || !fileUrl) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    const upstream = await fetch(fileUrl);
    if (!upstream.ok) {
      return res.status(502).json({ success: false, message: "Failed to fetch file" });
    }
    const buf = Buffer.from(await upstream.arrayBuffer());
    let out = buf;
    try {
      out = await decompressSetupFileBuffer(buf, row.setupFileEncoding, row.setupFileGzipped);
    } catch {
      return res.status(500).json({ success: false, message: "Failed to decompress file" });
    }

    const rawName = String(row.fileName || "download").trim() || "download";
    const safeName = rawName.replace(/["\r\n]/g, "_");
    const asciiName = safeName.replace(/[^\x20-\x7E]/g, "_");
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`);
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.send(out);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const incrementApplicationView = async (req, res) => {
  try {
    await connectDB();
    const item = await Application.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: "Application not found" });
    res.json({ success: true, data: { views: item.views } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

async function applyDownloadFileFields(req, downloadsList) {
  async function uploadOneBuffer(idx, buffer, originalName, originalSize, typeKey) {
    const { buffer: toUpload, setupFileGzipped, setupFileEncoding } = await prepareSetupFileForUpload(buffer, typeKey);
    const upload = await uploadToCloudinary(toUpload, "applications/files", { resource_type: "raw" });
    downloadsList[idx].fileUrl = upload.secure_url;
    downloadsList[idx].fileName = originalName || downloadsList[idx].fileName || "";
    downloadsList[idx].fileSize = originalSize || downloadsList[idx].fileSize || 0;
    downloadsList[idx].setupFileGzipped = setupFileGzipped;
    downloadsList[idx].setupFileEncoding = setupFileEncoding;
  }

  for (const typeKey of APPLICATION_DOWNLOAD_TYPES) {
    const key = `downloadFile_${typeKey}`;
    const file = req.files?.[key]?.[0];
    if (!file) continue;
    const idx = downloadsList.findIndex((d) => String(d?.type || "").toLowerCase() === typeKey);
    if (idx < 0) continue;
    await uploadOneBuffer(idx, file.buffer, file.originalname || "", file.size || 0, typeKey);
  }
  for (let i = 0; i < 20; i += 1) {
    const key = `downloadFile_${i}`;
    const file = req.files?.[key]?.[0];
    if (!file || !downloadsList[i]) continue;
    const rowType = String(downloadsList[i]?.type || "other").toLowerCase();
    await uploadOneBuffer(i, file.buffer, file.originalname || "", file.size || 0, rowType);
  }
}

export const createApplication = async (req, res) => {
  try {
    await connectDB();
    let downloadsList = normalizeList(req.body.downloadsList);
    await applyDownloadFileFields(req, downloadsList);
    downloadsList = sortDownloadsListByType(downloadsList).map((d) => ({
      ...d,
      storageUrl: sanitizeScreenshotSlot(typeof d?.storageUrl === "string" ? d.storageUrl : ""),
    }));

    let image = "";
    const iconFile = req.files?.icon?.[0] || req.files?.image?.[0];
    if (iconFile) {
      const upload = await uploadToCloudinary(iconFile.buffer, "applications");
      image = upload.secure_url;
    }
    let banner = "";
    if (req.files?.banner?.[0]) {
      const upload = await uploadToCloudinary(req.files.banner[0].buffer, "applications");
      banner = upload.secure_url;
    }
    let inner = "";
    if (req.files?.inner?.[0]) {
      const upload = await uploadToCloudinary(req.files.inner[0].buffer, "applications");
      inner = upload.secure_url;
    }
    const screenshots = [];
    for (let i = 0; i < 10; i += 1) {
      const key = `screenshot_${i}`;
      const file = req.files?.[key]?.[0];
      if (!file) continue;
      const upload = await uploadToCloudinary(file.buffer, "applications");
      screenshots.push(upload.secure_url);
    }

    const tags = req.body.tags
      ? (Array.isArray(req.body.tags) ? req.body.tags : String(req.body.tags).split(",").map((t) => t.trim()).filter(Boolean))
      : [];

    const app = await Application.create({
      title: req.body.title,
      subTag: req.body.subTag || "",
      shortDescription: req.body.shortDescription || "",
      description: req.body.description || "<p></p>",
      image,
      tags,
      status: req.body.status || "draft",
      latestVersionLabel: req.body.latestVersionLabel || "",
      latestVersionSize: req.body.latestVersionSize || "",
      downloadsList,
      appInfo: req.body.appInfo ? JSON.parse(req.body.appInfo) : {},
      media: { banner, inner, screenshots },
      featuresHtml: req.body.featuresHtml || "",
      guideHtml: req.body.guideHtml || "",
      helpEnabled: req.body.helpEnabled === "true" || req.body.helpEnabled === true,
      helpHtml: req.body.helpHtml || "",
    });
    res.status(201).json({ success: true, data: sanitizeApplicationForClient(app) });
  } catch (error) {
    if (error?.code === "SETUP_FILE_TOO_LARGE") {
      return res.status(413).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateApplication = async (req, res) => {
  try {
    await connectDB();
    const existing = await Application.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Application not found" });

    const prevDownloads = Array.isArray(existing.downloadsList) ? existing.downloadsList : [];
    const prevByType = buildPrevDownloadsByType(prevDownloads);
    let downloadsList = normalizeList(req.body.downloadsList).map((x) => {
      const type = String(x?.type || "other").toLowerCase();
      const prev = prevByType.get(type);
      if (x.clearSetupFile === true) {
        return {
          ...x,
          fileUrl: "",
          fileName: "",
          fileSize: 0,
          setupFileGzipped: false,
          setupFileEncoding: "none",
          storageUrl: sanitizeScreenshotSlot(
            typeof x.storageUrl === "string"
              ? x.storageUrl
              : typeof prev?.storageUrl === "string"
                ? prev.storageUrl
                : ""
          ),
        };
      }
      return {
        ...x,
        storageUrl: sanitizeScreenshotSlot(
          typeof x.storageUrl === "string"
            ? x.storageUrl
            : typeof prev?.storageUrl === "string"
              ? prev.storageUrl
              : ""
        ),
        fileUrl: mergeUrlField(x.fileUrl, prev?.fileUrl),
        fileName: mergeDownloadFilename(x.fileName, prev?.fileName),
        fileSize: mergeDownloadFileSize(x.fileSize, prev?.fileSize),
        setupFileEncoding: ["none", "gzip", "brotli"].includes(x.setupFileEncoding)
          ? x.setupFileEncoding
          : prev?.setupFileEncoding || (prev?.setupFileGzipped ? "gzip" : "none"),
        setupFileGzipped:
          typeof x.setupFileGzipped === "boolean" ? x.setupFileGzipped : Boolean(prev?.setupFileGzipped),
        iconUrl: mergeUrlField(x.iconUrl, prev?.iconUrl),
        icon: mergeUrlField(x.icon, prev?.icon),
        imageUrl: mergeUrlField(x.imageUrl, prev?.imageUrl),
        image: mergeUrlField(x.image, prev?.image),
      };
    });
    await applyDownloadFileFields(req, downloadsList);
    downloadsList = sortDownloadsListByType(downloadsList).map((d) => ({
      ...d,
      storageUrl: sanitizeScreenshotSlot(typeof d?.storageUrl === "string" ? d.storageUrl : ""),
    }));

    let image = sanitizeScreenshotSlot(existing.image || "");
    const iconFile = req.files?.icon?.[0] || req.files?.image?.[0];
    if (iconFile) {
      const upload = await uploadToCloudinary(iconFile.buffer, "applications");
      image = upload.secure_url;
    }
    let banner = sanitizeScreenshotSlot(existing.media?.banner || "");
    if (req.files?.banner?.[0]) {
      const upload = await uploadToCloudinary(req.files.banner[0].buffer, "applications");
      banner = upload.secure_url;
    }
    let inner = sanitizeScreenshotSlot(existing.media?.inner || "");
    if (req.files?.inner?.[0]) {
      const upload = await uploadToCloudinary(req.files.inner[0].buffer, "applications");
      inner = upload.secure_url;
    }
    const existingScreens = Array.isArray(existing.media?.screenshots) ? existing.media.screenshots : [];
    let incomingScreens = [];
    try {
      const parsedMedia = req.body.media ? JSON.parse(req.body.media) : {};
      incomingScreens = Array.isArray(parsedMedia.screenshots) ? parsedMedia.screenshots : [];
    } catch {
      incomingScreens = [];
    }
    const slotCount = Math.max(existingScreens.length, incomingScreens.length, 5);
    let screenshots = [];
    for (let i = 0; i < slotCount; i += 1) {
      screenshots.push(mergeScreenshotSlot(incomingScreens[i], existingScreens[i]));
    }
    for (let i = 0; i < 10; i += 1) {
      const key = `screenshot_${i}`;
      const file = req.files?.[key]?.[0];
      if (!file) continue;
      const upload = await uploadToCloudinary(file.buffer, "applications");
      while (screenshots.length <= i) screenshots.push("");
      screenshots[i] = upload.secure_url;
    }
    screenshots = screenshots.filter(Boolean);

    const tags = req.body.tags
      ? (Array.isArray(req.body.tags) ? req.body.tags : String(req.body.tags).split(",").map((t) => t.trim()).filter(Boolean))
      : existing.tags;

    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        subTag: req.body.subTag || "",
        shortDescription: req.body.shortDescription || "",
        description: req.body.description || "<p></p>",
        image,
        tags,
        status: req.body.status || existing.status,
        latestVersionLabel: req.body.latestVersionLabel || "",
        latestVersionSize: req.body.latestVersionSize || "",
        downloadsList,
        appInfo: req.body.appInfo ? JSON.parse(req.body.appInfo) : (existing.appInfo || {}),
        media: { banner, inner, screenshots },
        featuresHtml: req.body.featuresHtml || "",
        guideHtml: req.body.guideHtml || "",
        helpEnabled: req.body.helpEnabled === "true" || req.body.helpEnabled === true,
        helpHtml: req.body.helpHtml || "",
      },
      { new: true }
    );

    res.json({ success: true, data: sanitizeApplicationForClient(updated) });
  } catch (error) {
    if (error?.code === "SETUP_FILE_TOO_LARGE") {
      return res.status(413).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    await connectDB();
    const deleted = await Application.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Application not found" });
    res.json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
