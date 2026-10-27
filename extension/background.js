
const BACKEND_URL = "http://localhost:5000/api/v1/context";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Read the checkbox setting.
// Default to enabled if it has never been saved.
async function getRefinementSettings() {
  const stored = await chrome.storage.local.get([
    "refinePrompt"
  ]);

  const refinePrompt = stored.refinePrompt !== false;

  return {
    refinePrompt,
    local_only: !refinePrompt,
    external_provider_enabled: refinePrompt
  };
}

function normalizePromptResponse(body) {
  const firewall = body?.data?.firewall;

  const sanitizedPrompt =
    body?.sanitizedPrompt ??
    firewall?.prompt_refinement?.refined_prompt ??
    firewall?.privacy?.sanitized_prompt;

  const approved =
    body?.approved === true ||
    (
      body?.success === true &&
      typeof sanitizedPrompt === "string" &&
      sanitizedPrompt.trim().length > 0
    );

  if (!approved) {
    return {
      success: false,
      approved: false,
      reason: body?.reason || "PROMPT_NOT_APPROVED",
      message: body?.message || "Prompt verification failed."
    };
  }

  if (
    typeof sanitizedPrompt !== "string" ||
    !sanitizedPrompt.trim()
  ) {
    return {
      success: false,
      approved: false,
      reason: "MISSING_SANITIZED_PROMPT",
      message: "The backend did not return a sanitized prompt."
    };
  }

  return {
    success: true,
    approved: true,
    sanitizedPrompt: sanitizedPrompt.trim(),
    refined:
      firewall?.prompt_refinement?.refinement_occurred === true ||
      body?.refined === true,
    message: body?.message || "Prompt verification passed."
  };
}

function normalizeFileResponse(body) {
  const firewall = body?.data?.firewall;
  const privacy = firewall?.privacy;
  const duplicate =
    firewall?.duplicate_detection ?? body?.duplicateDetection;

  const rawDecision =
    privacy?.document_decision ??
    body?.document_decision ??
    body?.documentDecision ??
    body?.decision;

  const decision =
    typeof rawDecision === "string"
      ? rawDecision.trim().toUpperCase()
      : "";

  const isDuplicate =
    duplicate?.isDuplicate === true ||
    duplicate?.duplicate === true ||
    duplicate?.is_duplicate === true ||
    duplicate?.is_duplicate === "true";

  if (isDuplicate) {
    return {
      success: false,
      approved: false,
      reason: "DUPLICATE",
      message: "This document appears to be a duplicate.",
      duplicateDetection: duplicate
    };
  }

  const keepDocument =
    decision === "KEEP" ||
    privacy?.keepDocument === true ||
    body?.keepDocument === true;

  if (!keepDocument) {
    return {
      success: false,
      approved: false,
      reason: decision === "REMOVE" ? "REMOVE" : "DOCUMENT_NOT_APPROVED",
      message:
        body?.message ||
        (decision === "REMOVE"
          ? "The document verification agent recommends removing this document."
          : "No explicit KEEP decision was returned. The document is blocked."),
      duplicateDetection: duplicate || null,
      documentDecision: decision || null
    };
  }

  return {
    success: true,
    approved: true,
    reason: "KEEP",
    documentDecision: "KEEP",
    duplicateDetection: duplicate || null,
    message: body?.message || "Document verification passed."
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "LIMITGUARD_TEST") {
    sendResponse({
      success: true,
      message: "Background is reachable."
    });
    return false;
  }

  const isPromptCheck =
    message?.type === "LIMITGUARD_CHECK_PROMPT";

  const isFileCheck =
    message?.type === "LIMITGUARD_CHECK_FILE";

  if (!isPromptCheck && !isFileCheck) {
    return false;
  }

  (async () => {
    try {
      const stored = await chrome.storage.local.get([
        "limitguardToken"
      ]);

      if (!stored.limitguardToken) {
        sendResponse({
          success: false,
          approved: false,
          reason: "NOT_AUTHENTICATED",
          message: "Connect LimitGuard first. Submission blocked."
        });
        return;
      }

      let response;

      if (isPromptCheck) {
        if (
          typeof message.prompt !== "string" ||
          !message.prompt.trim()
        ) {
          sendResponse({
            success: false,
            approved: false,
            reason: "INVALID_PROMPT",
            message: "Please enter a prompt to check."
          });
          return;
        }

        const settings = await getRefinementSettings();

        const requestBody = {
          prompt: message.prompt,
          ...settings
        };

        console.log(
          "LimitGuard prompt settings sent to Node.js:",
          {
            refinePrompt: requestBody.refinePrompt,
            local_only: requestBody.local_only,
            external_provider_enabled:
              requestBody.external_provider_enabled
          }
        );

        response = await fetch(
          `${BACKEND_URL}/extension/analyze`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${stored.limitguardToken}`
            },
            body: JSON.stringify(requestBody)
          }
        );
      } else {
        if (
          !Array.isArray(message.fileBytes) ||
          typeof message.fileName !== "string" ||
          !message.fileName.trim()
        ) {
          sendResponse({
            success: false,
            approved: false,
            reason: "INVALID_FILE",
            message: "File data is missing or invalid. File blocked."
          });
          return;
        }

        const fileBytes = new Uint8Array(message.fileBytes);

        if (fileBytes.length === 0) {
          sendResponse({
            success: false,
            approved: false,
            reason: "EMPTY_FILE",
            message: "The selected file is empty. File blocked."
          });
          return;
        }

        if (fileBytes.byteLength > MAX_FILE_SIZE) {
          sendResponse({
            success: false,
            approved: false,
            reason: "FILE_TOO_LARGE",
            message: "The file exceeds the 10 MB limit. File blocked."
          });
          return;
        }

        const fileBlob = new Blob([fileBytes], {
          type: message.fileType || "application/octet-stream"
        });

        const formData = new FormData();
        formData.append("file", fileBlob, message.fileName);

        if (
          typeof message.prompt === "string" &&
          message.prompt.trim()
        ) {
          formData.append("prompt", message.prompt.trim());
        }

        const settings = await getRefinementSettings();

        formData.append(
          "refinePrompt",
          String(settings.refinePrompt)
        );
        formData.append(
          "local_only",
          String(settings.local_only)
        );
        formData.append(
          "external_provider_enabled",
          String(settings.external_provider_enabled)
        );

        console.log(
          "LimitGuard file settings sent to Node.js:",
          settings
        );

        response = await fetch(
          `${BACKEND_URL}/extension/analyze-file`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${stored.limitguardToken}`
            },
            body: formData
          }
        );
      }

      const body = await response.json().catch(() => null);

      console.log(
        "LimitGuard endpoint:",
        isFileCheck ? "analyze-file" : "analyze"
      );
      console.log("LimitGuard HTTP status:", response.status);
      console.log("LimitGuard raw API response:", body);

      if (!response.ok || !body) {
        sendResponse({
          success: false,
          approved: false,
          reason: body?.reason || `HTTP_${response.status}`,
          message:
            body?.message ||
            `Backend request failed with HTTP ${response.status}.`,
          duplicateDetection: body?.duplicateDetection ?? null
        });
        return;
      }

      const result = isPromptCheck
        ? normalizePromptResponse(body)
        : normalizeFileResponse(body);

      console.log("LimitGuard normalized result:", result);
      sendResponse(result);

    } catch (error) {
      console.error("LimitGuard request failed:", error);

      sendResponse({
        success: false,
        approved: false,
        reason: "FIREWALL_UNAVAILABLE",
        message: error?.message || "Cannot reach LimitGuard."
      });
    }
  })();

  return true;
});
