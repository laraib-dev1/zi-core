import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema({
  company: { type: String, default: "" },
  slogan: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  supportEmail: { type: String, default: "" },
  address: { type: String, default: "" },
  logo: { type: String, default: "" },
  favicon: { type: String, default: "" },
  socialLinks: {
    facebook: { type: String, default: "" },
    tiktok: { type: String, default: "" },
    instagram: { type: String, default: "" },
    youtube: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    other: { type: String, default: "" },
  },
  socialPosts: [{
    image: { type: String, default: "" },
    url: { type: String, default: "" },
    order: { type: Number, default: 0 },
  }],
  brandTheme: {
    primary: { type: String, default: "#8C5934" },
    accent: { type: String, default: "" },
    dark: { type: String, default: "" },
    light: { type: String, default: "" },
  },
  copyright: { type: String, default: "" },
  description: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.models.Company || mongoose.model("Company", CompanySchema);
















