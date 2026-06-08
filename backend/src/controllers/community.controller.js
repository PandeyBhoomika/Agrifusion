import Post from '../models/Post.js';

// Get all posts for the feed
export const getFeed = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('userId', 'fullName state level') // Get author details
            .populate('comments.userId', 'fullName') // Get commenter details
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json({ success: true, count: posts.length, data: posts });
    } catch (error) {
        console.error('Error fetching feed:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Create a new post
export const createPost = async (req, res) => {
    try {
        const { userId, content, imageUrl } = req.body;

        const newPost = await Post.create({
            userId,
            content,
            imageUrl
        });

        // Populate the newly created post so the frontend can display it immediately
        const populatedPost = await Post.findById(newPost._id).populate('userId', 'fullName state level');

        res.status(201).json({ success: true, data: populatedPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};