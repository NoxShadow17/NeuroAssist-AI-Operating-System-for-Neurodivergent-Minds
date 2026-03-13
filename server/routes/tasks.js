import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  decomposeTaskAction,
  toggleStep,
} from '../controllers/taskController.js';

const router = express.Router();

router.get('/', authMiddleware, getTasks);
router.post('/', authMiddleware, createTask);
router.put('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, deleteTask);
router.post('/:id/decompose', authMiddleware, decomposeTaskAction);
router.put('/steps/:stepId', authMiddleware, toggleStep);

export default router;
