import Video from '../models/Video.js';

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
