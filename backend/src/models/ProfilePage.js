import mongoose from "mongoose";

const ProfilePageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String, default: "" },
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  subInfo: { type: String, default: "" },
  content: { type: String, default: "" }, // HTML content for the profile page
}, { timestamps: true });

export default mongoose.models.ProfilePage || mongoose.model("ProfilePage", ProfilePageSchema);

