"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lead_controller_1 = require("./lead.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const lead_schema_1 = require("./lead.schema");
const asyncHandler_1 = require("../../utils/asyncHandler");
const router = (0, express_1.Router)();
// Apply authentication to all lead routes
router.use(auth_middleware_1.authenticateUser);
router.get('/', (0, validate_middleware_1.validateRequest)(lead_schema_1.getLeadsQuerySchema), (0, asyncHandler_1.asyncHandler)(lead_controller_1.LeadController.getLeads));
router.post('/', (0, validate_middleware_1.validateRequest)(lead_schema_1.createLeadSchema), (0, asyncHandler_1.asyncHandler)(lead_controller_1.LeadController.createLead));
router.get('/:id', (0, validate_middleware_1.validateRequest)(lead_schema_1.leadIdParamSchema), (0, asyncHandler_1.asyncHandler)(lead_controller_1.LeadController.getLeadById));
router.patch('/:id', (0, validate_middleware_1.validateRequest)(lead_schema_1.updateLeadSchema), (0, asyncHandler_1.asyncHandler)(lead_controller_1.LeadController.updateLead));
router.delete('/:id', (0, validate_middleware_1.validateRequest)(lead_schema_1.leadIdParamSchema), (0, asyncHandler_1.asyncHandler)(lead_controller_1.LeadController.deleteLead));
// Follow-ups endpoints
router.get('/:id/follow-ups', (0, validate_middleware_1.validateRequest)(lead_schema_1.getFollowUpsQuerySchema), (0, asyncHandler_1.asyncHandler)(lead_controller_1.LeadController.getFollowUps));
router.post('/:id/follow-ups', (0, validate_middleware_1.validateRequest)(lead_schema_1.createFollowUpSchema), (0, asyncHandler_1.asyncHandler)(lead_controller_1.LeadController.createFollowUp));
router.post('/:id/follow-ups/:followUpId/complete', (0, validate_middleware_1.validateRequest)(lead_schema_1.completeFollowUpSchema), (0, asyncHandler_1.asyncHandler)(lead_controller_1.LeadController.completeFollowUp));
router.patch('/:id/follow-ups/:followUpId/reschedule', (0, validate_middleware_1.validateRequest)(lead_schema_1.rescheduleFollowUpSchema), (0, asyncHandler_1.asyncHandler)(lead_controller_1.LeadController.rescheduleFollowUp));
// Activities timeline endpoint
router.get('/:id/activities', (0, validate_middleware_1.validateRequest)(lead_schema_1.getActivitiesQuerySchema), (0, asyncHandler_1.asyncHandler)(lead_controller_1.LeadController.getActivities));
exports.default = router;
