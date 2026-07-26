import User from "../models/User.js";
import Task from "../models/Task.js";
import Mission from "../models/Mission.js";

/**
 * =====================================================
 * DASHBOARD SERVICE
 * =====================================================
 * Responsible for preparing dashboard data.
 * It DOES NOT modify user progress.
 * =====================================================
 */

export const getDashboardData = async (userId) => {

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  const completedTasks = await Task.countDocuments({
    "completedBy.userId": userId,
  });

  const activeMissions = await Mission.countDocuments({
    isActive: true,
  });

  return {
    success: true,

    dashboard: {

      xp: user.xp,

      greenCoins: user.greenCoins,

      completedTasks,

      activeMissions,

      level: user.level,

      streak: user.streak,

    },

  };

};