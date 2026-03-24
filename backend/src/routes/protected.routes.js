import express from "express";
import { protect, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// User protected route
router.get("/user/profile", protect, (req, res) => {
  res.json({ message: "This is user profile data", user: req.user });
});

// Admin protected route
router.get("/admin/dashboard", protect, isAdmin, (req, res) => {
  res.json({ message: "Welcome to admin dashboard", admin: req.user });
});

export default router;
