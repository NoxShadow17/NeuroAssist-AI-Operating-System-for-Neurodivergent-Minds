import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getRooms,
  createRoom,
  joinRoom,
  leaveRoom,
  joinRoomByCode,
  deleteRoom,
} from '../controllers/focusRoomController.js';

const router = express.Router();

router.get('/', authMiddleware, getRooms);
router.post('/', authMiddleware, createRoom);
router.post('/join-by-code', authMiddleware, joinRoomByCode);
router.post('/:id/join', authMiddleware, joinRoom);
router.post('/:id/leave', authMiddleware, leaveRoom);
router.delete('/:id', authMiddleware, deleteRoom);

export default router;
