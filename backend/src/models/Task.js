import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    xpReward: {
      type: Number,
      required: true,
      default: 50,
    },
    coinReward: {
      type: Number,
      required: true,
      default: 10,
    },
    category: {
      type: String,
      enum: ["Soil Health", "Water Conservation", "Pest Control", "Crop Management", "General"],
      default: "General",
    },
    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mission",
      default: null,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stageOrder: {
      type: Number,
      default: 1,
    },
    stage: {
      type: String,
      default: "",
    },
    requiresProof: {
      type: Boolean,
      default: false,
    },
    estimatedTime: {
      type: Number,
      default: 10,
    },
    season: [{ type: String }],
    cropTypes: [{ type: String }],
    states: [{ type: String }],
    skillLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    repeatType: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly", "Seasonal", "One-Time"],
      default: "Daily",
    },
    image: {
      type: String,
      default: "",
    },
    completedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);