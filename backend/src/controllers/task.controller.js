import mongoose from 'mongoose';
import Task from '../models/Task.js';
import UserCropTask from '../models/UserCropTask.js';
import { generateCropTaskChain } from '../utils/generateCropTasks.js';
import User from '../models/User.js';
import { logActivity } from '../utils/logActivity.js';

// Get all active tasks, with per-user status (locked / active / approved)
// based on stageOrder — only one task is unlocked at a time.
export const getTasks = async (req, res) => {
    try {
        const userId = req.user?.userId || req.query.userId;
        const tasks = await Task.find({ isActive: true }).sort({ stageOrder: 1, createdAt: 1 });

        let unlockedSoFar = true;

        const tasksWithUserStatus = tasks.map((task) => {
            const taskObj = task.toObject();
            const isApproved = userId
                ? task.completedBy.some((entry) => entry.userId.toString() === userId.toString())
                : false;

            let status;
            if (isApproved) {
                status = 'approved';
            } else if (unlockedSoFar) {
                status = 'active';
                unlockedSoFar = false;
            } else {
                status = 'locked';
            }

            return {
                ...taskObj,
                isCompleted: isApproved,
                status,
                completedBy: undefined,
            };
        });

        res.status(200).json({ success: true, count: tasksWithUserStatus.length, data: tasksWithUserStatus });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Create a new task (Admin only - keeping it simple for now)
export const createTask = async (req, res) => {
    try {
        const task = await Task.create(req.body);
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/* -------------------- COMPLETE TASK -------------------- */
// PATCH /api/tasks/:id/complete
export const completeTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.userId; // from the verified token, not the client

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ success: false, message: 'Invalid task id.' });
        }
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ success: false, message: 'A valid logged-in user is required to complete a task.' });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const alreadyCompleted = task.completedBy.some((entry) => entry.userId.toString() === userId.toString());
        if (alreadyCompleted) {
            return res.status(200).json({
                success: true,
                message: 'Task was already completed by this user.',
                data: { ...task.toObject(), isCompleted: true },
            });
        }

        task.completedBy.push({ userId, completedAt: new Date() });
        await task.save();

        const xpReward = task.xpReward || 50;
        const coinReward = task.coinReward || 10;

        await User.findByIdAndUpdate(userId, { $inc: { xp: xpReward, greenCoins: coinReward } });

        // ✅ NEW — record this in the Activity ledger
        await logActivity({
            userId,
            type: 'task',
            description: `Completed "${task.title}"`,
            xpEarned: xpReward,
            coinsEarned: coinReward,
            sourceId: task._id,
        });

        return res.status(200).json({
            success: true,
            message: 'Task completed and rewards granted!',
            data: { ...task.toObject(), isCompleted: true },
        });
    } catch (error) {
        console.error('Error completing task:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/tasks/crop-chain?crop=Wheat
// Returns the logged-in user's full task chain for one crop, with computed
// status (locked/active/approved) based on sequential progress.
export const getCropTaskChain = async (req, res) => {
    try {
        const userId = req.user?.userId || req.query.userId;
        const { crop } = req.query;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'A valid logged-in user is required.' });
        }
        if (!crop) {
            return res.status(400).json({ success: false, message: 'crop is required, e.g. ?crop=Wheat' });
        }

        await generateCropTaskChain(userId, crop);

        const rows = await UserCropTask.find({ userId, crop })
            .sort({ stageOrder: 1 })
            .populate('taskId');

        let unlockedSoFar = true;
        const chain = rows.map((row) => {
            const task = row.taskId;
            let status;
            if (row.status === 'approved') {
                status = 'approved';
            } else if (unlockedSoFar) {
                status = 'active';
                unlockedSoFar = false;
            } else {
                status = 'locked';
            }

            return {
                id: row._id,
                taskId: task?._id,
                title: task?.title,
                description: task?.description,
                category: task?.category,
                difficulty: task?.difficulty,
                stage: task?.stage,
                stageOrder: row.stageOrder,
                xpReward: task?.xpReward,
                coinReward: task?.coinReward,
                requiresProof: task?.requiresProof,
                estimatedTime: task?.estimatedTime,
                skillLevel: task?.skillLevel,
                crop,
                status,
                isCompleted: status === 'approved',
            };
        });

        res.status(200).json({ success: true, crop, count: chain.length, data: chain });
    } catch (error) {
        console.error('Error fetching crop task chain:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/tasks/my-crops
// Returns the list of crops the logged-in user has chains for (from their
// profile), so the frontend can render crop tabs without guessing.
export const getMyCrops = async (req, res) => {
    try {
        const userId = req.user?.userId || req.query.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'A valid logged-in user is required.' });
        }

        const User = (await import('../models/User.js')).default;
        const user = await User.findById(userId);
        const crops = user?.profile?.primaryCrops || [];

        res.status(200).json({ success: true, crops });
    } catch (error) {
        console.error('Error fetching user crops:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// POST /api/tasks/crop-chain/:userCropTaskId/complete
// Marks one step of a crop chain as approved (used for tasks that DON'T
// require proof — proof-required tasks get approved via submitProof instead).
export const completeCropTask = async (req, res) => {
    try {
        const userId = req.user?.userId || req.body.userId;
        const { userCropTaskId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'A valid logged-in user is required.' });
        }

        const row = await UserCropTask.findById(userCropTaskId).populate('taskId');
        if (!row) {
            return res.status(404).json({ success: false, message: 'Task step not found.' });
        }
        if (row.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'This task step belongs to a different user.' });
        }
        if (row.status === 'approved') {
            return res.status(200).json({ success: true, message: 'Already approved.', data: row });
        }

        row.status = 'approved';
        row.completedAt = new Date();
        await row.save();

        const User = (await import('../models/User.js')).default;
        const xpReward = row.taskId?.xpReward || 0;
        const coinReward = row.taskId?.coinReward || 0;

        await User.findByIdAndUpdate(userId, {
            $inc: { xp: xpReward, greenCoins: coinReward },
        });

        // ✅ NEW — record this in the Activity ledger
        await logActivity({
            userId,
            type: 'task',
            description: `Completed "${row.taskId?.title || 'crop task step'}" (${row.crop})`,
            xpEarned: xpReward,
            coinsEarned: coinReward,
            sourceId: row.taskId?._id,
        });

        res.status(200).json({ success: true, message: 'Step approved!', data: row });
    } catch (error) {
        console.error('Error completing crop task step:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};