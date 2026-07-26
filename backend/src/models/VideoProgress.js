// backend/src/models/VideoProgress.js
import mongoose from 'mongoose';

const videoProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

videoProgressSchema.index({ userId: 1, videoId: 1 }, { unique: true });

export default mongoose.model('VideoProgress', videoProgressSchema);