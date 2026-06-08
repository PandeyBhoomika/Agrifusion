import express from "express";
// IMPORTANT: Add the .js extension for local files!
import { auth } from "../middleware/auth.js"; // Note: Adjust this import based on how your auth middleware exports
import { updateProfile, getProfile } from "../controllers/user.controller.js";

const router = express.Router();

// Save/update profile
router.post("/profile", auth, updateProfile);

// Get profile
router.get("/profile", auth, getProfile);

// Changed from module.exports to export default
export default router;