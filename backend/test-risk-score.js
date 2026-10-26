
import { calculateRiskScore } from "./src/utils/riskScore.js";

console.log(calculateRiskScore("LOW", [])); // 10
console.log(calculateRiskScore("MEDIUM", ["A", "B"])); // 45
console.log(calculateRiskScore("HIGH", ["A"])); // 70
console.log(calculateRiskScore("CRITICAL", ["A", "B", "C", "D"])); // 100
console.log(calculateRiskScore("unknown", [])); // 50
