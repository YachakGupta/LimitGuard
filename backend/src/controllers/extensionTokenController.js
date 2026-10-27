import jwt from "jsonwebtoken";
import ExtensionToken from "../models/extensionTokenModel.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const TOKEN_LIFETIME_DAYS = 30;

const createExtensionToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign(
    {
      id: userId.toString(),
      tokenType: "extension",
    },
    process.env.JWT_SECRET,
    { expiresIn: `${TOKEN_LIFETIME_DAYS}d` }
  );

  const expiresAt = new Date(
    Date.now() + TOKEN_LIFETIME_DAYS * 24 * 60 * 60 * 1000
  );

  return { token, expiresAt };
};

// GET /api/v1/extension-token
export const getExtensionToken = asyncHandler(async (req, res) => {
  const record = await ExtensionToken.findOne({
    user: req.user._id,
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).select("+token");

  if (!record) {
    return res.status(200).json({
      success: true,
      connected: false,
      token: null,
      message: "No active extension token. Generate one to connect.",
    });
  }

  return res.status(200).json({
    success: true,
    connected: true,
    token: record.token,
    expiresAt: record.expiresAt,
  });
});

// GET /api/v1/extension-token/status
export const getExtensionTokenStatus = asyncHandler(
  async (req, res) => {
    const record = await ExtensionToken.findOne({
      user: req.user._id,
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).select("_id expiresAt updatedAt");

    return res.status(200).json({
      success: true,
      connected: Boolean(record),
      expiresAt: record?.expiresAt ?? null,
      lastUpdated: record?.updatedAt ?? null,
    });
  }
);

// POST /api/v1/extension-token/generate
export const generateExtensionToken = asyncHandler(
  async (req, res) => {
    const existing = await ExtensionToken.findOne({
      user: req.user._id,
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).select("+token");

    if (existing) {
      return res.status(200).json({
        success: true,
        token: existing.token,
        expiresAt: existing.expiresAt,
        message: "An active extension token already exists.",
      });
    }

    const { token, expiresAt } = createExtensionToken(req.user._id);

    await ExtensionToken.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          token,
          expiresAt,
          isActive: true,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    return res.status(201).json({
      success: true,
      token,
      expiresAt,
      message: "Extension token generated successfully.",
    });
  }
);

// POST /api/v1/extension-token/rotate
export const rotateExtensionToken = asyncHandler(
  async (req, res) => {
    const { token, expiresAt } = createExtensionToken(req.user._id);

    await ExtensionToken.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          token,
          expiresAt,
          isActive: true,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      token,
      expiresAt,
      message: "Extension token rotated successfully.",
    });
  }
);

// DELETE /api/v1/extension-token
export const revokeExtensionToken = asyncHandler(
  async (req, res) => {
    await ExtensionToken.findOneAndUpdate(
      { user: req.user._id },
      { $set: { isActive: false } }
    );

    return res.status(200).json({
      success: true,
      message: "Extension token revoked successfully.",
    });
  }
);