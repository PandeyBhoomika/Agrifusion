import mongoose from "mongoose";

const missionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "General",
    },

    image: {
      type: String,
      default: "",
    },

    xpReward: {
      type: Number,
      default: 300,
    },

    coinReward: {
      type: Number,
      default: 100,
    },

    badgeReward: {
      type: String,
      default: "",
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },

    estimatedTasks: {
      type: Number,
      default: 5,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 1,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Mission", missionSchema);