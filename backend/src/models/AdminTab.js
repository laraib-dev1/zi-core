import mongoose from "mongoose";

const AdminTabSchema = new mongoose.Schema({
  label: { type: String, required: true },
  path: { type: String, required: true, unique: true },
  icon: { type: String, default: "" },
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  subInfo: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.models.AdminTab || mongoose.model("AdminTab", AdminTabSchema);





















