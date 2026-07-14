import express from 'express';
import {
    getTasks,
    createTask,
    completeTask,
    getCropTaskChain,
    getMyCrops,
    completeCropTask,
} from '../controllers/task.controller.js';
import { auth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Legacy flat task list
router.get('/', optionalAuth, getTasks);
router.post('/', auth, createTask);
router.post('/:id/complete', auth, completeTask);

// Crop-chain endpoints
router.get('/my-crops', auth, getMyCrops);
router.get('/crop-chain', optionalAuth, getCropTaskChain);
router.post('/crop-chain/:userCropTaskId/complete', auth, completeCropTask);

export default router;