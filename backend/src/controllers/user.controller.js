// src/controllers/user.controller.js

// Import your real Mongoose model instead of the fake store
const User = require("../models/User");

// Create or update profile
exports.updateProfile = async (req, res) => {
  try {
    // Note: Depending on how your JWT middleware is written, 
    // the ID might be under req.user.userId instead of req.user.id.
    // This checks for both just in case!
    const userId = req.user.id || req.user.userId;

    const {
      primaryCrop,
      farmSize,
      soilType,
      region,
      season,
    } = req.body;

    // Find user in MongoDB
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the profile data
    user.profile = {
      primaryCrop,
      farmSize,
      soilType,
      region,
      season,
    };

    // Save the changes to the database
    await user.save();

    return res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ message: "Server error while updating profile" });
  }
};

// Read profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    // Find user in MongoDB
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      profile: user.profile || {},
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({ message: "Server error while fetching profile" });
  }
};