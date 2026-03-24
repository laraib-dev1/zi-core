import Banner from "../models/Banner.js";
import connectDB from "../config/db.js";
import cloudinary from "cloudinary";
import fs from "fs";
import path from "path";

// Configure Cloudinary for banners (uses same env vars as products)
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Small helper to upload one image (compatible with disk + memory storage)
const uploadBannerImage = async (file) => {
  if (!file) return "";

  // Vercel / memory storage → use buffer
  if (file.buffer) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        { folder: "banners" },
        (err, result) => {
          if (err) return reject(err);
          resolve(result.secure_url);
        }
      );
      stream.end(file.buffer);
    });
  }

  // Local disk storage → use file.path
  if (file.path) {
    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: "banners",
    });
    try {
      fs.unlinkSync(file.path);
    } catch (e) {
      // ignore
    }
    return result.secure_url;
  }

  return "";
};

const uploadsPath = path.join(process.cwd(), "uploads");

// Remove a previously stored local file (only needed when using disk storage)
export const tryRemoveBannerFromUrl = (url) => {
  if (!url) return;
  if (url.includes("/uploads/")) {
    const filename = url.split("/uploads/").pop();
    const filePath = path.join(uploadsPath, filename);
    fs.unlink(filePath, (err) => {
      if (err) console.warn("remove old banner file:", err.message);
    });
  }
};

// -------- GET ALL BANNERS --------
// Returns an array like:
// [{ slot: "hero-main", imageUrl: "...", targetUrl: "..." }, ...]
export const getBanners = async () => {
  await connectDB();
  const banners = await Banner.find().sort({ slot: 1 });
  return banners;
};

// -------- UPSERT ONE BANNER BY SLOT --------
// This lets the admin page update each position (hero-main, shop-main, etc.)
export const upsertBannerBySlot = async (req) => {
  await connectDB();

  const { slot } = req.params; // e.g. "hero-main"
  const { targetUrl = "" } = req.body;
  const file = req.file;

  if (!slot) {
    throw new Error("Banner slot is required");
  }

  let imageUrl = undefined;

  // If a new file is provided, upload it
  if (file) {
    imageUrl = await uploadBannerImage(file);
  }

  // If there is no uploaded image and we are creating for the first time,
  // we keep the old image (if any). If banner does not exist and imageUrl
  // is still empty, we throw an error.
  const existing = await Banner.findOne({ slot });

  if (!existing && !imageUrl) {
    throw new Error("Banner image is required for a new banner");
  }

  const update = {
    targetUrl,
  };

  if (imageUrl) {
    // Optionally remove old local file if it was stored under /uploads
    if (existing?.imageUrl) {
      tryRemoveBannerFromUrl(existing.imageUrl);
    }
    update.imageUrl = imageUrl;
  }

  const options = { new: true, upsert: true, setDefaultsOnInsert: true };

  const banner = await Banner.findOneAndUpdate({ slot }, update, options);
  return banner;
};




