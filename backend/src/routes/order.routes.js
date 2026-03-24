import express from "express";
import { protect, isAdmin } from "../middleware/auth.js";
import { getOrders, createOrder, updateOrderStatus, getUserOrders, getOrderById, cancelOrder } from "../controllers/order.controller.js";

const router = express.Router();

// Fetch all orders (admin only)
router.get("/", protect, isAdmin, async (req, res) => {
  try {
    const orders = await getOrders(req);
    res.json(orders);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create order
router.post("/create", protect, async (req, res) => {
  try {
    const order = await createOrder(req);
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get user's orders
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await getUserOrders(req);
    res.json(orders);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get single order by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await getOrderById(req);
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cancel order (user can cancel their own pending orders)
router.patch("/:id/cancel", protect, async (req, res) => {
  try {
    const order = await cancelOrder(req);
    res.json({ message: "Order cancelled successfully", order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update order status (admin only)
router.patch("/:id/status", protect, isAdmin, async (req, res) => {
  try {
    const order = await updateOrderStatus(req);
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
