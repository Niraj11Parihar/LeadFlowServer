import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthRequest } from '../../middleware/auth.middleware';

export class AuthController {
  static register = async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  };

  static login = async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  };

  static me = async (req: AuthRequest, res: Response) => {
    const user = await AuthService.getUserProfile(req.user!.userId);
    res.status(200).json({
      success: true,
      data: user,
    });
  };
}
