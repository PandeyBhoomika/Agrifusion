import User from "../models/User.js";

// POST /api/user/profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const {
      fullName,
      primaryCrops,
      farmSize,
      soilType,
      region,
      location,
      season,
      waterAvailability,
      farmingGoals,
      skillLevel,
      previousCrop,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update user info
    if (fullName) user.fullName = fullName;

    // Merge — only overwrite fields that were actually sent
    user.profile = {
      ...(user.profile.toObject ? user.profile.toObject() : user.profile),
      ...(primaryCrops !== undefined && {
        primaryCrops: Array.isArray(primaryCrops) ? primaryCrops : [primaryCrops],
      }),
      ...(farmSize !== undefined && { farmSize }),
      ...(soilType !== undefined && { soilType }),
      ...(region !== undefined && { region }),
      ...(location !== undefined && { location }),
      ...(season !== undefined && { season }),
      ...(waterAvailability !== undefined && { waterAvailability }),
      ...(farmingGoals !== undefined && { farmingGoals }),
      ...(skillLevel !== undefined && { skillLevel }),
      ...(previousCrop !== undefined && { previousCrop }),
      profileCompleted: true,
    };

    await user.save();

    return res.json({
      success: true,
      message: "Farm profile saved successfully",
      user,
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: "Server error while saving profile" });
  }
};

// GET /api/user/profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      success: true,
      profile: user.profile,
      user,
    });
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({ message: "Server error while fetching profile" });
  }
};

// GET /api/user/me
// Single source of truth for dashboard/progress screens.
// Always live data from the authenticated user's own document.
export const getMe = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        state: user.state,
        level: user.level,
        xp: user.xp,
        greenCoins: user.greenCoins,
        streakDays: user.streakDays,
        badges: user.badges,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({ message: "Server error while fetching user data" });
  }
};

// POST /api/user/set-password
// Lets an OTP-created account set a password so it can also use POST /api/auth/login
export const setPassword = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.setPassword(password);
    await user.save();

    return res.json({ success: true, message: "Password set successfully" });
  } catch (error) {
    console.error("setPassword error:", error);
    return res.status(500).json({ message: "Server error while setting password" });
  }
};