"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadController = void 0;
const lead_service_1 = require("./lead.service");
class LeadController {
    static getLeads = async (req, res) => {
        const result = await lead_service_1.LeadService.getLeads(req.user.userId, req.query);
        res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination,
        });
    };
    static getLeadById = async (req, res) => {
        const lead = await lead_service_1.LeadService.getLeadById(req.user.userId, req.params.id);
        res.status(200).json({
            success: true,
            data: lead,
        });
    };
    static createLead = async (req, res) => {
        const lead = await lead_service_1.LeadService.createLead(req.user.userId, req.body);
        res.status(201).json({
            success: true,
            data: lead,
        });
    };
    static updateLead = async (req, res) => {
        const lead = await lead_service_1.LeadService.updateLead(req.user.userId, req.params.id, req.body);
        res.status(200).json({
            success: true,
            data: lead,
        });
    };
    static deleteLead = async (req, res) => {
        const result = await lead_service_1.LeadService.deleteLead(req.user.userId, req.params.id);
        res.status(200).json({
            success: true,
            data: result,
        });
    };
    static getFollowUps = async (req, res) => {
        const result = await lead_service_1.LeadService.getFollowUps(req.user.userId, req.params.id, req.query);
        res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination,
        });
    };
    static createFollowUp = async (req, res) => {
        const followUp = await lead_service_1.LeadService.createFollowUp(req.user.userId, req.params.id, req.body);
        res.status(201).json({
            success: true,
            data: followUp,
        });
    };
    static completeFollowUp = async (req, res) => {
        const followUp = await lead_service_1.LeadService.completeFollowUp(req.user.userId, req.params.id, req.params.followUpId, req.body);
        res.status(200).json({
            success: true,
            data: followUp,
        });
    };
    static rescheduleFollowUp = async (req, res) => {
        const followUp = await lead_service_1.LeadService.rescheduleFollowUp(req.user.userId, req.params.id, req.params.followUpId, req.body);
        res.status(200).json({
            success: true,
            data: followUp,
        });
    };
    static getActivities = async (req, res) => {
        const result = await lead_service_1.LeadService.getActivities(req.user.userId, req.params.id, req.query);
        res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination,
        });
    };
}
exports.LeadController = LeadController;
