import express from 'express';
import { auth } from '../middleware/auth.js';
import { getSchemes, getSchemeCategories } from '../controllers/scheme.controller.js';
const router = express.Router();
router.get('/', auth, getSchemes);
router.get('/categories', auth, getSchemeCategories);
export default router;