import mongoose from "mongoose";

const LandingSectionSchema = new mongoose.Schema(
  {
    sectionId: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    isCustom: { type: Boolean, default: false },
    code: { type: String, default: "" }, // HTML content for custom sections
    /** JSON string: per-section text overrides (keys match SpFolio field defs). */
    contentJson: { type: String, default: "{}" },
    /** When true (default), section can appear in Navbar2 "Other pages" for non–main-nav sections. */
    showInNavbarDropdown: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.LandingSection || mongoose.model("LandingSection", LandingSectionSchema);
