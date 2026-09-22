import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  static getStats = async (req: AuthRequest, res: Response) => {
    const stats = await DashboardService.getDashboardStats(req.user!.userId);
    res.status(200).json({
      success: true,
      data: stats,
    });
  };
}
