import ProtectionEvent from "../models/protectionEventModel.js";

const INPUT_PRICE_INR_PER_MILLION = 200;

const estimateTokens = (text = "") => Math.ceil(text.length / 4);

const normalizeRiskLevel = (value) => {
  if (typeof value !== "string") return "unknown";

  const risk = value.toLowerCase();

  return ["low", "medium", "high", "critical"].includes(risk)
    ? risk
    : "unknown";
};

export const captureProtectionEvent = (eventType) => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    let recorded = false;

    res.json = (body) => {
      if (!recorded) {
        recorded = true;

        // Save metrics asynchronously without delaying the response.
        void (async () => {
          try {
            if (!req.user?._id) return;

            const firewall =
              body?.data?.firewall ??
              body?.firewall ??
              body?.data ??
              {};

            const privacy = firewall?.privacy ?? {};

            const findings =
              privacy?.findings ??
              privacy?.detected_threats ??
              firewall?.findings ??
              [];

            const detections = Array.isArray(findings)
              ? findings.length
              : 0;

            const originalPrompt =
              typeof req.body?.prompt === "string"
                ? req.body.prompt
                : typeof req.body?.text === "string"
                  ? req.body.text
                  : "";

            const sanitizedPrompt =
              typeof body?.sanitizedPrompt === "string"
                ? body.sanitizedPrompt
                : "";

            const blocked =
              res.statusCode >= 400 ||
              body?.approved === false ||
              body?.success === false;

            let status = "ALLOWED";
            let originalTokens = 0;
            let sanitizedTokens = 0;
            let tokensSaved = 0;
            let estimatedCostSavedINR = 0;

            if (blocked) {
              status = "BLOCKED";
            } else if (
              eventType === "PROMPT" &&
              originalPrompt !== sanitizedPrompt
            ) {
              status = "SANITIZED";
            }

            if (eventType === "PROMPT") {
              originalTokens = estimateTokens(originalPrompt);
              sanitizedTokens = estimateTokens(
                sanitizedPrompt || originalPrompt
              );

              tokensSaved = Math.max(
                0,
                originalTokens - sanitizedTokens
              );

              estimatedCostSavedINR =
                (tokensSaved * INPUT_PRICE_INR_PER_MILLION) /
                1_000_000;
            }

            const riskLevel = normalizeRiskLevel(
              privacy?.risk_level ??
              privacy?.riskLevel ??
              firewall?.riskLevel
            );

            await ProtectionEvent.create({
              user: req.user._id,
              eventType,
              status,
              sensitiveDataDetections: detections,
              riskLevel,
              originalPromptTokens: originalTokens,
              sanitizedPromptTokens: sanitizedTokens,
              tokensSaved,
              estimatedCostSavedINR: Number(
                estimatedCostSavedINR.toFixed(6)
              ),
              isEstimate: true,
            });
          } catch (error) {
            // Analytics failures should not break prompt protection.
            console.error("Could not record protection event:", error);
          }
        })();
      }

      return originalJson(body);
    };

    next();
  };
};