import Context from "../models/contextModel.js";
import { processContext } from "../services/firewall.service.js";
import { calculateRiskScore } from "../utils/riskScore.js";
import ErrorHandler from "../middlewares/error.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";




function getRefinementSettings(body = {}) {
  const refinePrompt =
    body.refinePrompt === undefined
      ? true
      : body.refinePrompt === true || body.refinePrompt === "true";

  return {
    refinePrompt,
    localOnly: !refinePrompt,
    externalProviderEnabled: refinePrompt,
  };
}

// Flags for generic callers (Postman, dashboard).
// refinePrompt wins if present, otherwise the explicit flags are used.
function resolveFlags(body = {}) {
  if (body.refinePrompt !== undefined) return getRefinementSettings(body);

  const localOnly = body.local_only === true || body.local_only === "true";
  const externalProviderEnabled =
    body.external_provider_enabled === true ||
    body.external_provider_enabled === "true";

  return { localOnly, externalProviderEnabled };
}

export const analyseContext = asyncHandler(async (req, res, next) => {
  const raw = req.body?.prompt ?? req.body?.text;
  const prompt = typeof raw === "string" ? raw.trim() : "";
  const file = req.file;

  if (!prompt && !file) {
    return next(new ErrorHandler("Please provide a prompt or a file.", 400));
  }

  const { localOnly, externalProviderEnabled } = resolveFlags(req.body);

  const result = await processContext({
    prompt,
    file,
    localOnly,
    externalProviderEnabled,
  });

  const privacy = result?.privacy ?? {};
  const refinement = result?.prompt_refinement ?? {};

  const decision = String(
    privacy.document_decision ?? privacy.document_recommendation ?? ""
  ).toUpperCase();

  if (decision === "REMOVE") {
    return res.status(200).json({
      success: true,
      approved: false,
      reason: "REMOVE",
      action: "REMOVE_FILE_AND_REFINE_PROMPT",
      message: "The Firewall recommends removing this content. Nothing was saved.",
      data: { firewall: result },
      saved: false,
    });
  }

  const refinedPrompt =
    typeof refinement.refined_prompt === "string"
      ? refinement.refined_prompt.trim()
      : "";

  const safeContent =
    (!localOnly && refinedPrompt) ||
    privacy.sanitized_prompt ||
    privacy.masked_document ||
    null;

  if (typeof safeContent !== "string" || !safeContent.trim()) {
    return next(
      new ErrorHandler(
        "Firewall did not return sanitized content. Nothing was saved.",
        502
      )
    );
  }

  const findings = Array.isArray(privacy.findings) ? privacy.findings : [];
  const detectedThreats = findings.map((f) =>
    typeof f === "string" ? f : JSON.stringify(f)
  );

  const riskLevel = "unknown";
  const riskScore = calculateRiskScore(riskLevel, findings);

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
    data: { context, firewall: result },
    saved: true,
  });
});

export const analyzeExtensionPrompt = asyncHandler(async (req, res, next) => {
  const prompt =
    typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";

  if (!prompt) {
    return next(new ErrorHandler("Please provide a prompt.", 400));
  }

  const { localOnly, externalProviderEnabled } = getRefinementSettings(req.body);

  console.log("Extension prompt refinement settings:", {
    local_only: localOnly,
    external_provider_enabled: externalProviderEnabled,
  });

  const result = await processContext({
    prompt,
    localOnly,
    externalProviderEnabled,
  });

  const privacy = result?.privacy ?? {};
  const refinement = result?.prompt_refinement ?? {};

  const sanitizedPrompt =
    typeof privacy.sanitized_prompt === "string"
      ? privacy.sanitized_prompt.trim()
      : "";

  const refinedPrompt =
    typeof refinement.refined_prompt === "string"
      ? refinement.refined_prompt.trim()
      : "";

  // Refinement on and it produced text: use it. Otherwise fall back to sanitized.
  const useRefined = !localOnly && refinedPrompt.length > 0;
  const finalPrompt = useRefined ? refinedPrompt : sanitizedPrompt;

  if (!finalPrompt) {
    return res.status(422).json({
      success: false,
      approved: false,
      message: "The prompt could not be safely processed. Please try again.",
    });
  }

  return res.status(200).json({
    success: true,
    approved: true,
    sanitizedPrompt: finalPrompt,
    refined: useRefined && refinement.refinement_occurred === true,
    refinementMode: refinement.mode ?? null,
    refinementSettings: {
      local_only: localOnly,
      external_provider_enabled: externalProviderEnabled,
    },
    data: { firewall: result },
  });
});

