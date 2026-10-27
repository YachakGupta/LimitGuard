import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import ExtensionToken from "../models/extensionTokenModel.js";
import { asyncHandler } from "./asyncHandler.js";

export const protectExtension = asyncHandler(
  async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Extension JWT required.",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token || !process.env.JWT_SECRET) {
      return res.status(401).json({
        success: false,
        message: "Invalid extension authentication.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired extension JWT.",
      });
    }

    if (
      !decoded ||
      typeof decoded !== "object" ||
      typeof decoded.id !== "string" ||
      decoded.tokenType !== "extension"
    ) {
      return res.status(401).json({
        success: false,
        message: "A valid extension JWT is required.",
      });
    }

    const activeToken = await ExtensionToken.findOne({
      user: decoded.id,
      token,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!activeToken) {
      return res.status(401).json({
        success: false,
        message: "Extension token has been revoked or expired.",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists.",
      });
    }

    req.user = user;
    next();
  }
);