import express from "express";
import { protect, isAdmin } from "../middleware/auth.js";
import { getQueries, createQuery, updateQueryStatus, deleteQuery } from "../controllers/query.controller.js";

const router = express.Router();

// Fetch all queries (admin only)
router.get("/", protect, isAdmin, async (req, res) => {
  try {
    const queries = await getQueries(req);
    res.json(queries);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create query (public - no auth required)
router.post("/create", async (req, res) => {
  try {
    const query = await createQuery(req);
    res.json(query);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update query status (admin only)
router.patch("/:id/status", protect, isAdmin, async (req, res) => {
  try {
    const query = await updateQueryStatus(req);
    res.json(query);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete query (admin only)
router.delete("/:id", protect, isAdmin, async (req, res) => {
  try {
    const result = await deleteQuery(req);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;

