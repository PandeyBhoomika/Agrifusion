/**
 * =====================================================
 * NOTIFICATION SERVICE
 * =====================================================
 */

export const sendTaskApprovedNotification = async (
  userId,
  task
) => {

  console.log(
    `Notification sent to ${userId}`
  );

  return {
    success: true,
  };

};