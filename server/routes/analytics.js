import express from 'express';
import { getPublicStats, getAdminAnalytics, getUserStats } from '../controllers/analyticsController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
const router = express.Router();
router.get('/public', getPublicStats);
router.get('/user', authenticate, getUserStats);
router.get('/admin', authenticate, requireAdmin, getAdminAnalytics);
export default router;
