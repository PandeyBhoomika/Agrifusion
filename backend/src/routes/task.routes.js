import express from 'express';
import { getTasks, createTask, completeTask } from '../controllers/task.controller.js';
import { auth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getTasks);
router.post('/', createTask);
router.post('/:id/complete', auth, completeTask);

export default router;