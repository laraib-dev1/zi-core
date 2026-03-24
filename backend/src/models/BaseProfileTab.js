import mongoose from "mongoose";

const BaseProfileTabSchema = new mongoose.Schema({
  _id: { type: String, required: true, unique: true }, // Use tab ID as _id (dashboard, profile, etc.)
  title: { type: String, required: true },
  slug: { type: String, required: true },
  icon: { type: String, default: "" },
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  subInfo: { type: String, default: "" },
}, { timestamps: true }); // Use custom _id field (String type)

export default mongoose.models.BaseProfileTab || mongoose.model("BaseProfileTab", BaseProfileTabSchema);
