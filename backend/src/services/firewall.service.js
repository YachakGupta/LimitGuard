import "dotenv/config";
const FIREWALL_API_URL = (
  process.env.FIREWALL_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export const processContext = async ({
  prompt,
  file,
  localOnly = true,
  externalProviderEnabled = false   
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
  const detail = data?.detail ?? data?.message;
  const message =
    typeof detail === "string"
      ? detail
      : detail
      ? JSON.stringify(detail)
      : `Context Firewall returned HTTP ${response.status}`;

  console.error("Firewall HTTP status:", response.status);
  console.error("Firewall error detail:", message);

  throw new Error(message);
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
