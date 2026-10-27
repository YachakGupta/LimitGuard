
let isChecking = false;
let isCheckingFile = false;
let allowNextSend = false;
let allowNextSubmit = false;

const blockedAttachments = new Map();
let fileCheckQueue = Promise.resolve();

function getEditor() {
  const selectors = [
    "#prompt-textarea",
    "[contenteditable='true'][role='textbox']",
    "textarea"
  ];

  for (const selector of selectors) {
    for (const element of document.querySelectorAll(selector)) {
      if (
        element instanceof HTMLElement &&
        element.getClientRects().length > 0 &&
        !element.hasAttribute("disabled")
      ) {
        return element;
      }
    }
  }

  return null;
}

function readPrompt(editor) {
  if (
    editor instanceof HTMLInputElement ||
    editor instanceof HTMLTextAreaElement
  ) {
    return editor.value.trim();
  }

  return (editor?.innerText || editor?.textContent || "").trim();
}

function writePrompt(editor, text) {
  editor.focus();

  if (
    editor instanceof HTMLInputElement ||
    editor instanceof HTMLTextAreaElement
  ) {
    const prototype =
      editor instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;

    const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    if (setter) setter.call(editor, text);
    else editor.value = text;

    editor.dispatchEvent(
      new InputEvent("input", { bubbles: true, inputType: "insertText", data: text })
    );
    return;
  }

  // contenteditable (ProseMirror): go through the editing API so the editor's state updates
  document.execCommand("selectAll", false, null);
  document.execCommand("insertText", false, text);
}
async function checkPrompt(prompt) {
  const settings = await chrome.storage.local.get(["refinePrompt"]);

  // Default to enabled if the setting has never been saved.
  const refinePrompt = settings.refinePrompt !== false;

  const result = await chrome.runtime.sendMessage({
    type: "LIMITGUARD_CHECK_PROMPT",
    prompt,
    refinePrompt,
    local_only: !refinePrompt,
    external_provider_enabled: refinePrompt
  });

  console.log("LimitGuard refinement settings:", {
    refinePrompt,
    local_only: !refinePrompt,
    external_provider_enabled: refinePrompt
  });

  console.log("LimitGuard prompt response:", result);
  return result;
}

function getSendButton(editor) {
  const form = editor?.closest("form");

  const selectors = [
    'button[data-testid="send-button"]',
    'button[data-testid*="send"]',
    'button[aria-label*="Send" i]',
    'button[aria-label*="Submit" i]',
    'button[type="submit"]'
  ];

  const scopes = [form, document].filter(Boolean);

  for (const scope of scopes) {
    for (const selector of selectors) {
      for (const button of scope.querySelectorAll(selector)) {
        if (
          button instanceof HTMLButtonElement &&
          !button.disabled &&
          button.getAttribute("aria-disabled") !== "true" &&
          button.getClientRects().length > 0
        ) {
          return button;
        }
      }
    }
  }

  return null;
}

function showNotice(message) {
  alert(`LimitGuard\n\n${message}`);
}


const LIMITGUARD_INPUT_PRICE_INR_PER_MILLION = 200;
const LIMITGUARD_METRICS_KEY = "limitguardTokenMetrics";
const LIMITGUARD_MAX_METRICS = 500;

// Rough estimate: approximately 4 characters per token.
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

async function recordPromptMetrics(originalPrompt, sanitizedPrompt) {
  try {
    // Estimate token counts for both prompt versions.
    const originalTokens = estimateTokens(originalPrompt);
    const sanitizedTokens = estimateTokens(sanitizedPrompt);

    // Do not report negative savings if sanitization makes
    // the prompt longer.
    const tokensSaved = Math.max(
      0,
      originalTokens - sanitizedTokens
    );

    const estimatedCostSavedINR =
      (tokensSaved * LIMITGUARD_INPUT_PRICE_INR_PER_MILLION) /
      1_000_000;

    const metric = {
      originalPromptTokens: originalTokens,
      sanitizedPromptTokens: sanitizedTokens,
      tokensSaved,
      estimatedCostSavedINR: Number(
        estimatedCostSavedINR.toFixed(6)
      ),
      inputPriceINRPerMillion:
        LIMITGUARD_INPUT_PRICE_INR_PER_MILLION,
      timestamp: new Date().toISOString(),
      isEstimate: true
    };

    // Read existing metrics without overwriting previous records.
    const stored = await chrome.storage.local.get(
      LIMITGUARD_METRICS_KEY
    );

    const metrics = Array.isArray(
      stored[LIMITGUARD_METRICS_KEY]
    )
      ? stored[LIMITGUARD_METRICS_KEY]
      : [];

    metrics.push(metric);

    // Keep the latest 500 records to limit storage growth.
    const recentMetrics = metrics.slice(-LIMITGUARD_MAX_METRICS);

    await chrome.storage.local.set({
      [LIMITGUARD_METRICS_KEY]: recentMetrics
    });

    console.log("LimitGuard estimated token metrics:", metric);
  } catch (error) {
    // Analytics errors must never interfere with prompt submission.
    console.error("LimitGuard analytics failed:", error);
  }
}




