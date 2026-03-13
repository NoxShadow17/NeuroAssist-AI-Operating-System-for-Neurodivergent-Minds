import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
  getLeaderboard,
  completeOnboarding,
  getDashboardStats,
  deleteUserAccount,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.delete('/profile', authMiddleware, deleteUserAccount);
router.get('/settings', authMiddleware, getUserSettings);
router.put('/settings', authMiddleware, updateUserSettings);
router.post('/onboarding', authMiddleware, completeOnboarding);
router.get('/dashboard', authMiddleware, getDashboardStats);
router.get('/leaderboard', authMiddleware, getLeaderboard);

export default router;
