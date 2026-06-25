import express from 'express';
import { auth } from '../middleware/auth.js';
import { getTasks, createTask, completeTask } from '../controllers/task.controller.js';

const router = express.Router();

router.get('/', auth, getTasks);
router.post('/', auth, createTask);
router.post('/:id/complete', auth, completeTask);

export default router;