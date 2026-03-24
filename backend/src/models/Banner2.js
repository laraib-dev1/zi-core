import mongoose from "mongoose";

/**
 * Banner2 = images/banners for the Second Landing page.
 * Each slot has a unique key (e.g. hero-bg, hero-right) and optional recommended dimensions
 * stored in the app for display in admin; imageUrl and targetUrl stored here.
 */
const Banner2Schema = new mongoose.Schema(
  {
    slot: { type: String, required: true, unique: true, trim: true },
    imageUrl: { type: String, default: "" },
    targetUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Banner2 || mongoose.model("Banner2", Banner2Schema);
