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

        if (!content || content.trim().length === 0 || content.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Content must be between 1 and 500 characters'
            });
        }

        const newPost = await Post.create({
            userId,
            content: content.trim(),
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

        if (!text || text.trim().length === 0 || text.length > 300) {
            return res.status(400).json({
                success: false,
                message: 'Comment must be between 1 and 300 characters'
            });
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Create the new comment object
        const newComment = {
            userId,
            text: text.trim(),
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

// Delete a comment from a post (only the comment's own author can delete it)
export const deleteComment = async (req, res) => {
    try {
        const { id, commentId } = req.params; // Post ID and Comment ID from the URL
        const userId = req.user.userId; // from the verified token, not the client

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const comment = post.comments.find((c) => c._id.toString() === commentId);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Only the comment author can delete their own comment
        if (comment.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'You can only delete your own comments' });
        }

        post.comments = post.comments.filter((c) => c._id.toString() !== commentId);
        await post.save();

        const populatedPost = await Post.findById(id).populate('comments.userId', 'fullName');

        res.status(200).json({
            success: true,
            message: 'Comment deleted',
            data: populatedPost.comments
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
