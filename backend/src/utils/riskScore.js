
const BASE_SCORES = {
  low: 10,
  medium: 35,
  high: 65,
  critical: 90,
  unknown: 50,
};

export const calculateRiskScore = (sensitivityLevel, findings = []) => {
  const level = String(sensitivityLevel || "unknown").toLowerCase();
  const baseScore = BASE_SCORES[level] ?? BASE_SCORES.unknown;

  const distinctFindings = new Set(
    findings
      .map((finding) =>
        typeof finding === "string"
          ? finding.trim()
          : JSON.stringify(finding)
      )
      .filter(Boolean)
  ).size;

  return Math.min(
    100,
    baseScore + 5 * Math.min(distinctFindings, 4)
  );
};
