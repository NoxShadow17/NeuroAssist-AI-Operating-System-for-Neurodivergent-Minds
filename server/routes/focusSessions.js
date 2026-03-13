import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  logFocusSession,
  getFocusSessions,
} from '../controllers/focusSessionController.js';

const router = express.Router();

router.get('/', authMiddleware, getFocusSessions);
router.post('/', authMiddleware, logFocusSession);

export default router;
