import User from "../models/User.js";

// POST /api/user/profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const {
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

    // Merge — only overwrite fields that were actually sent
    user.profile = {
      ...user.profile.toObject ? user.profile.toObject() : user.profile,
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
