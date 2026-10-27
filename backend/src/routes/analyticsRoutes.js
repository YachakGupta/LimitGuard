import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";

import {
  getAnalyticsOverview,
  getTokenSavings,
  getProtectionActivity,
  getPrivacyRiskDistribution,
  getRecentActivity,
} from "../controllers/analyticsController.js";

const router = Router();

router.use(protect);

router.get("/overview", getAnalyticsOverview);
router.get("/token-savings", getTokenSavings);
router.get("/protection-activity", getProtectionActivity);
router.get("/privacy-risk", getPrivacyRiskDistribution);
router.get("/recent-activity", getRecentActivity);

export default router;