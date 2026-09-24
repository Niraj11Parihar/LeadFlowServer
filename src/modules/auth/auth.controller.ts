
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

  static updateProfile = async (req: AuthRequest, res: Response) => {
    const updatedUser = await AuthService.updateProfile(req.user!.userId, req.body);
    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  };

  static changePassword = async (req: AuthRequest, res: Response) => {
    const result = await AuthService.changePassword(req.user!.userId, req.body);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  };
}
