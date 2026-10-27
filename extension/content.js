
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
    const prototype = editor instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;

    const setter = Object.getOwnPropertyDescriptor(
      prototype,
      "value"
    )?.set;

    if (setter) setter.call(editor, text);
    else editor.value = text;
  } else {
    editor.textContent = text;
  }

  editor.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      inputType: "insertText",
      data: text
    })
  );
}

async function checkPrompt(prompt) {
  const settings = await chrome.storage.local.get(["refinePrompt"]);

  return chrome.runtime.sendMessage({
    type: "LIMITGUARD_CHECK_PROMPT",
    prompt,
    refinePrompt: settings.refinePrompt === true
  });
}

function getSendButton(editor) {
  const form = editor?.closest("form");

  const candidates = [
    ...(form ? form.querySelectorAll("button") : []),
    ...document.querySelectorAll('button[data-testid="send-button"]')
  ];

  return candidates.find((button) => {
    if (!(button instanceof HTMLButtonElement) || button.disabled) {
      return false;
    }

    const label = [
      button.getAttribute("aria-label"),
      button.getAttribute("data-testid"),
      button.getAttribute("title")
    ].filter(Boolean).join(" ").toLowerCase();

    return /send|submit/.test(label) ||
      Boolean(button.querySelector("svg.icon-primary-action"));
  }) || null;
}

function showNotice(message) {
  alert(`LimitGuard\n\n${message}`);
}

function hasBlockedAttachments() {
  return blockedAttachments.size > 0;
}

function fileKey(file) {
  return `${file.name}|${file.size}|${file.lastModified}`;
}

async function protectAndSubmit(editor) {
  if (isChecking || isCheckingFile) return;

  if (hasBlockedAttachments()) {
    showNotice(
      "A file has not passed the firewall check. Remove the rejected attachment from ChatGPT before sending."
    );
    return;
  }

  const originalPrompt = readPrompt(editor);
  if (!originalPrompt) return;

  isChecking = true;

  try {
    const result = await checkPrompt(originalPrompt);

    if (
      result?.success !== true ||
      result?.approved !== true ||
      typeof result.sanitizedPrompt !== "string" ||
      !result.sanitizedPrompt.trim()
    ) {
      showNotice(
        result?.message ||
        "The firewall did not approve this prompt. Nothing was submitted."
      );
      return;
    }

    // Submit the sanitized prompt, never the unapproved original.
    writePrompt(editor, result.sanitizedPrompt.trim());

    await new Promise((resolve) => setTimeout(resolve, 150));

    // Recheck attachment state before submitting.
    if (isCheckingFile || hasBlockedAttachments()) {
      showNotice(
        "A file check is pending or a file was rejected. Nothing was submitted."
      );
      return;
    }

    const sendButton = getSendButton(editor);

    if (!sendButton) {
      showNotice(
        "The prompt was approved, but the Send button could not be found. Please check the prompt and submit manually after verifying it."
      );
      return;
    }

    allowNextSend = true;
    allowNextSubmit = true;
    sendButton.click();

    setTimeout(() => {
      allowNextSend = false;
      allowNextSubmit = false;
    }, 1500);
  } catch (error) {
    console.error("LimitGuard prompt check failed:", error);

    showNotice(
      "The firewall could not check this prompt. Submission blocked."
    );
  } finally {
    isChecking = false;
  }
}

function findBlockedFileInElement(element) {
  let current = element;

  for (let depth = 0; current && depth < 7; depth++) {
    const text = current.innerText || current.textContent || "";

    for (const [, attachment] of blockedAttachments) {
      if (text.includes(attachment.name)) {
        return attachment.name;
      }
    }

    current = current.parentElement;
  }

  return null;
}

function handleAttachmentRemoval(event) {
  const target = event.target;

  if (!(target instanceof Element)) return;

  const button = target.closest("button");
  if (!button) return;

  const label = [
    button.getAttribute("aria-label"),
    button.getAttribute("title"),
    button.getAttribute("data-testid")
  ].filter(Boolean).join(" ").toLowerCase();

  if (!/remove|delete/.test(label)) return;

  const fileName = findBlockedFileInElement(button);
  if (!fileName) return;

  // Wait for ChatGPT to update its attachment UI.
  setTimeout(() => {
    const stillVisible = document.body.innerText.includes(fileName);

    if (!stillVisible) {
      for (const [key, attachment] of blockedAttachments) {
        if (attachment.name === fileName) {
          blockedAttachments.delete(key);
        }
      }

      console.log("LimitGuard: rejected attachment removed:", fileName);
    }
  }, 500);
}

async function checkFile(file, input, prompt) {
  const key = fileKey(file);

  // Pending files are blocked until the firewall approves them.
  blockedAttachments.set(key, {
    name: file.name,
    status: "pending"
  });

  try {
    const bytes = Array.from(new Uint8Array(await file.arrayBuffer()));

    const result = await chrome.runtime.sendMessage({
      type: "LIMITGUARD_CHECK_FILE",
      fileBytes: bytes,
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      prompt
    });

    if (result?.success === true && result?.approved === true) {
      blockedAttachments.delete(key);

      showNotice(
        `The firewall approved "${file.name}". The attachment must still be present and unchanged before you send it.`
      );

      return;
    }

    if (result?.reason === "REMOVE") {
      blockedAttachments.set(key, {
        name: file.name,
        status: "rejected"
      });

      showNotice(
        `The firewall recommends removing "${file.name}". Remove the attachment from ChatGPT before sending. Update your prompt to reference an approved resource if needed.`
      );
    } else if (result?.reason === "DUPLICATE") {
      blockedAttachments.set(key, {
        name: file.name,
        status: "rejected"
      });

      showNotice(
        `"${file.name}" appears to be a duplicate. Remove the attachment and ask ChatGPT to use the previously uploaded file.`
      );
    } else {
      blockedAttachments.set(key, {
        name: file.name,
        status: "rejected"
      });

      showNotice(
        result?.message ||
        `The firewall did not approve "${file.name}". Remove it before sending.`
      );
    }
  } catch (error) {
    console.error("LimitGuard file check failed:", error);

    blockedAttachments.set(key, {
      name: file.name,
      status: "rejected"
    });

    showNotice(
      `The firewall could not check "${file.name}". Do not send it until the check succeeds.`
    );
  }
}

// Intercept file selections and process each file in sequence.
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

  // Mark files as pending immediately so Send cannot bypass the checks.
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
        await checkFile(file, input, prompt);
      }
    })
    .catch((error) => {
      console.error("LimitGuard file queue failed:", error);

      showNotice(
        "A file check failed. Do not send attachments until their checks succeed."
      );
    })
    .finally(() => {
      isCheckingFile = false;
    });
}, true);

// Watch removal buttons for rejected attachments.
document.addEventListener("click", handleAttachmentRemoval, true);

// Intercept Send clicks.
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

  void protectAndSubmit(editor);
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
        "A file is pending or has not passed the firewall check. Remove rejected attachments and wait for pending checks before sending."
      );
    }

    return;
  }

  void protectAndSubmit(editor);
}, true);

// Intercept form submissions that bypass the Send click.
document.addEventListener("submit", (event) => {
  if (allowNextSubmit) {
    allowNextSubmit = false;
    return;
  }

  const form = event.target;

  if (!(form instanceof HTMLFormElement)) return;
  if (!form.querySelector("#prompt-textarea, [contenteditable='true'], textarea")) {
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

  void protectAndSubmit(editor);
}, true);

console.log("LimitGuard Phase 4 prompt and file protection loaded.");
