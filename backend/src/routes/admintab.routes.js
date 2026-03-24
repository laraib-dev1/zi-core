import express from "express";
import {
  getAdminTabs,
  getEnabledAdminTabs,
  createAdminTab,
  updateAdminTab,
  deleteAdminTab,
} from "../controllers/admintab.controller.js";

const router = express.Router();

router.get("/", getAdminTabs);
router.get("/enabled", getEnabledAdminTabs);
router.post("/", createAdminTab);
router.put("/:id", updateAdminTab);
router.delete("/:id", deleteAdminTab);

export default router;





















