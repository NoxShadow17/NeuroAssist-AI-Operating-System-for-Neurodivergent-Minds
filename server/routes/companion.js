import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getChatResponse,
  getEncouragement,
} from '../controllers/chatController.js';

const router = express.Router();

router.post('/chat', authMiddleware, getChatResponse);
router.get('/encourage', authMiddleware, getEncouragement);

export default router;
