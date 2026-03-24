import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  createdAt: { type: Date, default: Date.now },
});

// Ensure one product per user (prevent duplicates)
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);






