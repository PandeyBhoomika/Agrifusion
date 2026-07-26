import Video from '../models/Video.js';
import VideoProgress from '../models/VideoProgress.js';
import User from '../models/User.js';
import { logActivity } from '../utils/logActivity.js';

// GET /api/videos
export const getVideos = async (req, res) => {
    try {
        const videos = await Video.find({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: videos.length, data: videos });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/videos/category/:category
export const getVideosByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const videos = await Video.find({ category, isActive: true }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: videos.length, data: videos });
    } catch (error) {
        console.error('Error fetching videos by category:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/videos/search?q=query
export const searchVideos = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ success: false, message: 'Query param q is required' });

        const videos = await Video.find({
            isActive: true,
            $or: [
                { title:       { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { category:    { $regex: q, $options: 'i' } },
                { instructor:  { $regex: q, $options: 'i' } },
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: videos.length, data: videos });
    } catch (error) {
        console.error('Error searching videos:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/videos/:id
export const getVideoById = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video || !video.isActive) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }
        res.status(200).json({ success: true, data: video });
    } catch (error) {
        console.error('Error fetching video by id:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// POST /api/videos/:id/complete
// Marks a video as watched for the logged-in user and grants XP once.
// Idempotent: replaying/re-completing an already-completed video grants no extra XP.
export const completeVideo = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });

        const videoId = req.params.id;
        const video = await Video.findById(videoId);
        if (!video || !video.isActive) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }

        const existing = await VideoProgress.findOne({ userId, videoId });
        if (existing?.completed) {
            return res.status(200).json({
                success: true,
                message: 'Video already completed — no additional XP awarded.',
                alreadyCompleted: true,
            });
        }

        await VideoProgress.findOneAndUpdate(
            { userId, videoId },
            { completed: true, completedAt: new Date() },
            { upsert: true, new: true }
        );

        const xpReward = video.points || 100;
        await User.findByIdAndUpdate(userId, { $inc: { xp: xpReward } });

        await logActivity({
            userId,
            type: 'video',
            description: `Watched "${video.title}"`,
            xpEarned: xpReward,
            coinsEarned: 0,
            sourceId: video._id,
        });

        return res.status(200).json({
            success: true,
            message: `Video completed! Earned ${xpReward} XP.`,
            xpEarned: xpReward,
            alreadyCompleted: false,
        });
    } catch (error) {
        console.error('Error completing video:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};