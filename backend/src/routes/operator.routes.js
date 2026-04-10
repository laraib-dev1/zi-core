import express from "express";
import { protect, isAdmin } from "../middleware/auth.js";
import {
  getOperatorUsers,
  getOperatorUserById,
  updateOperatorUser,
  updateOperatorPassword,
  deleteOperatorUser,
} from "../controllers/operator.controller.js";

const router = express.Router();

router.use(protect, isAdmin);

router.get("/", getOperatorUsers);
router.get("/:id", getOperatorUserById);
router.put("/:id", updateOperatorUser);
router.put("/:id/password", updateOperatorPassword);
router.delete("/:id", deleteOperatorUser);

export default router;
