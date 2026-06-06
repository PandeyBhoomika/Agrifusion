const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

// SEND OTP
router.post("/send-otp", authController.sendOtp);

// VERIFY OTP
router.post("/verify-otp", authController.verifyOtp);

// LOGIN
router.post("/login", authController.login);

module.exports = router;
