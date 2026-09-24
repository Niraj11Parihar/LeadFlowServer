import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from './auth.schema';
import { authenticateUser } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../middleware/rateLimit.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.post('/register', authRateLimiter(), validateRequest(registerSchema), asyncHandler(AuthController.register));
router.post('/login', authRateLimiter(), validateRequest(loginSchema), asyncHandler(AuthController.login));
router.get('/me', authenticateUser, asyncHandler(AuthController.me));
router.put('/profile', authenticateUser, validateRequest(updateProfileSchema), asyncHandler(AuthController.updateProfile));
router.put('/change-password', authenticateUser, validateRequest(changePasswordSchema), asyncHandler(AuthController.changePassword));

export default router;
