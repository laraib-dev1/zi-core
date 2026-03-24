import express from "express";
import { protect, isAdmin  } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { withHandler } from "../controllers/product.controller.js";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Auth controller serverless handlers
import {
  registerUser,
  loginUser,
  adminLoginUser,
  getMe,
  updateProfileUser,
  changePasswordUser,
  updateAvatarUser,
} from "../controllers/auth.controller.js";

const router = express.Router();

// Dev only: create/update admin (admin@gmail.com / 11223344). Call once: GET /api/auth/seed-admin
router.get("/seed-admin", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ message: "Not available" });
  }
  try {
    await connectDB();
    const adminEmail = "admin@gmail.com";
    const adminPassword = "11223344";
    const hashed = await bcrypt.hash(adminPassword, 10);
    let user = await User.findOne({ email: adminEmail });
    if (user) {
      user.password = hashed;
      user.role = "admin";
      user.name = "Admin";
      await user.save();
      return res.json({ ok: true, message: "Admin updated. Login with admin@gmail.com / 11223344" });
    }
    await User.create({ name: "Admin", email: adminEmail, password: hashed, role: "admin" });
    res.json({ ok: true, message: "Admin created. Login with admin@gmail.com / 11223344" });
  } catch (err) {
    console.error("Seed admin error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/dashboard", protect, isAdmin, (req, res) => {
  res.json({ message: "Welcome to admin dashboard", admin: req.user });
});
// router.post("/register", withHandler(registerUser));
// router.post("/login", withHandler(loginUser));
router.post("/register", async (req, res) => {
  try {
    const data = await registerUser(req);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  const body = req.body || {};
  const { email, password } = body;
  if (!email || !password) {
    return res.status(400).json({
      message: !email && !password
        ? "Email and password required"
        : !email
          ? "Email is required"
          : "Password is required",
    });
  }
  try {
    const data = await loginUser(req);
    res.json(data);
  } catch (err) {
    const status = err.message === "Invalid credentials" ? 401 : 400;
    res.status(status).json({ message: err.message });
  }
});
router.post("/admin-login", withHandler(adminLoginUser));

// router.get("/me", protect, withHandler(getMe));
router.get("/me", protect, async (req, res) => {
  try {
    const data = await getMe(req);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// router.put("/update-profile", protect, withHandler(updateProfileUser));
// router.put("/change-password", protect, withHandler(changePasswordUser));

// router.put(
//   "/update-avatar",
//   protect,
//   upload.fields([{ name: "avatar", maxCount: 1 }]),
//   withHandler(updateAvatarUser)
// );
router.put("/update-profile", protect, async (req, res) => {
  try {
    const data = await updateProfileUser(req);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/change-password", protect, async (req, res) => {
  try {
    const data = await changePasswordUser(req);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/update-avatar", protect, upload.fields([{ name: "avatar", maxCount: 1 }]), async (req, res) => {
  try {
    const data = await updateAvatarUser(req);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


export default router;
