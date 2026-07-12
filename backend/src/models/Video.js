import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
    {
        title:       { type: String, required: true },
        description: { type: String, default: '' },
        category:    { type: String, required: true }, // 'crop-rotation', 'irrigation', 'pest-control', etc.
        videoUrl:    { type: String, required: true }, // Full YouTube URL e.g. https://www.youtube.com/watch?v=XzSchrmBt8g
        youtubeId:   { type: String, required: true }, // Just the ID e.g. XzSchrmBt8g — extracted from videoUrl
        thumbnail:   { type: String, default: '' },    // Auto-built from youtubeId if empty
        duration:    { type: String, default: '' },    // e.g. '8 min'
        difficulty:  { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
        instructor:  { type: String, default: '' },
        points:      { type: Number, default: 100 },
        isActive:    { type: Boolean, default: true }
    },
    { timestamps: true }
);

// Virtual: if thumbnail not stored, build it from youtubeId
videoSchema.virtual('thumbnailUrl').get(function () {
    return this.thumbnail || `https://img.youtube.com/vi/${this.youtubeId}/hqdefault.jpg`;
});

videoSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Video', videoSchema);
