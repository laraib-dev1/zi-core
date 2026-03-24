import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    catalogType: { type: String, default: "blog", trim: true },
    title: { type: String, required: true, trim: true },
    subTag: { type: String, trim: true },
    description: { type: String, required: true },
    image: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "BlogCategory", required: true },
    niche: { type: mongoose.Schema.Types.ObjectId, ref: "BlogNiche" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "BlogAuthor", required: true },
    tags: [{ type: String, trim: true }],
    status: { type: String, enum: ["published", "unpublished", "draft"], default: "draft" },
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    links: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);
