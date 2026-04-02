import Application from "../models/Application.js";
import connectDB from "../config/db.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

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
      fileUrl: sanitizeScreenshotSlot(typeof d?.fileUrl === "string" ? d.fileUrl : ""),
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

export const createApplication = async (req, res) => {
  try {
    await connectDB();
    const downloadsList = normalizeList(req.body.downloadsList).map((x, index) => ({ ...x, order: x.order ?? index }));

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

    for (let i = 0; i < 20; i += 1) {
      const key = `downloadFile_${i}`;
      const file = req.files?.[key]?.[0];
      if (!file || !downloadsList[i]) continue;
      const upload = await uploadToCloudinary(file.buffer, "applications/files");
      downloadsList[i].fileUrl = upload.secure_url;
      downloadsList[i].fileName = file.originalname || downloadsList[i].fileName || "";
      downloadsList[i].fileSize = file.size || downloadsList[i].fileSize || 0;
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
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateApplication = async (req, res) => {
  try {
    await connectDB();
    const existing = await Application.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Application not found" });

    const prevDownloads = Array.isArray(existing.downloadsList) ? existing.downloadsList : [];
    const downloadsList = normalizeList(req.body.downloadsList).map((x, index) => ({
      ...x,
      order: x.order ?? index,
      fileUrl: mergeUrlField(x.fileUrl, prevDownloads[index]?.fileUrl),
      fileName: x.fileName || "",
      fileSize: x.fileSize || 0,
      iconUrl: mergeUrlField(x.iconUrl, prevDownloads[index]?.iconUrl),
      icon: mergeUrlField(x.icon, prevDownloads[index]?.icon),
      imageUrl: mergeUrlField(x.imageUrl, prevDownloads[index]?.imageUrl),
      image: mergeUrlField(x.image, prevDownloads[index]?.image),
    }));

    for (let i = 0; i < 20; i += 1) {
      const key = `downloadFile_${i}`;
      const file = req.files?.[key]?.[0];
      if (!file || !downloadsList[i]) continue;
      const upload = await uploadToCloudinary(file.buffer, "applications/files");
      downloadsList[i].fileUrl = upload.secure_url;
      downloadsList[i].fileName = file.originalname || downloadsList[i].fileName || "";
      downloadsList[i].fileSize = file.size || downloadsList[i].fileSize || 0;
    }

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
