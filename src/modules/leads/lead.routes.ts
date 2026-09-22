import { Router } from 'express';
import { LeadController } from './lead.controller';
import { authenticateUser } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createLeadSchema,
  updateLeadSchema,
  leadIdParamSchema,
  getLeadsQuerySchema,
  getFollowUpsQuerySchema,
  createFollowUpSchema,
  completeFollowUpSchema,
  rescheduleFollowUpSchema,
  getActivitiesQuerySchema,
} from './lead.schema';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// Apply authentication to all lead routes
router.use(authenticateUser);

router.get('/', validateRequest(getLeadsQuerySchema), asyncHandler(LeadController.getLeads));
router.post('/', validateRequest(createLeadSchema), asyncHandler(LeadController.createLead));
router.get('/:id', validateRequest(leadIdParamSchema), asyncHandler(LeadController.getLeadById));
router.patch('/:id', validateRequest(updateLeadSchema), asyncHandler(LeadController.updateLead));
router.delete('/:id', validateRequest(leadIdParamSchema), asyncHandler(LeadController.deleteLead));

// Follow-ups endpoints
router.get('/:id/follow-ups', validateRequest(getFollowUpsQuerySchema), asyncHandler(LeadController.getFollowUps));
router.post('/:id/follow-ups', validateRequest(createFollowUpSchema), asyncHandler(LeadController.createFollowUp));
router.post('/:id/follow-ups/:followUpId/complete', validateRequest(completeFollowUpSchema), asyncHandler(LeadController.completeFollowUp));
router.patch('/:id/follow-ups/:followUpId/reschedule', validateRequest(rescheduleFollowUpSchema), asyncHandler(LeadController.rescheduleFollowUp));

// Activities timeline endpoint
router.get('/:id/activities', validateRequest(getActivitiesQuerySchema), asyncHandler(LeadController.getActivities));

export default router;
