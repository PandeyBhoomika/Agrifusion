const mongoose = require('mongoose');

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
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);