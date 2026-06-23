import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getHealthProfile, updateAndAnalyze, addHealthRecord } from '../controllers/healthController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getHealthProfile);
router.post('/analyze', updateAndAnalyze);
router.post('/track', addHealthRecord);

export default router;
