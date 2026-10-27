
const tokenInput = document.getElementById("token");
const connectButton = document.getElementById("connect");
const statusText = document.getElementById("status");

chrome.storage.local.get(["limitguardToken"], (data) => {
  if (data.limitguardToken) {
    tokenInput.placeholder = "Token saved";
    statusText.textContent = "Token saved locally.";
  }
});

connectButton.addEventListener("click", () => {
  const token = tokenInput.value.trim();

  if (!token) {
    statusText.textContent = "Please enter your token.";
    return;
  }

  chrome.storage.local.set({ limitguardToken: token }, () => {
    tokenInput.value = "";
    tokenInput.placeholder = "Token saved";
    statusText.textContent = "Token saved locally.";
  });
});



const refinePromptToggle = document.getElementById("refinePrompt");

// Restore the saved setting. Refinement defaults to ON.
chrome.storage.local.get(["refinePrompt"], (data) => {
  refinePromptToggle.checked = data.refinePrompt !== false;
});

// Save changes immediately.
refinePromptToggle.addEventListener("change", () => {
  chrome.storage.local.set({
    refinePrompt: refinePromptToggle.checked
  });
});

