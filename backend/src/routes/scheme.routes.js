import express from 'express';
import { auth } from '../middleware/auth.js';
import { getSchemes } from '../controllers/scheme.controller.js';

const router = express.Router();

router.get('/', auth, getSchemes);

export default router;