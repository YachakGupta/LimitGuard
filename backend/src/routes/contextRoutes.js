import { Router } from "express";
import multer from "multer";

import {
  analyseContext,
  getAllContexts,
  analyzeExtensionPrompt,
  analyzeExtensionFile,
} from "../controllers/contextController.js";

import { protect } from "../middlewares/authMiddleware.js";
import {
  protectExtension,
} from "../middlewares/extensionAuthMiddleware.js";

import {
  captureProtectionEvent,
} from "../middlewares/captureProtectionEvent.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Website dashboard endpoint — uses website login authentication.
router.post(
  "/analyze",
  protect,
  upload.single("file"),
  analyseContext
);

router.get(
  "/getAllContexts",
  protect,
  getAllContexts
);

// Chrome extension endpoints — require the dedicated extension JWT.
router.post(
  "/extension/analyze",
  protectExtension,
  captureProtectionEvent("PROMPT"),
  analyzeExtensionPrompt
);

router.post(
  "/extension/analyze-file",
  protectExtension,
  upload.single("file"),
  captureProtectionEvent("FILE"),
  analyzeExtensionFile
);

export default router;