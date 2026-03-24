import express from "express";
import {
  getCatalogTypes,
  getEnabledCatalogTypes,
  createCatalogType,
  updateCatalogType,
  deleteCatalogType,
} from "../controllers/catalogtype.controller.js";

const router = express.Router();

router.get("/", getCatalogTypes);
router.get("/enabled", getEnabledCatalogTypes);
router.post("/", createCatalogType);
router.put("/:id", updateCatalogType);
router.delete("/:id", deleteCatalogType);

export default router;
