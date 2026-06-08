import express from "express";
// IMPORTANT: Notice the .js extension at the end of the file path!
import { sendOtp, verifyOtp, login } from "../controllers/auth.controller.js";

const router = express.Router();

// SEND OTP
router.post("/send-otp", sendOtp);

// VERIFY OTP
router.post("/verify-otp", verifyOtp);

// LOGIN
router.post("/login", login);

// Changed from module.exports to export default
export default router;