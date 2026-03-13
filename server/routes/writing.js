import express from 'express';
import { refineText } from '../controllers/writingController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/refine', authMiddleware, refineText);

export default router;
