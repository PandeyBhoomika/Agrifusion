const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// We'll check expiry manually using createdAt + OTP_EXPIRY_MINUTES
module.exports = mongoose.model("Otp", OtpSchema);
