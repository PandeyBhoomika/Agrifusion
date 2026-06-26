import express from 'express';
import { getTasks, createTask, completeTask } from '../controllers/task.controller.js';
import { auth, optionalAuth } from '../middleware/auth.js';
const router = express.Router();
router.get('/', auth, getTasks);
router.post('/', auth, createTask);
router.post('/:id/complete', auth, completeTask);
export default router;