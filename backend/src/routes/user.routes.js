import express from "express";
import { auth } from "../middleware/auth.js";
import {
  updateProfile,
  getProfile,
  getMe,
  setPassword,
} from "../controllers/user.controller.js";

const router = express.Router();

// @route   POST /api/user/profile
// @desc    Create or update the farmer's profile
// @access  Private (requires valid JWT)
router.post("/profile", auth, updateProfile);

// @route   GET /api/user/profile
// @desc    Get the logged-in farmer's profile data
// @access  Private (requires valid JWT)
router.get("/profile", auth, getProfile);

// @route   GET /api/user/me
// @desc    Get the logged-in user's live stats (xp, level, coins, badges, profile)
// @access  Private (requires valid JWT)
router.get("/me", auth, getMe);

// @route   POST /api/user/set-password
// @desc    Let an OTP-created account set a password for regular login
// @access  Private (requires valid JWT)
router.post("/set-password", auth, setPassword);

export default router;