import express from "express";
import { protect, isAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { getBanners2, upsertBanner2BySlot } from "../controllers/banner2.controller.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await getBanners2(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put(
  "/:slot",
  protect,
  isAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      await upsertBanner2BySlot(req, res);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

export default router;
