import Mission from "../models/Mission.js";
import Task from "../models/Task.js";

/**
 * Mission Service
 * Handles mission progress and completion.
 */

export const updateMissionProgress = async (userId, taskId) => {
  // Find the completed task
  const task = await Task.findById(taskId);

  if (!task || !task.missionId) {
    return {
      success: false,
      message: "Task is not part of any mission.",
    };
  }

  // Get the mission
  const mission = await Mission.findById(task.missionId);

  if (!mission) {
    throw new Error("Mission not found.");
  }

  // Fetch every task in this mission
  const missionTasks = await Task.find({
    missionId: mission._id,
  });

  const totalTasks = missionTasks.length;

  // Count completed tasks
  let completedTasks = 0;

  missionTasks.forEach((t) => {
    const completed = t.completedBy.some(
      (entry) => entry.userId.toString() === userId.toString()
    );

    if (completed) completedTasks++;
  });

  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  const missionCompleted =
    completedTasks === totalTasks && totalTasks > 0;

  return {
    success: true,

    missionId: mission._id,

    missionTitle: mission.title,

    progress,

    completedTasks,

    totalTasks,

    missionCompleted,

    rewards: {
      xp: mission.xpReward,
      coins: mission.coinReward,
      badge: mission.badgeReward,
    },
  };
};