export const analyzeExtensionFile = asyncHandler(async (req, res, next) => {
  const file = req.file;

  if (!file) {
    return next(new ErrorHandler("Please attach a file to analyze.", 400));
  }

  const { localOnly, externalProviderEnabled } = getRefinementSettings(req.body);

  let result;
  try {
    result = await processContext({
      prompt: typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "",
      file,
      localOnly,
      externalProviderEnabled,
    });
    } catch (error) {
    console.error("Firewall call failed:", error);
    return next(
      new ErrorHandler(
        `The Context Firewall is unavailable. File blocked. (${error.message})`,
        502
      )
    );
  }

  const privacy = result?.privacy;
  const duplicateDetection = result?.duplicate_detection;

  if (!privacy || !duplicateDetection) {
    return res.status(502).json({
      success: false,
      approved: false,
      message: "Invalid firewall response. File blocked.",
    });
  }

  console.log("Duplicate detection result:", JSON.stringify(duplicateDetection, null, 2));

  const decision = String(
    privacy.document_decision ?? privacy.document_recommendation ?? ""
  ).toUpperCase();

  const attachmentAction = String(
    privacy.original_attachment_action ?? ""
  ).toLowerCase();

  if (decision === "REMOVE" || attachmentAction === "remove") {
    return res.status(200).json({
      success: true,
      approved: false,
      reason: "REMOVE",
      documentDecision: "REMOVE",
      action: "REMOVE_FILE_AND_REFINE_PROMPT",
      message:
        "This file may contain sensitive information. Remove the file and refine your prompt to reference an accessible resource instead.",
      duplicateDetection,
    });
  }

  // if (duplicateDetection.checked !== true) {
  //   return res.status(422).json({
  //     success: false,
  //     approved: false,
  //     reason: "DUPLICATE_CHECK_UNAVAILABLE",
  //     message: "Duplicate checking could not be completed. File blocked.",
  //     duplicateDetection,
  //   });
  // }

  const duplicateConfirmed =
  duplicateDetection.is_duplicate === true ||
  duplicateDetection.is_duplicate === "true" ||
  duplicateDetection.duplicate === true ||
  duplicateDetection.found === true;

if (duplicateConfirmed) {
  return res.status(200).json({
    success: true,
    approved: false,
    reason: "DUPLICATE",
    message:
      duplicateDetection.message ||
      "This file appears to have been uploaded before. Remove it and ask the AI to use the previously uploaded file.",
    duplicateDetection: { ...duplicateDetection, isDuplicate: true },
  });
}

// Fail closed only if Python gave no usable duplicate result.
if (
  duplicateDetection.checked === false ||
  duplicateDetection.checked === "false" ||
  typeof duplicateDetection.is_duplicate === "undefined"
) {
  return res.status(422).json({
    success: false,
    approved: false,
    reason: "DUPLICATE_CHECK_UNAVAILABLE",
    message: `Duplicate checking could not be completed. File blocked. (${duplicateDetection.reason ?? "no reason given"})`,
    duplicateDetection,
  });
}

  const sanitizedFileContent =
    privacy.masked_document ?? privacy.sanitized_prompt;

  if (typeof sanitizedFileContent !== "string" || !sanitizedFileContent.trim()) {
    return res.status(422).json({
      success: false,
      approved: false,
      message: "No sanitized file content was returned. File blocked.",
    });
  }

  return res.status(200).json({
    success: true,
    approved: true,
    reason: "KEEP",
    documentDecision: "KEEP",
    keepDocument: true,
    message: "The file passed the available firewall checks.",
    sanitizedFileContent: sanitizedFileContent.trim(),
    duplicateDetection,
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
