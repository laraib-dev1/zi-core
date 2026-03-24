import express from "express";
import multer from "multer";
import {
  addCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// CRUD ROUTES
// router.post("/", addCategory);
router.post("/", upload.single("icon"), addCategory);
router.get("/", getCategories);
router.get("/:id", getCategory);
// router.put("/:id", updateCategory);
router.put("/:id", upload.single("icon"), updateCategory);
router.delete("/:id", deleteCategory);

export default router;
