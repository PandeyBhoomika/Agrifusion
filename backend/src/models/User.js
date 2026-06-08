const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    // --- Authentication & Basic Info (Your original fields) ---
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    fullName: { // Note: Your audit used 'name', I kept your 'fullName' to match your original code
      type: String,
      default: ""
    },
    state: {
      type: String,
      default: ""
    },
    passwordHash: {
      type: String,
      default: ""
    },
    emailVerified: {
      type: Boolean,
      default: false
    },

    // --- Farm Profile (Added for personalized dashboard) ---
    profile: {
      soilType: { type: String, default: 'Loamy' },
      waterAvailability: { type: String, default: 'Moderate' },
      farmingGoals: { type: [String], default: [] }, // e.g., ["Increase Yield", "Save Water"]
      skillLevel: { type: String, default: 'Beginner' }
    },

    // --- Gamification & Rewards (Added to persist progress) ---
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    greenCoins: {
      type: Number,
      default: 0,
    },
    streakDays: {
      type: Number,
      default: 0,
    },
    badges: {
      type: [String],
      default: [], // e.g., ["First Seed", "Water Saver"]
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt instead of manual Date.now
  }
);

// Helper to set password
UserSchema.methods.setPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
};

// Validate password
UserSchema.methods.validatePassword = async function (password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

// Method to safely return user data without the password hash
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

module.exports = mongoose.model("User", UserSchema);