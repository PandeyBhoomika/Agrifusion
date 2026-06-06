const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Otp = require("../models/Otp");

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 5);

/* -------------------- EMAIL CONFIG -------------------- */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false   // ✅ THIS FIXES YOUR ERROR
  }
});


/* -------------------- HELPERS -------------------- */
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* -------------------- SEND OTP -------------------- */
// POST /api/auth/send-otp
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });

    const otp = generateOtp();

    // Save / Update OTP
    await Otp.findOneAndUpdate(
      { email },
      { code: otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send email
    await transporter.sendMail({
      from: `"AgriFusion 🌱" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for AgriFusion",
      html: `
        <div style="font-family: Arial;">
          <h2>AgriFusion OTP Verification</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This OTP is valid for <b>${OTP_EXPIRY_MINUTES} minutes</b>.</p>
          <p>If you did not request this, ignore this email.</p>
        </div>
      `,
    });

    console.log(`✅ OTP sent to ${email}: ${otp}`);

    return res.json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (error) {
    console.error("❌ Send OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP email",
    });
  }
};

/* -------------------- VERIFY OTP -------------------- */
// POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({
        success: false,
        message: "Email and OTP required",
      });

    const record = await Otp.findOne({ email });

    if (!record)
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });

    // Check expiry
    const age =
      (Date.now() - new Date(record.createdAt).getTime()) / 60000;

    if (age > OTP_EXPIRY_MINUTES) {
      await Otp.deleteOne({ email });
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (record.code !== otp)
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });

    // Create or fetch user
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        email,
        emailVerified: true,
      });
      isNewUser = true;
    }

    const token = jwt.sign(
      { userId: user._id, email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    await Otp.deleteOne({ email });

    return res.json({
      success: true,
      message: "OTP verified",
      token,
      isNewUser,
      user,
    });
  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* -------------------- LOGIN -------------------- */
// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.validatePassword(password)))
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });

    const token = jwt.sign(
      { userId: user._id, email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
