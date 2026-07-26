import User from "../models/User.js";
import Task from "../models/Task.js";
import Proof from "../models/Proof.js";

/**
 * Reward Engine
 * Responsible for updating user progress
 * after a task is officially approved.
 */

export const completeTask = async (userId, taskId) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  const proof = await Proof.findOne({
    userId,
    taskId,
    status: "Approved",
  });

  if (!proof) {
    throw new Error("Proof not approved.");
  }

  // Prevent double rewards
  if (proof.isRewardClaimed) {
    return {
      success: false,
      message: "Reward already claimed.",
    };
  }

  // Award XP & Coins
  await User.findByIdAndUpdate(userId, {
    $inc: {
      xp: task.xpReward,
      greenCoins: task.coinReward,
    },
  });

  // Mark task completed
  const alreadyCompleted = task.completedBy.some(
    (entry) => entry.userId.toString() === userId.toString()
  );

  if (!alreadyCompleted) {
    task.completedBy.push({
      userId,
      completedAt: new Date(),
    });

    await task.save();
  }

  proof.xpAwarded = task.xpReward;
  proof.coinsAwarded = task.coinReward;
  proof.isRewardClaimed = true;

  await proof.save();

  return {
    success: true,
    xp: task.xpReward,
    coins: task.coinReward,
  };
};