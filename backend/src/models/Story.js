// models/Story.js
import mongoose from 'mongoose';

const storySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 150,
      default: '',
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // MongoDB TTL index — document auto-deletes 24h after createdAt
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // now + 24h
      index: { expires: 0 }, // TTL index: delete when expiresAt is reached
    },
  },
  { timestamps: true }
);

export default mongoose.model('Story', storySchema);
