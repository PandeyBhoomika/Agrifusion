import express from 'express';
import { getQuizzes, submitQuiz } from '../controllers/quiz.controller.js';

const router = express.Router();

router.get('/', getQuizzes);
router.post('/:id/submit', submitQuiz); // Frontend hits this when a quiz is finished

export default router;