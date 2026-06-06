// src/controllers/user.controller.js

const { users } = require("../data/store");

// Create or update profile
exports.updateProfile = (req, res) => {
  const userId = req.user.id;
  const {
    primaryCrop,
    farmSize,
    soilType,
    region,
    season,
  } = req.body;

  // find user in our in-memory array
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.profile = {
    primaryCrop,
    farmSize,
    soilType,
    region,
    season,
  };

  return res.json({
    message: "Profile updated",
    user,
  });
};

// Read profile
exports.getProfile = (req, res) => {
  const userId = req.user.id;

  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({
    profile: user.profile || {},
  });
};
