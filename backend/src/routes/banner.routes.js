import express from "express";
import { protect, isAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { getBanners, upsertBannerBySlot } from "../controllers/banner.controller.js";

const router = express.Router();

// -------- Admin routes for managing banners --------
// GET   /api/banners           → list all banners
// PUT   /api/banners/:slot     → create/update a banner in a specific slot

// Anyone (frontend) can read banners
router.get("/", async (req, res) => {
  try {
    const banners = await getBanners();
    res.json({ success: true, data: banners });
  } catch (err) {
    console.error("Get banners error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Only admin can create/update banners
router.put(
  "/:slot",
  protect,
  isAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const banner = await upsertBannerBySlot(req);
      res.json({ success: true, data: banner });
    } catch (err) {
      console.error("Upsert banner error:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

export default router;


















