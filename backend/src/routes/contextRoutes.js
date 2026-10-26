
import { Router } from "express";
import { analyseContext,getAllContexts } from "../controllers/contextController.js";
import { protect } from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});




router.post("/analyze", protect, upload.single("file"),analyseContext);
router.get("/getAllContexts",protect,getAllContexts);

export default router;
