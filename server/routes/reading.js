import express from 'express';
import authMiddleware from '../middleware/auth.js';
import * as readingController from '../controllers/readingController.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all reading materials
router.get('/', readingController.getReadingMaterials);

// Create a new reading material
router.post('/', readingController.createReadingMaterial);

// Get specific reading material with preferences
router.get('/:materialId', readingController.getReadingMaterial);

// Update reading material
router.put('/:materialId', readingController.updateReadingMaterial);

// Save reading preferences (font size, spacing, mode, etc)
router.post('/:materialId/preferences', readingController.saveReadingPreferences);

// Track reading session (mark as completed/bookmarked)
router.post('/:materialId/session', readingController.trackReadingSession);

// Delete reading material
router.delete('/:materialId', readingController.deleteReadingMaterial);

export default router;
