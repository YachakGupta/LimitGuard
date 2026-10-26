
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "New conversation",
    },
    titleGenerated: {
      type: Boolean,
      default: false,
    },
    modelProvider: {
      type: String,
      trim: true,
      required: true,
      maxlength: 50,
    },
    modelId: {
      type: String,
      trim: true,
      required: true,
      maxlength: 100,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ user: 1, updatedAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
