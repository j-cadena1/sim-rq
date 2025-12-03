import { Router } from 'express';
import { login, verifyToken } from '../controllers/authController';

const router = Router();

// Public routes - no authentication required
router.post('/login', login);
router.get('/verify', verifyToken);

export default router;
