import express from "express";
import { getCompany, updateCompany } from "../controllers/company.controller.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getCompany);
router.put("/", upload.any(), updateCompany);

export default router;










