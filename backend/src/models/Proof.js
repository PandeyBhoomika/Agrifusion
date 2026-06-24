import mongoose from 'mongoose';

const proofSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            required: true,
        },
        proofUrl: {
            type: String,
            required: true,
        },
        audioUrl: {
            type: String,
            default: '',
        },
        location: {
            lat: { type: String, default: '' },
            lon: { type: String, default: '' },
            capturedAt: { type: Date, default: null },
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
        feedback: {
            type: String, // Admin can leave feedback if rejected
            default: '',
        },
        xpAwarded: {
            type: Number,
            default: 0, // Gets updated when approved
        },
        coinsAwarded: {
            type: Number,
            default: 0, // Gets updated when approved
        }
    },
    { timestamps: true }
);

const Proof = mongoose.model('Proof', proofSchema);
export default Proof;