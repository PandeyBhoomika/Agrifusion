import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['task', 'quiz', 'proof', 'video', 'streak', 'other'],
      required: true,
    },
    description: { type: String, required: true },
    xpEarned: { type: Number, default: 0 },
    coinsEarned: { type: Number, default: 0 },
    sourceId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

activitySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Activity', activitySchema);