
import Context from "../models/contextModel.js";
import { processContext } from "../services/firewall.service.js";
import { calculateRiskScore } from "../utils/riskScore.js";
import ErrorHandler from "../middlewares/error.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

// Analyze a prompt or uploaded file using the Context Firewall
export const analyseContext = asyncHandler(async (req, res, next) => {
  const {
    text,
    local_only = "true",
    external_provider_enabled = "false",
  } = req.body;

  const prompt = typeof text === "string" ? text.trim() : "";
  const file = req.file;

  if (!prompt && !file) {
    return next(
      new ErrorHandler("Please provide a prompt or a file.", 400)
    );
  }

  const result = await processContext({
    prompt,
    file,
    localOnly:
      local_only === true || local_only === "true",
    externalProviderEnabled:
      external_provider_enabled === true ||
      external_provider_enabled === "true",
  });

  const privacy = result.privacy;
  const recommendation = String(
    privacy.document_recommendation || ""
  ).toUpperCase();

  // Do not save content the firewall recommends removing.
  if (recommendation === "REMOVE") {
    return res.status(200).json({
      success: true,
      message: "Firewall recommends removing this content. Nothing was saved.",
      data: result,
      saved: false,
    });
  }

  // Use the firewall's processed content, never the raw prompt.
  const safeContent =
    privacy.masked_document ||
    privacy.corrected_prompt ||
    result.prompt_refinement.refined_prompt ||
    "";

  if (typeof safeContent !== "string" || !safeContent.trim()) {
    return next(
      new ErrorHandler(
        "Firewall did not return approved content to save.",
        502
      )
    );
  }

  const findings = Array.isArray(privacy.findings)
    ? privacy.findings
    : [];

  const detectedThreats = findings.map((finding) =>
    typeof finding === "string"
      ? finding
      : JSON.stringify(finding)
  );

  const allowedRiskLevels = [
    "low",
    "medium",
    "high",
    "critical",
    "unknown",
  ];

  const receivedRiskLevel = String(
    privacy.sensitivity_level || "unknown"
  ).toLowerCase();

  const riskLevel = allowedRiskLevels.includes(receivedRiskLevel)
    ? receivedRiskLevel
    : "unknown";

  const riskScore = calculateRiskScore(riskLevel, findings);

  const context = await Context.create({
    // Never persist the submitted raw prompt or original document.
    originalText: "[Not stored for privacy]",
    sanitizedText: safeContent,
    riskLevel,
    riskScore,
    detectedThreats,
    analysisStatus: "completed",
  });

  return res.status(201).json({
    success: true,
    message: "Context analyzed and saved successfully.",
    data: {
      context,
      firewall: result,
    },
    saved: true,
  });
});

// Get all saved contexts
export const getAllContexts = asyncHandler(async (req, res) => {
  const contexts = await Context.find().sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: contexts.length,
    data: contexts,
  });
});
