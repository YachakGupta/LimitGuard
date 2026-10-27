import "dotenv/config";
const FIREWALL_API_URL = (
  process.env.FIREWALL_API_URL || "http://127.0.0.1:8001"
).replace(/\/+$/, "");

export const processContext = async ({
  prompt,
  file,
  localOnly = true,
  externalProviderEnabled = false,
  mockHeaders,
}) => {
  if (
    (typeof prompt !== "string" || !prompt.trim()) &&
    !file
  ) {
    throw new Error("Provide a prompt or a file.");
  }

  const formData = new FormData();

  if (typeof prompt === "string" && prompt.trim()) {
    formData.append("prompt", prompt.trim());
  }

  if (file?.buffer && file?.originalname) {
    formData.append(
      "file",
      new Blob([file.buffer], {
        type: file.mimetype || "application/octet-stream",
      }),
      file.originalname
    );
  }

  formData.append("local_only", String(localOnly));
  formData.append(
    "external_provider_enabled",
    String(externalProviderEnabled)
  );

  // Forward mock-test headers only to the local mock server.
  const headers = {};

  if (new URL(FIREWALL_API_URL).port === "8000") {
    if (mockHeaders?.recommendation) {
      headers["x-mock-recommendation"] =
        mockHeaders.recommendation;
    }

    if (mockHeaders?.sensitivity) {
      headers["x-mock-sensitivity"] =
        mockHeaders.sensitivity;
    }

    if (mockHeaders?.findings) {
      headers["x-mock-findings"] = mockHeaders.findings;
    }
  }

  console.log("Firewall URL:", FIREWALL_API_URL);
  console.log("Firewall endpoint:", `${FIREWALL_API_URL}/context-firewall`);

  let response;

  try {
    response = await fetch(`${FIREWALL_API_URL}/context-firewall`, {
      method: "POST",
      body: formData,
      headers,
      signal: AbortSignal.timeout(30000),
    });
  } catch (error) {
    console.error("Firewall fetch failed:", {
      message: error.message,
      cause: error.cause,
      url: `${FIREWALL_API_URL}/context-firewall`,
    });

    throw new Error(`Context Firewall API unavailable: ${error.message}`);
  }
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      `Context Firewall returned HTTP ${response.status}`
    );
  }

  if (
    !data?.privacy ||
    !data?.duplicate_detection ||
    !data?.prompt_refinement
  ) {
    throw new Error(
      "Context Firewall returned an unexpected response."
    );
  }

  return data;
};
