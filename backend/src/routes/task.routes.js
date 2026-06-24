import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
// Make sure completeTask is added to this import list:
import { getTasks, createTask, completeTask } from '../controllers/task.controller.js';

const router = express.Router();

// For development: use optionalAuth to allow testing without JWT
// For production: switch to 'auth' middleware
router.get('/', optionalAuth, getTasks);
router.post('/', optionalAuth, createTask);

// ✅ Mark a task as complete
router.post('/:id/complete', optionalAuth, completeTask);

export default router;