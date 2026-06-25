import mongoose from 'mongoose';

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
            enum: ['Soil Health', 'Water Conservation', 'Pest Control', 'Crop Management', 'General'],
            default: 'General',
        },
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            default: 'Easy',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // Used to sequence tasks: 1 = first stage, 2 = next, etc.
        stageOrder: {
            type: Number,
            default: 1,
        },
        // Whether completing this task requires photo/audio/GPS proof
        // (routes through proof-submission) vs a plain one-tap completion.
        requiresProof: {
            type: Boolean,
            default: false,
        },
        completedBy: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
                completedAt: { type: Date, default: Date.now },
            },
        ],
        
    },
    { timestamps: true }
);

// Use ONLY export default (ES Modules)
export default mongoose.model('Task', taskSchema);