
import express from "express";

const app = express();

app.post("/context-firewall", (req, res) => {
  const recommendation =
    req.get("x-mock-recommendation") === "REMOVE"
      ? "REMOVE"
      : "KEEP";

  const sensitivityLevel =
    req.get("x-mock-sensitivity") || "LOW";

  const findingsHeader = req.get("x-mock-findings");
  const findings = findingsHeader
    ? findingsHeader.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

  return res.status(200).json({
    privacy: {
      corrected_prompt: "Mock prompt for testing",
      document_recommendation: recommendation,
      sensitivity_level: sensitivityLevel,
      masked_document: null,
      findings,
      filename: null,
    },
    duplicate_detection: {
      checked: recommendation !== "REMOVE",
      reason:
        recommendation === "REMOVE"
          ? "Skipped because the document was marked REMOVE"
          : "Mock response; no real duplicate check performed",
    },
    prompt_refinement: {
      refined_prompt: "Please analyze the provided prompt clearly.",
    },
  });
});

app.listen(8001, "127.0.0.1", () => {
  console.log("Mock firewall running at http://127.0.0.1:8001");
});
