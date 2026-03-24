import express from "express";
import {
  getLandingSections,
  getEnabledLandingSections,
  updateLandingSection,
  createLandingSection,
} from "../controllers/landingsection.controller.js";

const router = express.Router();

router.get("/", getLandingSections);
router.get("/enabled", getEnabledLandingSections);
router.post("/", createLandingSection);
router.put("/:id", updateLandingSection);

export default router;
