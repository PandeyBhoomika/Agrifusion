import express from 'express';
import { auth } from '../middleware/auth.js';
import { getVideos, getVideosByCategory, getVideoById, searchVideos } from '../controllers/video.controller.js';
const router = express.Router();

// IMPORTANT: specific routes BEFORE :id param route
router.get('/search',           searchVideos);
router.get('/category/:category', getVideosByCategory);
router.get('/:id',              getVideoById);
router.get('/',                 getVideos);

export default router;
