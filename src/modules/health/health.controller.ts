import { Request, Response } from 'express';

export class HealthController {
  static getHealth(_req: Request, res: Response) {
    return res.status(200).json({
      success: true,
      status: 'ok',
      service: 'backend',
      timestamp: new Date().toISOString(),
    });
  }
}
