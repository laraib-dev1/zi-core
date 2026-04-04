import Banner2 from "../models/Banner2.js";
import connectDB from "../config/db.js";
import cloudinary from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadBanner2Image = async (file) => {
  if (!file) return "";
  const folder = "banners2";
  if (file.buffer) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        { folder },
        (err, result) => {
          if (err) return reject(err);
          resolve(result.secure_url);
        }
      );
      stream.end(file.buffer);
    });
  }
  if (file.path) {
    const result = await cloudinary.v2.uploader.upload(file.path, { folder });
    try {
      fs.unlinkSync(file.path);
    } catch (e) {}
    return result.secure_url;
  }
  return "";
};

const uploadsPath = path.join(process.cwd(), "uploads");

const tryRemoveFromUrl = (url) => {
  if (!url) return;
  if (url.includes("/uploads/")) {
    const filename = url.split("/uploads/").pop();
    const filePath = path.join(uploadsPath, filename);
    fs.unlink(filePath, (err) => {
      if (err) console.warn("remove old file:", err.message);
    });
  }
};

export const getBanners2 = async (req, res) => {
  try {
    await connectDB();
    const banners = await Banner2.find().sort({ slot: 1 }).lean();
    const data = banners.map((b) => ({
      _id: String(b._id),
      slot: String(b.slot || ""),
      imageUrl: String(b.imageUrl || ""),
      targetUrl: String(b.targetUrl || ""),
      updatedAt: b.updatedAt,
    }));
    res.json({ success: true, data });
  } catch (err) {
    console.error("Get banners2 error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const upsertBanner2BySlot = async (req, res) => {
  try {
    await connectDB();
    const { slot } = req.params;
    const { targetUrl = "" } = req.body;
    const file = req.file;
    const clearImage = String(req.body.clearImage || "") === "true";

    if (!slot) {
      return res.status(400).json({ success: false, message: "Banner slot is required" });
    }

    let imageUrl;
    if (file) {
      imageUrl = await uploadBanner2Image(file);
    }

    const existing = await Banner2.findOne({ slot });
    if (!existing && !imageUrl && !clearImage) {
      return res.status(400).json({ success: false, message: "Image is required for a new banner" });
    }

    const update = { targetUrl };
    if (imageUrl) {
      if (existing?.imageUrl) tryRemoveFromUrl(existing.imageUrl);
      update.imageUrl = imageUrl;
    } else if (clearImage && existing) {
      if (existing.imageUrl) tryRemoveFromUrl(existing.imageUrl);
      update.imageUrl = "";
    }

    const options = { new: true, upsert: true, setDefaultsOnInsert: true };
    const banner = await Banner2.findOneAndUpdate({ slot }, update, options);
    res.json({ success: true, data: banner });
  } catch (err) {
    console.error("Upsert banner2 error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};
