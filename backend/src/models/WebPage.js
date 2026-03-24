import mongoose from "mongoose";

const WebPageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String, default: "" },
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  subInfo: { type: String, default: "" },
  location: { type: String, enum: ["nav", "footer", "both"], default: "footer" },
}, { timestamps: true });

export default mongoose.models.WebPage || mongoose.model("WebPage", WebPageSchema);
