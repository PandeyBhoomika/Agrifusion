import express from 'express';
import { auth } from '../middleware/auth.js';
import { uploadProofFiles } from '../middleware/upload.js';
import { submitProof, getPendingProofs, reviewProof } from '../controllers/proof.controller.js';
const router = express.Router();
router.post('/submit', auth, uploadProofFiles, submitProof);
router.route('/')
    .post(auth, uploadProofFiles, submitProof)
    .get(auth, getPendingProofs);
router.route('/:id/review')
    .put(auth, reviewProof);
export default router;