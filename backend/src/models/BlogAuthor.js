import mongoose from "mongoose";

const blogAuthorSchema = new mongoose.Schema(
  {
    catalogType: { type: String, default: "blog", trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    avatar: { type: String },
    bio: { type: String },
    socialLinks: {
      facebook: { type: String },
      tiktok: { type: String },
      instagram: { type: String },
      youtube: { type: String },
      linkedin: { type: String },
      other: { type: String },
    },
    blogs: { type: Number, default: 0 },
  },
  { timestamps: true }
);
blogAuthorSchema.index({ email: 1, catalogType: 1 }, { unique: true });

export default mongoose.models.BlogAuthor || mongoose.model("BlogAuthor", blogAuthorSchema);
