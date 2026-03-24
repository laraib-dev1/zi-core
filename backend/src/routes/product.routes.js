// backend/src/routes/product.routes.js
import express from "express";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  withHandler
} from "../controllers/product.controller.js";
import { uploadMultiple } from "../middleware/upload.js";

const router = express.Router();

// fields array for multer
const fields = [
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 },
  { name: "image5", maxCount: 1 },
  { name: "image6", maxCount: 1 },
];

router.post("/", uploadMultiple.fields(fields), withHandler(createProduct));
router.get("/", withHandler(getProducts));
router.get("/:id", withHandler(getProduct));
router.put("/:id", uploadMultiple.fields(fields), withHandler(updateProduct));
router.delete("/:id", withHandler(deleteProduct));

export default router;
