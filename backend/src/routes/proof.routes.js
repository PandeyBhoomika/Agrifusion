import express from 'express';
import { submitProof, getPendingProofs, reviewProof } from '../controllers/proof.controller.js';

const router = express.Router();

router.route('/')
    .post(submitProof)
    .get(getPendingProofs); // In reality, protect this route for Admins only

router.route('/:id/review')
    .put(reviewProof); // In reality, protect this route for Admins only

export default router;