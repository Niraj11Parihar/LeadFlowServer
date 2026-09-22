import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticateUser } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get('/', authenticateUser, asyncHandler(DashboardController.getStats));

export default router;
