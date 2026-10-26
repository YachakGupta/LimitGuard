
import { Router } from "express";
import {registerUser,login,logout,getMe } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login",login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;
