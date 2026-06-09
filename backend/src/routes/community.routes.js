import express from 'express';
import { getFeed, createPost, likePost, addComment } from '../controllers/community.controller.js';

const router = express.Router();

// Get feed and create post
router.route('/')
    .get(getFeed)
    .post(createPost); // Frontend hits this when user clicks "Post"

// Toggle Like on a post
router.post('/:id/like', likePost);

// Add a comment to a post
router.post('/:id/comment', addComment);

export default router;