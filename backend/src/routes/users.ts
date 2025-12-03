import { Router } from 'express';
import { getAllUsers, getCurrentUser } from '../controllers/usersController';
import { authenticate } from '../middleware/authentication';

const router = Router();

router.get('/', getAllUsers);
router.get('/me', authenticate, getCurrentUser);

export default router;
