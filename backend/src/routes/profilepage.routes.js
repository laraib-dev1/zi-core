import express from "express";
import {
  getProfilePages,
  getEnabledProfilePages,
  getProfilePageBySlug,
  createProfilePage,
  updateProfilePage,
  deleteProfilePage,
  getBaseProfileTabs,
  getEnabledBaseProfileTabs,
  updateBaseProfileTab,
} from "../controllers/profilepage.controller.js";

const router = express.Router();

// Custom profile pages routes
router.get("/", getProfilePages);
router.get("/enabled", getEnabledProfilePages);
router.post("/", createProfilePage);
router.put("/:id", updateProfilePage);
router.delete("/:id", deleteProfilePage);

// Base profile tabs routes (must come before /:slug to avoid conflicts)
router.get("/base-tabs", getBaseProfileTabs);
router.get("/base-tabs/enabled", getEnabledBaseProfileTabs);
router.put("/base-tabs/:id", updateBaseProfileTab);

// Profile page by slug (must be last to avoid route conflicts)
router.get("/:slug", getProfilePageBySlug);

export default router;

