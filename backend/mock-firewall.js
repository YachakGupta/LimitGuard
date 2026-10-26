
import express from "express";

const app = express();

app.post("/context-firewall", (req, res) => {
  return res.status(200).json({
    privacy: {
      corrected_prompt: "Mock prompt for testing",
      document_recommendation: "KEEP",
      sensitivity_level: "LOW",
      masked_document: null,
      findings: [],
      filename: null
    },
    duplicate_detection: {
      checked: true,
      reason: "Mock response for integration testing"
    },
    prompt_refinement: {
      refined_prompt: "Please analyze the provided prompt clearly."
    }
  });
});

app.listen(8001, "127.0.0.1", () => {
  console.log("Mock firewall running at http://127.0.0.1:8001");
});
