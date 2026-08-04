import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    // ── Auth & Basic Info ─────────────────────────────────────
    email: {
      type: String, required: true, unique: true, lowercase: true, trim: true,
    },
    fullName: { type: String, default: "" },
    phone: { type: String, default: "" },
    state: { type: String, default: "" },
    passwordHash: { type: String, default: "" },
    emailVerified: { type: Boolean, default: false },

    // ── Farm Profile ──────────────────────────────────────────
    profile: {
      primaryCrops: { type: [String], default: [] },
      farmSize: { type: Number, default: 0 },
      soilType: { type: String, default: "" },
      waterAvailability: { type: String, default: "" },
      region: { type: String, default: "" },
      location: { type: String, default: "" },
      season: { type: String, default: "" },
      farmingGoals: { type: [String], default: [] },
      skillLevel: { type: String, default: "" },
      previousCrop: { type: String, default: "" },
      profileCompleted: { type: Boolean, default: false },
    },

    // ── Gamification ──────────────────────────────────────────
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    greenCoins: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    badges: { type: [String], default: [] },

    // ── Quiz History ✅ NEW ───────────────────────────────────
    quizHistory: [
      {
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
        category: { type: String },
        categoryName: { type: String },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
        score: { type: Number },
        totalPoints: { type: Number },
        percentage: { type: Number },
        passed: { type: Boolean },
        xpEarned: { type: Number, default: 0 },
        coinsEarned: { type: Number, default: 0 },
        completedAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

UserSchema.methods.setPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
};

UserSchema.methods.validatePassword = async function (password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

export default mongoose.model("User", UserSchema);
