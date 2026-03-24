import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  price: { type: Number, default: 0 },
  currency: { type: String, default: "PKR" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  discount: { type: Number, default: 0 },

  image1: { type: String, default: "" },
  image2: { type: String, default: "" },
  image3: { type: String, default: "" },
  image4: { type: String, default: "" },
  image5: { type: String, default: "" },
  image6: { type: String, default: "" },

  metaFeatures: { type: String, default: "" },
  metaInfo: { type: String, default: "" },
  video1: { type: String, default: "" },
  video2: { type: String, default: "" },

}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
