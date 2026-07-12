import express from 'express';
import { auth } from '../middleware/auth.js';
import { getQuizzes, submitQuiz } from '../controllers/quiz.controller.js';

const router = express.Router();

router.get('/', auth, getQuizzes);
router.post('/:id/submit', auth, submitQuiz);

export default router;