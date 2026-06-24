import mongoose from 'mongoose'; // ✅ ADDED: Required to check ObjectId validity
import Task from '../models/Task.js';
import User from '../models/User.js';

// Get all active tasks
// Get all active tasks, with per-user status (locked / active / approved)
// based on stageOrder — only one task is unlocked at a time.
export const getTasks = async (req, res) => {
    try {
        const userId = req.user?.userId || req.query.userId;

        const tasks = await Task.find({ isActive: true }).sort({ stageOrder: 1, createdAt: 1 });

        let unlockedSoFar = true; // the first stage is always unlocked

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
                unlockedSoFar = false; // only the first non-approved task in order gets to be active
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
        const userId = req.user?.userId || req.body.userId;

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