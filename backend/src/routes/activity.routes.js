import express from 'express';
import { auth } from '../middleware/auth.js';
import { getMyActivity } from '../controllers/activity.controller.js';

const router = express.Router();

router.get('/', auth, getMyActivity);

export default router;