import express from "express";
import {
  getWebPages,
  getEnabledWebPages,
  getEnabledWebPagesByLocation,
  createWebPage,
  updateWebPage,
  deleteWebPage,
} from "../controllers/webpage.controller.js";

const router = express.Router();

router.get("/", getWebPages);
router.get("/enabled", getEnabledWebPages);
router.get("/enabled/:location", getEnabledWebPagesByLocation);
router.post("/", createWebPage);
router.put("/:id", updateWebPage);
router.delete("/:id", deleteWebPage);

export default router;
