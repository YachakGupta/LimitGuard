
import Context from "../models/contextModel.js";
import { processContext } from "../services/firewall.service.js";
import { calculateRiskScore } from "../utils/riskScore.js";
import ErrorHandler from "../middlewares/error.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

// Analyze a prompt or uploaded document using the Context Firewall.
export const analyseContext = asyncHandler(async (req, res, next) => {
  const {
    text,
    local_only = "true",
    external_provider_enabled = "false",
  } = req.body;

  const prompt = typeof text === "string" ? text.trim() : "";
  const file = req.file;

  // Require either text or an uploaded file.
  if (!prompt && !file) {
    return next(
      new ErrorHandler("Please provide a prompt or a file.", 400)
    );
  }

  // Send the content to the real firewall API.
  const result = await processContext({
    prompt,
    file,
    localOnly: local_only === true || local_only === "true",
    externalProviderEnabled:
      external_provider_enabled === true ||
      external_provider_enabled === "true",
  });

  const privacy = result?.privacy ?? {};

  // Support the field names returned by the real API.
  const decision = String(
    privacy.document_decision ??
      privacy.document_recommendation ??
      ""
  ).toUpperCase();

  // Do not save content the firewall marks for removal.
  if (decision === "REMOVE") {
    return res.status(200).json({
      success: true,
      message:
        "Firewall recommends removing this content. Nothing was saved.",
      data: result,
      saved: false,
    });
  }

  // Only use content explicitly returned as sanitized by the firewall.
  const safeContent =
    privacy.sanitized_prompt ??
    privacy.masked_document ??
    null;

  if (
    typeof safeContent !== "string" ||
    !safeContent.trim()
  ) {
    return next(
      new ErrorHandler(
        "Firewall did not return sanitized content. Nothing was saved.",
        502
      )
    );
  }

  // Extract findings when the firewall supplies them.
  const findings = Array.isArray(privacy.findings)
    ? privacy.findings
    : [];

  const detectedThreats = findings.map((finding) =>
    typeof finding === "string"
      ? finding
      : JSON.stringify(finding)
  );

  // The current real API response does not provide sensitivity_level.
  const riskLevel = "unknown";
  const riskScore = calculateRiskScore(riskLevel, findings);

  // Never persist the original prompt or original document.
  const context = await Context.create({
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


export const getAllContexts = asyncHandler(async (req, res) => {
  const contexts = await Context.find().sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: contexts.length,
    data: contexts,
  });
});
