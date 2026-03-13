import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getConversations,
  createConversation,
  getConversationMessages,
  addMessageToConversation,
  deleteConversation,
} from '../controllers/chatController.js';

const router = express.Router();

router.get('/conversations', authMiddleware, getConversations);
router.post('/conversations', authMiddleware, createConversation);
router.get('/conversations/:conversationId/messages', authMiddleware, getConversationMessages);
router.post('/conversations/:conversationId/messages', authMiddleware, addMessageToConversation);
router.delete('/conversations/:conversationId', authMiddleware, deleteConversation);

export default router;
