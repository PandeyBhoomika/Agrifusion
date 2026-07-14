import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import Otp from "../models/Otp.js";

const JWT_SECRET = process.env.JWT_SECRET;
const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 5);

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Refusing to start without it.");
}

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
    // NOTE: rejectUnauthorized is disabled here as a temporary workaround.
    // On some dev machines (this one included), local antivirus/network
    // software intercepts the TLS handshake to the SMTP server and presents
    // its own self-signed certificate ("self-signed certificate in
    // certificate chain" error), which Node correctly rejects by default.
    // Proper fix (not yet done): export the intercepting certificate and
    // pass it via `ca:` below instead of disabling verification entirely.
    // Tracked as a known tradeoff — revisit before production deployment.
    rejectUnauthorized: false,
  },
});

/* -------------------- HELPERS -------------------- */
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* -------------------- SEND OTP -------------------- */
// POST /api/auth/send-otp
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const otp = generateOtp();

    await Otp.findOneAndUpdate(
      { email },
      { email, code: otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your AgriFusion verification code",
      text: `Your AgriFusion OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    });

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("❌ Send OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

/* -------------------- VERIFY OTP -------------------- */
// POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, password, fullName, state, phone } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required",
      });
    }

    const record = await Otp.findOne({ email });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new one.",
      });
    }

    const age =
      (Date.now() - new Date(record.createdAt).getTime()) / 60000;

    if (age > OTP_EXPIRY_MINUTES) {
      await Otp.deleteOne({ email });
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    if (record.code !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      // Brand new user — create their account now with the details from signup
      user = await User.create({
        email,
        emailVerified: true,
        fullName: fullName || "",
        state: state || "",
        phone: phone || "",
      });
      if (password) {
        await user.setPassword(password);
        await user.save();
      }
      isNewUser = true;
    } else if (!user.profile || !user.profile.profileCompleted) {
      // Returning user who never finished farm-profile setup
      isNewUser = true;
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
      }
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
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.validatePassword(password))) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

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