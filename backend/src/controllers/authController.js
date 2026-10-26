
import ErrorHandler from "../middlewares/error.js";
import User from "../models/userModel.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import { check, validationResult } from "express-validator";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = [
  check("name")
    .isString()
    .withMessage("Name must be text")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .bail()
    .isLength({ max: 80 })
    .withMessage("Name cannot exceed 80 characters"),

  check("email")
    .isString()
    .withMessage("Email must be text")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address")
    .bail()
    .normalizeEmail(),

  check("password")
    .isString()
    .withMessage("Password must be text")
    .bail()
    .isLength({ min: 8, max: 72 })
    .withMessage("Password must be between 8 and 72 characters")
    .bail()
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .bail()
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .bail()
    .matches(/[0-9]/)
    .withMessage("Password must contain a digit")
    .bail()
    .matches(/[!@#$%^&*(),.?":{}|<>/]/)
    .withMessage("Password must contain a special character"),

  asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((err) => err.msg),
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new ErrorHandler("User already exists", 409));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let user;

    try {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
      });
    } catch (error) {
      if (error.code === 11000) {
        return next(new ErrorHandler("User already exists", 409));
      }

      throw error;
    }

    return generateToken(
      user,
      201,
      "User registered successfully",
      res
    );
  }),
];

export const login = [
  check("email")
    .isString()
    .withMessage("Email must be text")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address")
    .bail()
    .normalizeEmail(),

  check("password")
    .isString()
    .withMessage("Password is required")
    .bail()
    .notEmpty()
    .withMessage("Password is required"),

  asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((err) => err.msg),
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new ErrorHandler("Invalid credentials", 401));
    }

    return generateToken(user, 200, "Login successful", res);
  }),
];

export const logout = asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  return res.status(200).json({
    success: true,
    message: "User found",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});
