import express from 'express';
import authMiddleware from '../middleware/auth.js';
import * as writingController from '../controllers/writingController.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all writing sessions
router.get('/', writingController.getWritingSessions);

// Create a new writing session
router.post('/', writingController.createWritingSession);

// Get a specific writing session with history
router.get('/:sessionId', writingController.getWritingSession);

// Update writing session content (draft)
router.put('/:sessionId', writingController.updateWritingSession);

// Refine text using AI
router.post('/:sessionId/refine', writingController.refineText);

// Save refined text to a writing session
router.post('/:sessionId/save-refined', writingController.saveRefinedText);

// Delete a writing session
router.delete('/:sessionId', writingController.deleteWritingSession);

export default router;
