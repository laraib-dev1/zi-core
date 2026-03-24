import express from "express";
import { getFooter, updateFooter } from "../controllers/footer.controller.js";

const router = express.Router();

router.get("/", getFooter);
router.put("/", updateFooter);

export default router;





















