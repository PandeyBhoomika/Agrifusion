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
        const userId = req.user.userId; // from the verified token, not the client
        const { content, imageUrl } = req.body;

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

// Toggle Like on a post (Like / Unlike)
export const likePost = async (req, res) => {
    try {
        const { id } = req.params; // Post ID from the URL
        const userId = req.user.userId; // from the verified token, not the client

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Check if the user has already liked the post
        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            // Remove like (Unlike)
            post.likes = post.likes.filter((like) => like.toString() !== userId.toString());
        } else {
            // Add like
            post.likes.push(userId);
        }

        await post.save();

        res.status(200).json({
            success: true,
            message: isLiked ? 'Post unliked' : 'Post liked',
            likesCount: post.likes.length,
            data: post.likes
        });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Add a comment to a post
export const addComment = async (req, res) => {
    try {
        const { id } = req.params; // Post ID from the URL
        const userId = req.user.userId; // from the verified token, not the client
        const { text } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({ success: false, message: 'Comment text is required' });
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Create the new comment object
        const newComment = {
            userId,
            text,
            createdAt: new Date()
        };

        // Add to the beginning or end of the array based on your schema preference
        post.comments.push(newComment);
        await post.save();

        // Populate the user details of the new comment before sending it back
        const populatedPost = await Post.findById(id).populate('comments.userId', 'fullName');

        res.status(201).json({
            success: true,
            message: 'Comment added',
            data: populatedPost.comments
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};