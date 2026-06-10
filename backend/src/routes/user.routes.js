import express from "express";

// IMPORTANT: Make sure this path and imported function name exactly match your actual auth middleware file!
// Common names are 'auth', 'protect', or 'verifyToken'. 
import { auth } from "../middleware/auth.js";

import { updateProfile, getProfile } from "../controllers/user.controller.js";

const router = express.Router();

// @route   POST /api/user/profile
// @desc    Create or update the farmer's profile
// @access  Private (Requires valid JWT token)
router.post("/profile", auth, updateProfile);

// @route   GET /api/user/profile
// @desc    Get the logged-in farmer's profile data
// @access  Private (Requires valid JWT token)
router.get("/profile", auth, getProfile);

export default router;