import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { LeadService } from './lead.service';

export class LeadController {
  static getLeads = async (req: AuthRequest, res: Response) => {
    const result = await LeadService.getLeads(req.user!.userId, req.query as any);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  };

  static getLeadById = async (req: AuthRequest, res: Response) => {
    const lead = await LeadService.getLeadById(req.user!.userId, req.params.id);
    res.status(200).json({
      success: true,
      data: lead,
    });
  };

  static createLead = async (req: AuthRequest, res: Response) => {
    const lead = await LeadService.createLead(req.user!.userId, req.body);
    res.status(201).json({
      success: true,
      data: lead,
    });
  };

  static updateLead = async (req: AuthRequest, res: Response) => {
    const lead = await LeadService.updateLead(req.user!.userId, req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: lead,
    });
  };

  static deleteLead = async (req: AuthRequest, res: Response) => {
    const result = await LeadService.deleteLead(req.user!.userId, req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  };

  static getFollowUps = async (req: AuthRequest, res: Response) => {
    const result = await LeadService.getFollowUps(req.user!.userId, req.params.id, req.query as any);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  };

  static createFollowUp = async (req: AuthRequest, res: Response) => {
    const followUp = await LeadService.createFollowUp(req.user!.userId, req.params.id, req.body);
    res.status(201).json({
      success: true,
      data: followUp,
    });
  };

  static completeFollowUp = async (req: AuthRequest, res: Response) => {
    const followUp = await LeadService.completeFollowUp(
      req.user!.userId,
      req.params.id,
      req.params.followUpId,
      req.body
    );
    res.status(200).json({
      success: true,
      data: followUp,
    });
  };

  static rescheduleFollowUp = async (req: AuthRequest, res: Response) => {
    const followUp = await LeadService.rescheduleFollowUp(
      req.user!.userId,
      req.params.id,
      req.params.followUpId,
      req.body
    );
    res.status(200).json({
      success: true,
      data: followUp,
    });
  };

  static getActivities = async (req: AuthRequest, res: Response) => {
    const result = await LeadService.getActivities(req.user!.userId, req.params.id, req.query as any);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  };
}
