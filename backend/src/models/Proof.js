import mongoose from "mongoose";

const proofSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: false,
    },
    userCropTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserCropTask",
      required: false,
    },
    proofUrl: {
      type: String,
      required: true,
    },
    audioUrl: {
      type: String,
      default: "",
    },
    location: {
      lat: { type: String, default: "" },
      lon: { type: String, default: "" },
      capturedAt: { type: Date, default: null },
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    feedback: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    xpAwarded: {
      type: Number,
      default: 0,
    },
    coinsAwarded: {
      type: Number,
      default: 0,
    },
    isRewardClaimed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Proof", proofSchema);