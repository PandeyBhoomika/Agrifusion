import Video from '../models/Video.js';

// Get all active videos
export const getVideos = async (req, res) => {
    try {
        const videos = await Video.find({ isActive: true });
        res.status(200).json({ success: true, count: videos.length, data: videos });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
