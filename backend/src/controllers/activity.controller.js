import Activity from '../models/Activity.js';

export const getMyActivity = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const before = req.query.before ? new Date(req.query.before) : null;

    const filter = { userId, ...(before && { createdAt: { $lt: before } }) };

    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.json({ success: true, data: activities });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};