// routes/story.routes.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getStories,
  getMyStories,
  createStory,
  viewStory,
  deleteStory,
  upload,
} from '../controllers/story.controller.js';

const router = express.Router();

router.use(auth);

router.get('/', getStories);                          // GET  /api/stories        — all active stories grouped by user
router.get('/mine', getMyStories);                    // GET  /api/stories/mine   — your own stories
router.post('/', upload.single('image'), createStory);// POST /api/stories        — upload a new story image
router.post('/:storyId/view', viewStory);             // POST /api/stories/:id/view — mark as viewed
router.delete('/:storyId', deleteStory);              // DELETE /api/stories/:id  — delete your story

export default router;
