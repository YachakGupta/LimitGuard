import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";

import {
  getExtensionToken,
  getExtensionTokenStatus,
  generateExtensionToken,
  rotateExtensionToken,
  revokeExtensionToken,
} from "../controllers/extensionTokenController.js";

const router = Router();

// These routes require website login authentication.
router.get("/", protect, getExtensionToken);
router.get("/status", protect, getExtensionTokenStatus);
router.post("/generate", protect, generateExtensionToken);
router.post("/rotate", protect, rotateExtensionToken);
router.delete("/", protect, revokeExtensionToken);

export default router;