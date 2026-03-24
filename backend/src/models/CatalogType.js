import mongoose from "mongoose";

const catalogTypeSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, trim: true, unique: true },
    label: { type: String, required: true, trim: true },
    showInAdmin: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.CatalogType || mongoose.model("CatalogType", catalogTypeSchema);
