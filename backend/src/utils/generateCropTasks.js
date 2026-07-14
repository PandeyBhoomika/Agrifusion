import Task from '../models/Task.js';
import UserCropTask from '../models/UserCropTask.js';

// Generates (or extends) a sequential task chain for one user + one crop.
// Chain = all "universal" tasks + all tasks where appliesTo === crop,
// sorted by stageOrder. Safe to call multiple times for the same
// user/crop — it only inserts rows that don't already exist, so calling
// it again after a new Task template is added will pick up the new step
// without disturbing already-approved progress.
export const generateCropTaskChain = async (userId, crop) => {
    const templates = await Task.find({
        isActive: true,
        $or: [
            { cropTypes: { $size: 0 } },  // empty array = universal (applies to all crops)
            { cropTypes: crop },            // contains this specific crop name
        ],
    }).sort({ stageOrder: 1 });

    if (templates.length === 0) return [];

    const existing = await UserCropTask.find({ userId, crop });
    const existingTaskIds = new Set(existing.map((e) => e.taskId.toString()));

    const newRows = templates
        .filter((task) => !existingTaskIds.has(task._id.toString()))
        .map((task) => ({
            userId,
            crop,
            taskId: task._id,
            stageOrder: task.stageOrder,
            status: 'locked', // unlocking is computed when read, not stored as "active" here
        }));

    if (newRows.length > 0) {
        await UserCropTask.insertMany(newRows);
    }

    return UserCropTask.find({ userId, crop }).sort({ stageOrder: 1 });
};

// Ensures a chain exists for every crop in the user's primaryCrops list.
// Call this whenever a user's profile is saved/updated.
export const generateChainsForUser = async (userId, primaryCrops) => {
    if (!Array.isArray(primaryCrops)) return;
    for (const crop of primaryCrops) {
        await generateCropTaskChain(userId, crop);
    }
};