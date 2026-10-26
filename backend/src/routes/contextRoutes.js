
import { Router } from "express";
import { analyseContext } from "../controllers/contextController.js";

const router = Router();

router.post("/analyze", analyseContext);

export default router;
