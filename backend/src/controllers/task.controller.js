import mongoose from 'mongoose'; // ✅ ADDED: Required to check ObjectId validity
import Task from '../models/Task.js';
import User from '../models/User.js';

// Get all active tasks
export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: tasks.length, data: tasks });
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

        // Grab userId from your auth middleware (req.user) OR from the request body
        const userId = req.user.userId;
        // ✅ THE FIX: Prevent Mongoose CastError by checking if the ID is valid first
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            console.log(`⚠️ Mock task "${taskId}" completed. Skipping DB update.`);
            return res.status(200).json({
                success: true,
                message: 'Mock task completed locally.',
                data: { _id: taskId, isCompleted: true }
            });
        }

        // 1. Find the real task in MongoDB
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // 2. Mark the task as completed
        task.isCompleted = true;
        await task.save();

        // 3. Award the user XP and greenCoins
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            // Assuming your Task model defines how much xp/coins it gives.
            // If it doesn't, this falls back to a default of 50 XP and 10 coins.
            const xpReward = task.xp || 50;
            const coinReward = task.greenCoins || 10;

            await User.findByIdAndUpdate(userId, {
                $inc: {
                    xp: xpReward,
                    greenCoins: coinReward
                }
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Task completed and rewards granted!',
            data: task
        });

    } catch (error) {
        console.error('Error completing task:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};