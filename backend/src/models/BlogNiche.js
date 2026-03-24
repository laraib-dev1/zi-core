import mongoose from "mongoose";

const blogNicheSchema = new mongoose.Schema(
  {
    catalogType: { type: String, default: "blog", trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "BlogCategory", required: true },
    blogs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.BlogNiche || mongoose.model("BlogNiche", blogNicheSchema);
