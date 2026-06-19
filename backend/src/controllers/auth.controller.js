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

    const otp = generateOtp();

    // Upsert the OTP for this email (replaces any existing one)
    await Otp.findOneAndUpdate(
      { email },
      { email, code: otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Dev convenience: print the code to the server console
    console.log(`\n========================================`);
    console.log(`🔑 OTP for ${email}: ${otp}`);
    console.log(`========================================\n`);

    // Send the OTP by email
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
    const { email, otp, password } = req.body;

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

    // Check expiry
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

    // Find or create the user
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      // Brand new user — create their account now
      user = await User.create({
        email,
        emailVerified: true,
      });
      // Save the password chosen at signup so they can log in later
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