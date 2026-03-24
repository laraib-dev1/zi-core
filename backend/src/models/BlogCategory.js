import mongoose from "mongoose";

const blogCategorySchema = new mongoose.Schema(
  {
    catalogType: { type: String, default: "blog", trim: true },
    name: { type: String, required: true, trim: true },
    blogs: { type: Number, default: 0 },
  },
  { timestamps: true }
);
blogCategorySchema.index({ name: 1, catalogType: 1 }, { unique: true });

export default mongoose.models.BlogCategory || mongoose.model("BlogCategory", blogCategorySchema);
