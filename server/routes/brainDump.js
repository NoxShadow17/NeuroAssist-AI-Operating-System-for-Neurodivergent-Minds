import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  processBrainDump,
  getBrainDumps,
} from '../controllers/brainDumpController.js';

const router = express.Router();

router.get('/', authMiddleware, getBrainDumps);
router.post('/', authMiddleware, processBrainDump);

export default router;
