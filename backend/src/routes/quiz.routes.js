// routes/quiz.routes.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import { getQuizzes, getQuizByCategory, submitQuiz, getQuizHistory } from '../controllers/quiz.controller.js';

const router = express.Router();

router.get('/history', auth, getQuizHistory);        // GET  /api/quiz/history
router.get('/all', auth, getQuizzes);                // GET  /api/quiz/all
router.get('/:categoryId', auth, getQuizByCategory); // GET  /api/quiz/soil-health
router.post('/:id/submit', auth, submitQuiz);        // POST /api/quiz/:id/submit

export default router;
