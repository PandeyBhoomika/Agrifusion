import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        category: { type: String, required: true }, // e.g., 'Soil Health', 'Pest Control'
        videoUrl: { type: String, required: true }, // YouTube URL or AWS S3 link
        duration: { type: String }, // e.g., '5:30'
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export default mongoose.model('Video', videoSchema);