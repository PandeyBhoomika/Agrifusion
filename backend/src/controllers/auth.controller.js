import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import Otp from "../models/Otp.js";

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

    console.log(`✅ DEV OTP for ${email}: 123456`);

    return res.json({
      success: true,
      message: "OTP sent successfully",
      otp: "123456",
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
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required",
      });
    }

    if (otp !== "123456") {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const token = jwt.sign(
      {
        userId: "dev-user",
        email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      success: true,
      message: "OTP verified",
      token,
      isNewUser: true,
      user: {
        _id: "dev-user",
        email,
        emailVerified: true,
        profile: {
          profileCompleted: false,
        },
      },
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
    const { email } = req.body;

    const token = jwt.sign(
      {
        userId: "dev-user",
        email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      success: true,
      token,
      user: {
        _id: "dev-user",
        email,
        emailVerified: true,
        profile: {
          profileCompleted: false,
        },
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};