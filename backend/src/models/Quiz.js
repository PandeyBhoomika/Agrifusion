import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        category: { type: String, required: true },
        xpReward: { type: Number, default: 100 },
        coinReward: { type: Number, default: 20 },
        questions: [
            {
                questionText: { type: String, required: true },
                options: [{ type: String, required: true }],
                correctAnswerIndex: { type: Number, required: true },
                difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
            }
        ],
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);
