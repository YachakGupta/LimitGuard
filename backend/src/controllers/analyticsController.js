import ProtectionEvent from "../models/protectionEventModel.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const getDays = (value, fallback = 7) => {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) return fallback;

  return Math.min(90, Math.max(1, parsed));
};

const getStartDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const getUserFilter = (req, startDate) => ({
  user: req.user._id,
  createdAt: { $gte: startDate },
});

const emptyOverview = {
  totalPromptsAnalyzed: 0,
  sensitiveDataDetections: 0,
  promptsSanitized: 0,
  promptsBlocked: 0,
  totalTokensSaved: 0,
  estimatedCostSavedINR: 0,
};

// GET /api/v1/analytics/overview
export const getAnalyticsOverview = asyncHandler(
  async (req, res) => {
    const days = getDays(req.query.days, 30);
    const filter = getUserFilter(req, getStartDate(days));

    const [result] = await ProtectionEvent.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,

          totalPromptsAnalyzed: {
            $sum: {
              $cond: [
                { $eq: ["$eventType", "PROMPT"] },
                1,
                0,
              ],
            },
          },

          sensitiveDataDetections: {
            $sum: "$sensitiveDataDetections",
          },

          promptsSanitized: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$eventType", "PROMPT"] },
                    { $eq: ["$status", "SANITIZED"] },
                  ],
                },
                1,
                0,
              ],
            },
          },

          promptsBlocked: {
            $sum: {
              $cond: [
                { $eq: ["$status", "BLOCKED"] },
                1,
                0,
              ],
            },
          },

          totalTokensSaved: { $sum: "$tokensSaved" },
          estimatedCostSavedINR: {
            $sum: "$estimatedCostSavedINR",
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      days,
      data: result
        ? {
            totalPromptsAnalyzed: result.totalPromptsAnalyzed,
            sensitiveDataDetections: result.sensitiveDataDetections,
            promptsSanitized: result.promptsSanitized,
            promptsBlocked: result.promptsBlocked,
            totalTokensSaved: result.totalTokensSaved,
            estimatedCostSavedINR: Number(
              result.estimatedCostSavedINR.toFixed(6)
            ),
          }
        : emptyOverview,
    });
  }
);

// GET /api/v1/analytics/token-savings?days=7
export const getTokenSavings = asyncHandler(
  async (req, res) => {
    const days = getDays(req.query.days, 7);
    const filter = getUserFilter(req, getStartDate(days));

    const data = await ProtectionEvent.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "UTC",
            },
          },
          tokensSaved: { $sum: "$tokensSaved" },
          estimatedCostSavedINR: {
            $sum: "$estimatedCostSavedINR",
          },
          promptsAnalyzed: {
            $sum: {
              $cond: [
                { $eq: ["$eventType", "PROMPT"] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          tokensSaved: 1,
          estimatedCostSavedINR: 1,
          promptsAnalyzed: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      days,
      data,
    });
  }
);

// GET /api/v1/analytics/protection-activity?days=7
export const getProtectionActivity = asyncHandler(
  async (req, res) => {
    const days = getDays(req.query.days, 7);
    const filter = getUserFilter(req, getStartDate(days));

    const data = await ProtectionEvent.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "UTC",
            },
          },

          promptsAnalyzed: {
            $sum: {
              $cond: [
                { $eq: ["$eventType", "PROMPT"] },
                1,
                0,
              ],
            },
          },

          filesAnalyzed: {
            $sum: {
              $cond: [
                { $eq: ["$eventType", "FILE"] },
                1,
                0,
              ],
            },
          },

          sanitized: {
            $sum: {
              $cond: [
                { $eq: ["$status", "SANITIZED"] },
                1,
                0,
              ],
            },
          },

          blocked: {
            $sum: {
              $cond: [
                { $eq: ["$status", "BLOCKED"] },
                1,
                0,
              ],
            },
          },

          allowed: {
            $sum: {
              $cond: [
                { $eq: ["$status", "ALLOWED"] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          promptsAnalyzed: 1,
          filesAnalyzed: 1,
          sanitized: 1,
          blocked: 1,
          allowed: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      days,
      data,
    });
  }
);

// GET /api/v1/analytics/privacy-risk
export const getPrivacyRiskDistribution = asyncHandler(
  async (req, res) => {
    const days = getDays(req.query.days, 30);
    const filter = getUserFilter(req, getStartDate(days));

    const data = await ProtectionEvent.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$riskLevel",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          riskLevel: "$_id",
          count: 1,
        },
      },
      { $sort: { riskLevel: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      days,
      data,
    });
  }
);

// GET /api/v1/analytics/recent-activity?limit=10
export const getRecentActivity = asyncHandler(
  async (req, res) => {
    const parsedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(50, Math.max(1, parsedLimit))
      : 10;

    const data = await ProtectionEvent.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(
        "eventType status sensitiveDataDetections riskLevel tokensSaved estimatedCostSavedINR isEstimate createdAt"
      )
      .lean();

    return res.status(200).json({
      success: true,
      data,
    });
  }
);