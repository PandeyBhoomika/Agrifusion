import mongoose from 'mongoose';

// One document per (user, crop, task) — tracks that specific user's progress
// through a specific crop's task chain. A user growing both Wheat and Rice
// gets two independent sets of these, one per crop, each unlocking in order.
const userCropTaskSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        crop: { type: String, required: true }, // e.g. "Wheat", "Rice", "Maize", "Cotton"
        taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
        stageOrder: { type: Number, required: true }, // copied from the Task template for fast sorting
        status: {
            type: String,
            enum: ['locked', 'active', 'approved'],
            default: 'locked',
        },
        proofId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proof', default: null },
        completedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// A user can only have one progress row per (crop, task) pair.
userCropTaskSchema.index({ userId: 1, crop: 1, taskId: 1 }, { unique: true });

const UserCropTask = mongoose.model('UserCropTask', userCropTaskSchema);
export default UserCropTask;