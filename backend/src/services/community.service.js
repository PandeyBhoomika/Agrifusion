/**
 * =====================================================
 * COMMUNITY SERVICE
 * =====================================================
 */

export const createTaskActivity = async (
  userId,
  task
) => {

  console.log("Community Activity");

  console.log(userId);

  console.log(task.title);

  return {
    success: true,
  };

};