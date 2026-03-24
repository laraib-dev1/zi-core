import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/user.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Profile routes
router.get("/profile", async (req, res) => {
  try {
    const user = await getUserProfile(req);
    res.json({ data: user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const user = await updateUserProfile(req);
    res.json({ data: user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/change-password", async (req, res) => {
  try {
    const result = await changePassword(req);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Address routes
router.get("/addresses", async (req, res) => {
  try {
    const addresses = await getUserAddresses(req);
    res.json({ data: addresses });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/addresses", async (req, res) => {
  try {
    const addresses = await addUserAddress(req);
    res.json({ data: addresses });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/addresses/:addressId", async (req, res) => {
  try {
    const addresses = await updateUserAddress(req);
    res.json({ data: addresses });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/addresses/:addressId", async (req, res) => {
  try {
    const addresses = await deleteUserAddress(req);
    res.json({ data: addresses });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Wishlist routes
router.get("/wishlist", async (req, res) => {
  try {
    const wishlist = await getUserWishlist(req);
    res.json({ data: wishlist });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/wishlist", async (req, res) => {
  try {
    const item = await addToWishlist(req);
    res.json({ data: item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/wishlist/:productId", async (req, res) => {
  try {
    const result = await removeFromWishlist(req);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;