function fileKey(file) {
  return `${file.name}|${file.size}|${file.lastModified}`;
}

async function protectAndSubmit(editor, clickedButton = null) {
  if (isChecking || isCheckingFile) return;

  if (hasBlockedAttachments()) {
    showNotice(
      "A file is pending or has not passed the firewall check. Remove rejected attachments and wait for checks to finish."
    );
    return;
  }

  const originalPrompt = readPrompt(editor);

  if (!originalPrompt) {
    const button = await waitForSendButton(editor, 3000);
    if (!button) return;

    allowNextSend = true;
    allowNextSubmit = true;
    button.click();

    setTimeout(() => {
      allowNextSend = false;
      allowNextSubmit = false;
    }, 1500);
    return;
  }

  isChecking = true;

  try {
    const result = await checkPrompt(originalPrompt);

    console.log("LimitGuard prompt-check result:", result);

    if (
      result?.success !== true ||
      result?.approved !== true ||
      typeof result?.sanitizedPrompt !== "string" ||
      !result.sanitizedPrompt.trim()
    ) {
      console.error("LimitGuard prompt approval failed:", result);

      showNotice(
        result?.message ||
        "The firewall could not approve this prompt. Nothing was submitted."
      );
      return;
    }

    
    const sanitizedPrompt = result.sanitizedPrompt.trim();

    // Record analytics independently of the submission flow.
    void recordPromptMetrics(originalPrompt, sanitizedPrompt);

    writePrompt(editor, sanitizedPrompt);


    await new Promise((resolve) => setTimeout(resolve, 150));

    if (isCheckingFile || hasBlockedAttachments()) {
      showNotice(
        "A file check is pending or a file was rejected. Nothing was submitted."
      );
      return;
    }

    let sendButton = await waitForSendButton(editor, 5000);

    // Fall back to the button the user originally clicked.
    if (
      !sendButton &&
      clickedButton?.isConnected &&
      !clickedButton.disabled
    ) {
      sendButton = clickedButton;
    }

    allowNextSend = true;
    allowNextSubmit = true;

    if (sendButton) {
      sendButton.click();
    } else {
      // Last resort: press Enter inside the editor.
      editor.focus();
      editor.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true
        })
      );
    }

    // Avoid leaving the bypass flags enabled indefinitely.
    setTimeout(() => {
      allowNextSend = false;
      allowNextSubmit = false;
    }, 1500);

  } catch (error) {
    console.error("LimitGuard prompt check failed:", error);
    console.error("Prompt check stack:", error?.stack);

    showNotice(
      `The firewall could not check this prompt: ${
        error?.message || "Unknown error"
      }. Submission blocked.`
    );
  } finally {
    isChecking = false;
  }
}

function getComposerRoot() {
  const editor = getEditor();
  return (
    editor?.closest("form") ||
    editor?.parentElement?.parentElement ||
    null
  );
}

async function waitForSendButton(editor, timeoutMs = 15000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const button = getSendButton(editor);
    if (button) return button;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return null;
}

// Drop rejected entries whose file is no longer in the message box.
function reconcileBlockedAttachments() {
  const root = getComposerRoot();
  if (!root) return;

  const text = root.innerText || root.textContent || "";

  for (const [key, attachment] of blockedAttachments) {
    if (attachment.status === "pending") continue;
    if (!text.includes(attachment.name)) {
      blockedAttachments.delete(key);
    }
  }
}

function hasBlockedAttachments() {
  reconcileBlockedAttachments();
  return blockedAttachments.size > 0;
}

function handleAttachmentRemoval(event) {
  const button =
    event.target instanceof Element ? event.target.closest("button") : null;
  if (!button) return;

  const label = [
    button.getAttribute("aria-label"),
    button.getAttribute("title"),
    button.getAttribute("data-testid")
  ].filter(Boolean).join(" ").toLowerCase();

  if (!/remove|delete|close|dismiss/.test(label)) return;

  setTimeout(reconcileBlockedAttachments, 600);
}

