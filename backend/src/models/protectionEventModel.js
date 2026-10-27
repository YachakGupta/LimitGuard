import mongoose from "mongoose";

const protectionEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ["PROMPT", "FILE"],
      required: true,
    },
    status: {
      type: String,
      enum: ["SANITIZED", "ALLOWED", "BLOCKED"],
      required: true,
    },
    sensitiveDataDetections: {
      type: Number,
      default: 0,
      min: 0,
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical", "unknown"],
      default: "unknown",
    },
    originalPromptTokens: {
      type: Number,
      default: 0,
      min: 0,
    },
    sanitizedPromptTokens: {
      type: Number,
      default: 0,
      min: 0,
    },
    tokensSaved: {
      type: Number,
      default: 0,
      min: 0,
    },
    estimatedCostSavedINR: {
      type: Number,
      default: 0,
      min: 0,
    },
    isEstimate: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

protectionEventSchema.index({ user: 1, createdAt: -1 });
protectionEventSchema.index({ user: 1, eventType: 1, createdAt: -1 });

const ProtectionEvent = mongoose.model(
  "ProtectionEvent",
  protectionEventSchema
);

export default ProtectionEvent;