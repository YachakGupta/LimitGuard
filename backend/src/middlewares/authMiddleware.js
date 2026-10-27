
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { asyncHandler } from "./asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token = req.cookies?.token ||
  (authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null);
  

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
    });
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session. Please log in again.",
    });
  }

  if (
    !decoded ||
    typeof decoded !== "object" ||
    typeof decoded.id !== "string"
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User account no longer exists",
    });
  }

  req.user = user;
  next();
});
