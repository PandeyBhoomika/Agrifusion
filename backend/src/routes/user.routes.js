import express from "express";

// For development: use optionalAuth to allow testing without JWT
// For production: switch to 'auth' middleware
import { optionalAuth } from "../middleware/auth.js";

import { updateProfile, getProfile } from "../controllers/user.controller.js";

const router = express.Router();

// @route   POST /api/user/profile
// @desc    Create or update the farmer's profile
// @access  Private (Requires valid JWT token) — but optionalAuth allows dev testing without token
router.post("/profile", optionalAuth, updateProfile);

// @route   GET /api/user/profile
// @desc    Get the logged-in farmer's profile data
// @access  Private (Requires valid JWT token) — but optionalAuth allows dev testing without token
router.get("/profile", optionalAuth, getProfile);

export default router;