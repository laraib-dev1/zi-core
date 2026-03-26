import express from "express";
import multer from "multer";
import {
  getApplications,
  getApplicationById,
  incrementApplicationView,
  createApplication,
  updateApplication,
  deleteApplication,
} from "../controllers/application.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const filesUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "icon", maxCount: 1 },
  { name: "banner", maxCount: 1 },
  { name: "inner", maxCount: 1 },
  ...Array.from({ length: 10 }).map((_, i) => ({ name: `screenshot_${i}`, maxCount: 1 })),
  ...Array.from({ length: 20 }).map((_, i) => ({ name: `downloadFile_${i}`, maxCount: 1 })),
]);

router.get("/", getApplications);
router.get("/:id", getApplicationById);
router.post("/:id/view", incrementApplicationView);
router.post("/", filesUpload, createApplication);
router.put("/:id", filesUpload, updateApplication);
router.delete("/:id", deleteApplication);

export default router;
