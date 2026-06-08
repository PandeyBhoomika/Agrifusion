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
            type: String, // In a real app, this would be an S3 or Cloudinary URL
            required: true,
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