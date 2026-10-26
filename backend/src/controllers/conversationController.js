
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import ErrorHandler from "../middlewares/error.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";


const createFallbackTitle = (content) => {
  const cleaned = content.trim().replace(/\s+/g, " ");
  return cleaned.length > 50
    ? `${cleaned.slice(0, 47)}...`
    : cleaned;
};


export const createConversation = asyncHandler(async (req, res, next) => {
  const { title, modelProvider, modelId } = req.body;

  if (
    title !== undefined &&
    (typeof title !== "string" || title.trim().length > 200)
  ) {
    return next(
      new ErrorHandler(
        "Title must be text and cannot exceed 200 characters",
        400
      )
    );
  }

  if (
    typeof modelProvider !== "string" ||
    !modelProvider.trim() ||
    modelProvider.trim().length > 50
  ) {
    return next(
      new ErrorHandler("A valid model provider is required", 400)
    );
  }

  if (
    typeof modelId !== "string" ||
    !modelId.trim() ||
    modelId.trim().length > 100
  ) {
    return next(
      new ErrorHandler("A valid model ID is required", 400)
    );
  }

  const conversation = await Conversation.create({
    user: req.user._id,
    title: title?.trim() || "New conversation",
    modelProvider: modelProvider.trim(),
    modelId: modelId.trim(),
  });

  return res.status(201).json({
    success: true,
    message: "Conversation created successfully",
    conversation,
  });
});

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    user: req.user._id,
  })
    .sort({ updatedAt: -1 })
    .lean();

  return res.status(200).json({
    success: true,
    count: conversations.length,
    conversations,
  });
});

export const getConversationMessages = asyncHandler(
  async (req, res, next) => {
    const { conversationId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(conversationId)) {
      return next(new ErrorHandler("Invalid conversation ID", 400));
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: req.user._id,
    });

    if (!conversation) {
      return next(new ErrorHandler("Conversation not found", 404));
    }

    const messages = await Message.find({
      conversation: conversation._id,
      user: req.user._id,
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      conversation,
      count: messages.length,
      messages,
    });
  }
);



export const addMessage = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;
  const { role, content } = req.body;

  if (!/^[0-9a-fA-F]{24}$/.test(conversationId)) {
    return next(new ErrorHandler("Invalid conversation ID", 400));
  }

  if (!["user", "assistant"].includes(role)) {
    return next(
      new ErrorHandler("Role must be user or assistant", 400)
    );
  }

  if (
    typeof content !== "string" ||
    !content.trim() ||
    content.trim().length > 100000
  ) {
    return next(
      new ErrorHandler(
        "Message content is required and must be at most 100000 characters",
        400
      )
    );
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    user: req.user._id,
  });

  if (!conversation) {
    return next(new ErrorHandler("Conversation not found", 404));
  }

  const message = await Message.create({
    conversation: conversation._id,
    user: req.user._id,
    role,
    content: content.trim(),
  });

  
  
    conversation.lastMessageAt = message.createdAt;

    if (role === "user" &&!conversation.titleGenerated && conversation.title === "New conversation") {
         conversation.title = createFallbackTitle(content);
    }
    await conversation.save();


  return res.status(201).json({
    success: true,
    message: "Message saved successfully",
    data: message,
  });
});



export const deleteConversation = asyncHandler(async (req, res, next) => {
    const { conversationId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(conversationId)) {
      return next(new ErrorHandler("Invalid conversation ID", 400));
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: req.user._id,
    });

    if (!conversation) {
      return next(new ErrorHandler("Conversation not found", 404));
    }

    await Message.deleteMany({
      conversation: conversation._id,
      user: req.user._id,
    });

    await conversation.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Conversation and its messages deleted successfully",
    });
  }
);
