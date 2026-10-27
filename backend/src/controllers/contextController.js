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

  const result = await processContext({
    prompt,
    file,
    localOnly: local_only === true || local_only === "true",
    externalProviderEnabled:
      external_provider_enabled === true ||
      external_provider_enabled === "true",
  });

  const privacy = result?.privacy ?? {};

  const decision = String(
    privacy.document_decision ??
      privacy.document_recommendation ??
      ""
  ).toUpperCase();

  // Do not save content marked for removal.
  if (decision === "REMOVE") {
    return res.status(200).json({
      success: true,
      approved: false,
      reason: "REMOVE",
      action: "REMOVE_FILE_AND_REFINE_PROMPT",
      message:
        "The Firewall recommends removing this content. Nothing was saved.",
      data: result,
      saved: false,
    });
  }

  // Use only content returned as sanitized by the Firewall.
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

  const findings = Array.isArray(privacy.findings)
    ? privacy.findings
    : [];

  const detectedThreats = findings.map((finding) =>
    typeof finding === "string"
      ? finding
      : JSON.stringify(finding)
  );

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

// Retrieve all saved contexts.
export const getAllContexts = asyncHandler(async (req, res) => {
  const contexts = await Context.find().sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: contexts.length,
    data: contexts,
  });
});

// Analyze and sanitize a browser extension prompt.
export const analyzeExtensionPrompt = asyncHandler(
  async (req, res, next) => {
    const prompt =
      typeof req.body?.prompt === "string"
        ? req.body.prompt.trim()
        : "";

    if (!prompt) {
      return next(
        new ErrorHandler("Please provide a prompt.", 400)
      );
    }

    const result = await processContext({
      prompt,
      localOnly: true,
      externalProviderEnabled: false,
    });

    const privacy = result?.privacy ?? {};
    const sanitizedPrompt = privacy.sanitized_prompt;

    if (
      typeof sanitizedPrompt !== "string" ||
      !sanitizedPrompt.trim()
    ) {
      return res.status(422).json({
        success: false,
        approved: false,
        message:
          "The prompt could not be safely processed. Please refine it and try again.",
      });
    }

    return res.status(200).json({
      success: true,
      approved: true,
      sanitizedPrompt: sanitizedPrompt.trim(),
    });
  }
);

// Analyze an uploaded file from the browser extension.
export const analyzeExtensionFile = asyncHandler(
  async (req, res, next) => {
    const file = req.file;

    if (!file) {
      return next(
        new ErrorHandler(
          "Please attach a file to analyze.",
          400
        )
      );
    }

    let result;

    try {
      result = await processContext({
        prompt:
          typeof req.body?.prompt === "string"
            ? req.body.prompt.trim()
            : "",
        file,
        localOnly: true,
        externalProviderEnabled: false,
      });
    } catch (error) {
      return next(
        new ErrorHandler(
          "The Context Firewall is unavailable. File blocked.",
          502
        )
      );
    }

    const firewall = result?.data ?? result;
    const privacy = firewall?.privacy;
    const duplicateDetection = firewall?.duplicate_detection;

    if (!privacy || !duplicateDetection) {
      return res.status(502).json({
        success: false,
        approved: false,
        message: "Invalid firewall response. File blocked.",
      });
    }

    const decision = String(
      privacy.document_decision ??
        privacy.document_recommendation ??
        ""
    ).toUpperCase();

    const attachmentAction = String(
      privacy.original_attachment_action ?? ""
    ).toLowerCase();

    // Tell the extension to display the file-removal popup.
    if (
      decision === "REMOVE" ||
      attachmentAction === "remove"
    ) {
      return res.status(200).json({
        success: true,
        approved: false,
        reason: "REMOVE",
        action: "REMOVE_FILE_AND_REFINE_PROMPT",
        message:
          "This file may contain sensitive information. Remove the file and refine your prompt to reference an accessible resource instead.",
        suggestion:
          "Remove the attachment and update your prompt to tell the AI which approved resource or previously uploaded file to use.",
        duplicateDetection,
      });
    }

    // Fail closed if duplicate checking could not be completed.
    if (duplicateDetection.checked !== true) {
      return res.status(422).json({
        success: false,
        approved: false,
        reason: "DUPLICATE_CHECK_UNAVAILABLE",
        message:
          "Duplicate checking could not be completed. File blocked.",
        duplicateDetection,
      });
    }

    // Confirm duplicates only when explicitly reported by the Firewall.
    const duplicateConfirmed =
      duplicateDetection.is_duplicate === true ||
      duplicateDetection.duplicate === true ||
      duplicateDetection.found === true;

    if (duplicateConfirmed) {
      return res.status(200).json({
        success: true,
        approved: false,
        reason: "DUPLICATE",
        message:
          "This file appears to have been uploaded before. Remove it and ask the AI to use the previously uploaded file if it is accessible.",
        duplicateDetection,
      });
    }

    // Accept only sanitized content returned by the Firewall.
    const sanitizedFileContent =
      privacy.sanitized_prompt ??
      privacy.masked_document;

    if (
      typeof sanitizedFileContent !== "string" ||
      !sanitizedFileContent.trim()
    ) {
      return res.status(422).json({
        success: false,
        approved: false,
        message:
          "No sanitized file content was returned. File blocked.",
      });
    }

    return res.status(200).json({
      success: true,
      approved: true,
      message:
        "The file passed the available firewall checks.",
      sanitizedFileContent: sanitizedFileContent.trim(),
      duplicateDetection,
    });
  }
);
