import mongoose from "mongoose";

const FooterSchema = new mongoose.Schema({
  sections: [{
    title: { type: String, required: true },
    links: [{
      label: { type: String, required: true },
      url: { type: String, required: true },
      order: { type: Number, default: 0 },
    }],
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
  }],
  socialLinks: {
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    twitter: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    youtube: { type: String, default: "" },
  },
  copyright: { type: String, default: "" },
  description: { type: String, default: "" },
  showPreview: { type: Boolean, default: true, required: false },
  showCategories: { type: Boolean, default: false },
  showProducts: { type: Boolean, default: false },
  showSocialIcons: { type: Boolean, default: false },
  showSocialLinks: { type: Boolean, default: false },
  gridSettings: {
    productsPerRow: { type: Number, default: 4 },
    blogsPerRow: { type: Number, default: 4 },
  },
}, { timestamps: true });

export default mongoose.models.Footer || mongoose.model("Footer", FooterSchema);











