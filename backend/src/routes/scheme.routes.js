import express from 'express';
import { getSchemes, getSchemeCategories } from '../controllers/scheme.controller.js';

const router = express.Router();

router.get('/',           getSchemes);
router.get('/categories', getSchemeCategories);

export default router;
