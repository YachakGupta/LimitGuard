
import { Router } from "express";
import healthRoutes from "./healthRoutes.js";
import contextRoutes from "./contextRoutes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/context", contextRoutes);

export default router;
