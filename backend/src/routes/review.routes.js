import express from "express";
import { protect, isAdmin } from "../middleware/auth.js";
import {
  createReview,
  getUserReviews,
  getProductReviews,
  getAllReviews,
  deleteReview,
} from "../controllers/review.controller.js";

const router = express.Router();

// Get product reviews (public)
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await getProductReviews(req);
    res.json({ data: reviews });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// All routes below require authentication
router.use(protect);

// Create review
router.post("/", async (req, res) => {
  try {
    const review = await createReview(req);
    res.json({ data: review, message: "Review submitted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get user's reviews
router.get("/my-reviews", async (req, res) => {
  try {
    const reviews = await getUserReviews(req);
    res.json({ data: reviews });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all reviews (admin only)
router.get("/", protect, isAdmin, async (req, res) => {
  try {
    const reviews = await getAllReviews(req);
    res.json({ data: reviews });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete review (admin only)
router.delete("/:id", protect, isAdmin, async (req, res) => {
  try {
    const result = await deleteReview(req);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;

