
import mongoose from "mongoose";

const contextSchema = new mongoose.Schema(
  {
    originalText: {
      type: String,
      required: true,
      trim: true,
    },

    sanitizedText: {
      type: String,
      default: "",
    },

    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical", "unknown"],
      default: "unknown",
    },

    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    detectedThreats: {
      type: [String],
      default: [],
    },

    analysisStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Context = mongoose.model("Context", contextSchema);

export default Context;
