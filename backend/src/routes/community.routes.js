import express from 'express';
import { auth } from '../middleware/auth.js';
import { getFeed, createPost, likePost, addComment } from '../controllers/community.controller.js';

const router = express.Router();

router.route('/')
    .get(auth, getFeed)
    .post(auth, createPost);

router.post('/:id/like', auth, likePost);
router.post('/:id/comment', auth, addComment);

export default router;