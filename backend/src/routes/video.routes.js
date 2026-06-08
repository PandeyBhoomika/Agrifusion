import express from 'express';
import { getVideos } from '../controllers/video.controller.js';

const router = express.Router();

router.get('/', getVideos);

export default router;