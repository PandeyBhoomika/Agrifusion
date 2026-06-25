import express from 'express';
import { auth } from '../middleware/auth.js';
import { submitProof, getPendingProofs, reviewProof } from '../controllers/proof.controller.js';

const router = express.Router();

router.route('/')
    .post(auth, submitProof)
    .get(auth, getPendingProofs);

router.route('/:id/review')
    .put(auth, reviewProof);

export default router;