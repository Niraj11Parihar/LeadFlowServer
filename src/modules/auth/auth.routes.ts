import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { registerSchema, loginSchema } from './auth.schema';
import { authenticateUser } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.post('/register', validateRequest(registerSchema), asyncHandler(AuthController.register));
router.post('/login', validateRequest(loginSchema), asyncHandler(AuthController.login));
router.get('/me', authenticateUser, asyncHandler(AuthController.me));

export default router;
