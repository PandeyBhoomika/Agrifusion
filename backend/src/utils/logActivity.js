import Activity from '../models/Activity.js';

export async function logActivity({ userId, type, description, xpEarned = 0, coinsEarned = 0, sourceId = null }) {
  try {
    await Activity.create({ userId, type, description, xpEarned, coinsEarned, sourceId });
  } catch (err) {
    console.error('Failed to log activity (non-fatal):', err);
  }
}
