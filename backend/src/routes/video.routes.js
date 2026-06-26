import express from 'express';
import { auth } from '../middleware/auth.js';
import { getVideos } from '../controllers/video.controller.js';

const router = express.Router();

router.get('/', getVideos);

export default router;