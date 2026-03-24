import mongoose from "mongoose";

// Banner schema stores different banner slots for the storefront.
// Example slots:
// - "hero-main"      → large hero banner on Landing page
// - "hero-secondary" → secondary banner on Landing page
// - "hero-tertiary"  → third banner on Landing page
// - "shop-main"      → banner at the top of the Shop page
//
// You can add more slots later if needed.

const BannerSchema = new mongoose.Schema(
  {
    // Unique name/position of the banner (e.g. "hero-main", "shop-main")
    slot: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // URL of the banner image (usually a Cloudinary URL)
    imageUrl: {
      type: String,
      required: true,
    },

    // Optional URL where the banner should point when clicked
    targetUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Banner = mongoose.models.Banner || mongoose.model("Banner", BannerSchema);

export default Banner;


















