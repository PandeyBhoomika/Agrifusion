import express from 'express';
// Make sure completeTask is added to this import list:
import { getTasks, createTask, completeTask } from '../controllers/task.controller.js';

const router = express.Router();

router.get('/', getTasks);
router.post('/', createTask);

// ✅ Add this line right here to fix Bug 1:
router.post('/:id/complete', completeTask);

export default router;