
const BACKEND_URL = "http://localhost:5000/api/v1/context";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "LIMITGUARD_TEST") {
    sendResponse({
      success: true,
      message: "Background is reachable."
    });
    return false;
  }

  const isPromptCheck = message?.type === "LIMITGUARD_CHECK_PROMPT";
  const isFileCheck = message?.type === "LIMITGUARD_CHECK_FILE";

  if (!isPromptCheck && !isFileCheck) {
    return false;
  }

  (async () => {
    try {
      // Get the saved authentication token.
      const stored = await chrome.storage.local.get(["limitguardToken"]);

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
            message: "Please enter a prompt to check."
          });
          return;
        }

        response = await fetch(`${BACKEND_URL}/extension/analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${stored.limitguardToken}`
          },
          body: JSON.stringify({
            prompt: message.prompt,
            refinePrompt: message.refinePrompt === true
          })
        });
      } else {
        // Validate the file metadata before uploading it.
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

        // Keep this aligned with the backend's 10 MB upload limit.
        const MAX_FILE_SIZE = 10 * 1024 * 1024;

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

      const data = await response.json().catch(() => null);

      // Fail closed on HTTP errors or malformed responses.
      if (!response.ok || !data || data.approved !== true) {
        sendResponse({
          success: false,
          approved: false,
          reason: data?.reason || "BLOCKED",
          message:
            data?.message ||
            `The firewall did not approve the ${isFileCheck ? "file" : "prompt"}. Submission blocked.`
        });
        return;
      }

      // A prompt approval must include a sanitized prompt.
      if (
        isPromptCheck &&
        (
          typeof data.sanitizedPrompt !== "string" ||
          !data.sanitizedPrompt.trim()
        )
      ) {
        sendResponse({
          success: false,
          approved: false,
          reason: "MISSING_SANITIZED_PROMPT",
          message: "No sanitized prompt was returned. Submission blocked."
        });
        return;
      }

      // A file approval must include the sanitized content expected
      // by the backend's file-analysis controller.
      if (
        isFileCheck &&
        (
          typeof data.sanitizedFileContent !== "string" ||
          !data.sanitizedFileContent.trim()
        )
      ) {
        sendResponse({
          success: false,
          approved: false,
          reason: "MISSING_SANITIZED_FILE",
          message: "No sanitized file content was returned. File blocked."
        });
        return;
      }

      sendResponse({
        success: true,
        approved: true,
        sanitizedPrompt: data.sanitizedPrompt,
        sanitizedFileContent: data.sanitizedFileContent,
        duplicateDetection: data.duplicateDetection || null,
        refined: data.refined === true,
        message: data.message || "Firewall check passed."
      });
    } catch (error) {
      console.error("LimitGuard request failed:", error);

      sendResponse({
        success: false,
        approved: false,
        reason: "FIREWALL_UNAVAILABLE",
        message: "Cannot reach LimitGuard. Submission blocked."
      });
    }
  })();

  // Keep the message channel open for the asynchronous response.
  return true;
});
