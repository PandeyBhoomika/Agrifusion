import express from 'express';
import { getFeed, createPost } from '../controllers/community.controller.js';

const router = express.Router();

router.route('/')
    .get(getFeed)
    .post(createPost); // Frontend hits this when user clicks "Post"

export default router;