async function checkFile(file, prompt) {
  const key = fileKey(file);

  blockedAttachments.set(key, {
    name: file.name,
    status: "pending"
  });

  try {
    const bytes = Array.from(
      new Uint8Array(await file.arrayBuffer())
    );

    const result = await chrome.runtime.sendMessage({
      type: "LIMITGUARD_CHECK_FILE",
      fileBytes: bytes,
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      prompt
    });

    console.log(
      "LimitGuard file-check result:",
      file.name,
      result
    );

    if (
      result?.success === true &&
      result?.approved === true &&
      result?.documentDecision === "KEEP"
    ) {
      blockedAttachments.delete(key);

      showNotice(
        `The firewall approved "${file.name}" (KEEP). Ensure the attachment is still present and unchanged before sending.`
      );

      return;
    }

    blockedAttachments.set(key, {
      name: file.name,
      status: "rejected"
    });

    if (result?.reason === "REMOVE") {
      showNotice(
        `The firewall recommends removing "${file.name}". Remove it from ChatGPT before sending.`
      );
    } else if (result?.reason === "DUPLICATE") {
      showNotice(
        `"${file.name}" appears to be a duplicate. Remove it before sending.`
      );
    } else {
      showNotice(
        result?.message ||
        `The firewall could not approve "${file.name}". The file is blocked.`
      );
    }
  } catch (error) {
    console.error("LimitGuard file check failed:", error);
    console.error("File check stack:", error?.stack);

    blockedAttachments.set(key, {
      name: file.name,
      status: "rejected"
    });

    showNotice(
      `The firewall could not check "${file.name}". Do not send it until verification succeeds.`
    );
  }
}

// Intercept file selections and queue checks sequentially.
document.addEventListener("change", (event) => {
  const input = event.target;

  if (
    !(input instanceof HTMLInputElement) ||
    input.type !== "file" ||
    !input.files?.length
  ) {
    return;
  }

  const files = Array.from(input.files);
  const editor = getEditor();
  const prompt = editor ? readPrompt(editor) : "";

  for (const file of files) {
    blockedAttachments.set(fileKey(file), {
      name: file.name,
      status: "pending"
    });
  }

  isCheckingFile = true;

  fileCheckQueue = fileCheckQueue
    .then(async () => {
      for (const file of files) {
        await checkFile(file, prompt);
      }
    })
    .catch((error) => {
      console.error("LimitGuard file queue failed:", error);
      showNotice(
        "A file check failed. Attachments remain blocked until removed."
      );
    })
    .finally(() => {
      isCheckingFile = false;
    });
}, true);

// Track removal of rejected attachments.
document.addEventListener("click", handleAttachmentRemoval, true);

// Intercept Send button clicks.
document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const button = target.closest("button");
  if (!button) return;

  if (allowNextSend) {
    allowNextSend = false;
    return;
  }

  const label = [
    button.getAttribute("aria-label"),
    button.getAttribute("data-testid"),
    button.getAttribute("title")
  ].filter(Boolean).join(" ").toLowerCase();

  const isSendButton =
    /send|submit/.test(label) ||
    Boolean(button.querySelector("svg.icon-primary-action"));

  if (!isSendButton) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  const editor = getEditor();

  if (!editor) {
    showNotice("The prompt editor could not be found. Submission blocked.");
    return;
  }

  void protectAndSubmit(editor, button);
}, true);

// Intercept Enter submissions.
document.addEventListener("keydown", (event) => {
  if (
    event.key !== "Enter" ||
    event.shiftKey ||
    event.isComposing
  ) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Element)) return;

  const editor = target.closest(
    "#prompt-textarea, [contenteditable='true'][role='textbox'], textarea"
  );

  if (!editor) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  if (isChecking || isCheckingFile || hasBlockedAttachments()) {
    if (hasBlockedAttachments()) {
      showNotice(
        "A file is pending or has not passed the firewall check. Remove rejected files and wait for pending checks."
      );
    }

    return;
  }

  void protectAndSubmit(editor, button);
}, true);

// Intercept form submissions that bypass the Send click.
document.addEventListener("submit", (event) => {
  if (allowNextSubmit) {
    allowNextSubmit = false;
    return;
  }

  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;

  if (
    !form.querySelector(
      "#prompt-textarea, [contenteditable='true'], textarea"
    )
  ) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  const editor = getEditor();

  if (!editor) {
    showNotice("The prompt editor could not be found. Submission blocked.");
    return;
  }

  void protectAndSubmit(editor, button);
}, true);

console.log("LimitGuard prompt and file protection loaded.");
