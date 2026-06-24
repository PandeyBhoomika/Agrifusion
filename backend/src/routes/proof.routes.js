import express from 'express';
import { submitProof, getPendingProofs, reviewProof } from '../controllers/proof.controller.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { uploadProofFiles } from '../middleware/upload.js';

const router = express.Router();

router.post('/submit', optionalAuth, uploadProofFiles, submitProof);

router.route('/')
    .post(optionalAuth, uploadProofFiles, submitProof)
    .get(auth, getPendingProofs);

router.route('/:id/review')
    .put(auth, reviewProof);

export default router;