import express from 'express';
import { registerUser, getMe, updateLastLogin } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
router.post('/register', registerUser);
router.get('/me', authenticate, getMe);
router.post('/login', authenticate, updateLastLogin);
export default router;
