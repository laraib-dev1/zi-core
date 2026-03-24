import express from "express";
import { protect, isAdmin } from "../middleware/auth.js";
import { getContentByType, getAllContent, upsertContent } from "../controllers/content.controller.js";

const router = express.Router();

// Public: Get content by type (privacy, terms, faqs)
router.get("/:type", async (req, res) => {
  try {
    const content = await getContentByType(req);
    res.json({ success: true, data: content });
  } catch (err) {
    console.error("Get content error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Get all content pages
router.get("/", protect, isAdmin, async (req, res) => {
  try {
    const contents = await getAllContent();
    res.json({ success: true, data: contents });
  } catch (err) {
    console.error("Get all content error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Create or update content page
router.put("/:type", protect, isAdmin, async (req, res) => {
  try {
    const content = await upsertContent(req);
    res.json({ success: true, data: content });
  } catch (err) {
    console.error("Upsert content error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;















