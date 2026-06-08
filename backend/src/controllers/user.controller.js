// src/controllers/user.controller.js

// IMPORTANT: Use import and add .js
import User from "../models/User.js";

// Create or update profile
export const updateProfile = async (req, res) => {
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
      waterAvailability,
      farmingGoals,
      skillLevel
    } = req.body;

    // Find user in MongoDB
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the profile data - merging whatever exists with the new data
    user.profile = {
      ...user.profile,
      ...(primaryCrop && { primaryCrop }),
      ...(farmSize && { farmSize }),
      ...(soilType && { soilType }),
      ...(region && { region }),
      ...(season && { season }),
      ...(waterAvailability && { waterAvailability }),
      ...(farmingGoals && { farmingGoals }),
      ...(skillLevel && { skillLevel }),
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
export const getProfile = async (req, res) => {
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