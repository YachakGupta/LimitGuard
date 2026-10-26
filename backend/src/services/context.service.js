
import Context from "../models/contextModel.js";

export const analyzeContextService = async (text) => {
  const context = await Context.create({
    originalText: text.trim(),
    analysisStatus: "pending",
  });

  return context;
};
