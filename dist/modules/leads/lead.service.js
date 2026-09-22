"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../lib/prisma");
const error_middleware_1 = require("../../middleware/error.middleware");
class LeadService {
    static async getLeads(userId, query) {
        const pageNum = Math.max(1, parseInt(String(query?.page || 1), 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(String(query?.limit || 20), 10)));
        const { search, stage, followUp, sortBy = 'createdAt', sortOrder = 'desc' } = query || {};
        const skip = (pageNum - 1) * limitNum;
        const take = limitNum;
        const where = {
            userId,
        };
        // Stage filter
        if (stage) {
            where.stage = stage;
        }
        // Search filter (name, email, phone, company)
        if (search && search.trim() !== '') {
            const term = search.trim();
            where.OR = [
                { name: { contains: term, mode: 'insensitive' } },
                { email: { contains: term, mode: 'insensitive' } },
                { phone: { contains: term, mode: 'insensitive' } },
                { company: { contains: term, mode: 'insensitive' } },
            ];
        }
        // Follow-up filter (today, overdue, upcoming)
        if (followUp) {
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            if (followUp === 'today') {
                where.followUpAt = {
                    gte: startOfToday,
                    lte: endOfToday,
                };
            }
            else if (followUp === 'overdue') {
                where.followUpAt = {
                    lt: startOfToday,
                };
                where.stage = {
                    notIn: [client_1.LeadStage.WON, client_1.LeadStage.LOST],
                };
            }
            else if (followUp === 'upcoming') {
                where.followUpAt = {
                    gt: endOfToday,
                };
            }
        }
        // Sort mapping
        const validSortFields = ['createdAt', 'name', 'company', 'stage', 'nextFollowUpAt', 'lastActivityAt', 'followUpAt'];
        const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const orderBy = {
            [actualSortBy]: sortOrder,
        };
        const [leads, totalItems] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.lead.findMany({
                where,
                skip,
                take,
                orderBy,
                select: {
                    id: true,
                    userId: true,
                    name: true,
                    email: true,
                    phone: true,
                    company: true,
                    source: true,
                    stage: true,
                    followUpAt: true,
                    nextFollowUpAt: true,
                    lastFollowUpAt: true,
                    lastActivityAt: true,
                    notes: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            prisma_1.prisma.lead.count({ where }),
        ]);
        const totalPages = Math.ceil(totalItems / limitNum) || 1;
        return {
            data: leads,
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalItems,
                totalPages,
                hasNextPage: pageNum < totalPages,
                hasPreviousPage: pageNum > 1,
            },
        };
    }
    static async getLeadById(userId, leadId) {
        const lead = await prisma_1.prisma.lead.findFirst({
            where: {
                id: leadId,
                userId,
            },
        });
        if (!lead) {
            throw new error_middleware_1.AppError('Lead not found or access denied', 404);
        }
        return lead;
    }
    static async createLead(userId, data) {
        const scheduledDate = data.followUpAt ? new Date(data.followUpAt) : null;
        return await prisma_1.prisma.$transaction(async (tx) => {
            const now = new Date();
            const lead = await tx.lead.create({
                data: {
                    name: data.name,
                    email: data.email || null,
                    phone: data.phone || null,
                    company: data.company || null,
                    source: data.source || null,
                    stage: data.stage || client_1.LeadStage.NEW,
                    followUpAt: scheduledDate,
                    nextFollowUpAt: scheduledDate,
                    lastActivityAt: now,
                    notes: data.notes || null,
                    userId,
                },
            });
            // Log lead_created activity
            await tx.leadActivity.create({
                data: {
                    leadId: lead.id,
                    userId,
                    type: client_1.ActivityType.LEAD_CREATED,
                    description: `Lead created for ${lead.name}`,
                    createdAt: now,
                },
            });
            // If followUpAt is specified, automatically create Follow-Up #1 in SCHEDULED state
            if (scheduledDate) {
                await tx.followUp.create({
                    data: {
                        leadId: lead.id,
                        userId,
                        sequenceNumber: 1,
                        status: client_1.FollowUpStatus.SCHEDULED,
                        scheduledAt: scheduledDate,
                        createdAt: now,
                    },
                });
                await tx.leadActivity.create({
                    data: {
                        leadId: lead.id,
                        userId,
                        type: client_1.ActivityType.FOLLOWUP_SCHEDULED,
                        description: `Follow-up #1 scheduled`,
                        metadata: {
                            sequenceNumber: 1,
                            scheduledAt: scheduledDate.toISOString(),
                        },
                        createdAt: now,
                    },
                });
            }
            return lead;
        });
    }
    static async updateLead(userId, leadId, data) {
        const existingLead = await this.getLeadById(userId, leadId);
        const updateData = {};
        const changedFields = [];
        if (data.name !== undefined && data.name !== existingLead.name) {
            updateData.name = data.name;
            changedFields.push('name');
        }
        if (data.email !== undefined && data.email !== existingLead.email) {
            updateData.email = data.email || null;
            changedFields.push('email');
        }
        if (data.phone !== undefined && data.phone !== existingLead.phone) {
            updateData.phone = data.phone || null;
            changedFields.push('phone');
        }
        if (data.company !== undefined && data.company !== existingLead.company) {
            updateData.company = data.company || null;
            changedFields.push('company');
        }
        if (data.source !== undefined && data.source !== existingLead.source) {
            updateData.source = data.source || null;
            changedFields.push('source');
        }
        if (data.notes !== undefined && data.notes !== existingLead.notes) {
            updateData.notes = data.notes || null;
            changedFields.push('notes');
        }
        if (data.followUpAt !== undefined) {
            const newFollowUpDate = data.followUpAt ? new Date(data.followUpAt) : null;
            updateData.followUpAt = newFollowUpDate;
            updateData.nextFollowUpAt = newFollowUpDate;
            changedFields.push('followUpAt');
        }
        const stageChanged = data.stage !== undefined && data.stage !== existingLead.stage;
        if (stageChanged) {
            updateData.stage = data.stage;
        }
        const now = new Date();
        updateData.lastActivityAt = now;
        return await prisma_1.prisma.$transaction(async (tx) => {
            const updatedLead = await tx.lead.update({
                where: { id: leadId },
                data: updateData,
            });
            if (changedFields.length > 0) {
                await tx.leadActivity.create({
                    data: {
                        leadId,
                        userId,
                        type: client_1.ActivityType.LEAD_UPDATED,
                        description: `Lead updated (${changedFields.join(', ')})`,
                        metadata: { changedFields },
                        createdAt: now,
                    },
                });
            }
            if (stageChanged) {
                await tx.leadActivity.create({
                    data: {
                        leadId,
                        userId,
                        type: client_1.ActivityType.STAGE_CHANGED,
                        description: `Stage changed from ${existingLead.stage} to ${data.stage}`,
                        metadata: {
                            oldStage: existingLead.stage,
                            newStage: data.stage,
                        },
                        createdAt: now,
                    },
                });
            }
            return updatedLead;
        });
    }
    static async deleteLead(userId, leadId) {
        await this.getLeadById(userId, leadId);
        await prisma_1.prisma.lead.delete({
            where: { id: leadId },
        });
        return { message: 'Lead deleted successfully' };
    }
    // Follow-ups API
    static async getFollowUps(userId, leadId, query) {
        await this.getLeadById(userId, leadId);
        const { page = 1, limit = 10, status } = query;
        const skip = (page - 1) * limit;
        const where = {
            leadId,
        };
        if (status) {
            where.status = status;
        }
        const [followUps, totalItems] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.followUp.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ sequenceNumber: 'desc' }, { createdAt: 'desc' }],
            }),
            prisma_1.prisma.followUp.count({ where }),
        ]);
        const totalPages = Math.ceil(totalItems / limit) || 1;
        return {
            data: followUps,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
    static async createFollowUp(userId, leadId, data) {
        const lead = await this.getLeadById(userId, leadId);
        const scheduledDate = new Date(data.scheduledAt);
        const now = new Date();
        return await prisma_1.prisma.$transaction(async (tx) => {
            // Find highest sequence number for this lead
            const maxSeq = await tx.followUp.aggregate({
                where: { leadId },
                _max: { sequenceNumber: true },
            });
            const sequenceNumber = (maxSeq._max.sequenceNumber || 0) + 1;
            const followUp = await tx.followUp.create({
                data: {
                    leadId,
                    userId,
                    sequenceNumber,
                    status: client_1.FollowUpStatus.SCHEDULED,
                    scheduledAt: scheduledDate,
                    communicationMedium: data.communicationMedium?.trim() || null,
                    createdAt: now,
                },
            });
            // Update lead
            await tx.lead.update({
                where: { id: leadId },
                data: {
                    followUpAt: scheduledDate,
                    nextFollowUpAt: scheduledDate,
                    lastActivityAt: now,
                },
            });
            // Log activity
            await tx.leadActivity.create({
                data: {
                    leadId,
                    userId,
                    type: client_1.ActivityType.FOLLOWUP_SCHEDULED,
                    description: `Follow-up #${sequenceNumber} scheduled`,
                    metadata: {
                        followUpId: followUp.id,
                        sequenceNumber,
                        scheduledAt: scheduledDate.toISOString(),
                    },
                    createdAt: now,
                },
            });
            return followUp;
        });
    }
    static async completeFollowUp(userId, leadId, followUpId, data) {
        const lead = await this.getLeadById(userId, leadId);
        const followUp = await prisma_1.prisma.followUp.findFirst({
            where: { id: followUpId, leadId },
        });
        if (!followUp) {
            throw new error_middleware_1.AppError('Follow-up record not found', 404);
        }
        const now = new Date();
        const normalizedMedium = data.communicationMedium.toLowerCase().trim();
        const nextScheduledDate = data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : null;
        return await prisma_1.prisma.$transaction(async (tx) => {
            // 1. Update existing follow-up
            const completedFollowUp = await tx.followUp.update({
                where: { id: followUpId },
                data: {
                    status: client_1.FollowUpStatus.COMPLETED,
                    completedAt: now,
                    communicationMedium: data.communicationMedium,
                    communicationMediumNormalized: normalizedMedium,
                    discussionNote: data.discussionNote,
                    outcome: data.outcome || null,
                    nextFollowUpAt: nextScheduledDate,
                },
            });
            // 2. Log followup_completed activity
            await tx.leadActivity.create({
                data: {
                    leadId,
                    userId,
                    type: client_1.ActivityType.FOLLOWUP_COMPLETED,
                    description: `Follow-up #${followUp.sequenceNumber} completed (${data.communicationMedium})`,
                    metadata: {
                        followUpId,
                        sequenceNumber: followUp.sequenceNumber,
                        communicationMedium: data.communicationMedium,
                        outcome: data.outcome || null,
                    },
                    createdAt: now,
                },
            });
            // 3. Stage update if requested
            if (data.stage && data.stage !== lead.stage) {
                await tx.lead.update({
                    where: { id: leadId },
                    data: { stage: data.stage },
                });
                await tx.leadActivity.create({
                    data: {
                        leadId,
                        userId,
                        type: client_1.ActivityType.STAGE_CHANGED,
                        description: `Stage changed from ${lead.stage} to ${data.stage}`,
                        metadata: {
                            oldStage: lead.stage,
                            newStage: data.stage,
                        },
                        createdAt: now,
                    },
                });
            }
            // 4. Create next scheduled follow-up if requested
            if (nextScheduledDate) {
                const maxSeq = await tx.followUp.aggregate({
                    where: { leadId },
                    _max: { sequenceNumber: true },
                });
                const nextSequence = (maxSeq._max.sequenceNumber || followUp.sequenceNumber || 0) + 1;
                const nextFollowUp = await tx.followUp.create({
                    data: {
                        leadId,
                        userId,
                        sequenceNumber: nextSequence,
                        status: client_1.FollowUpStatus.SCHEDULED,
                        scheduledAt: nextScheduledDate,
                        createdAt: now,
                    },
                });
                // Update lead state
                await tx.lead.update({
                    where: { id: leadId },
                    data: {
                        followUpAt: nextScheduledDate,
                        nextFollowUpAt: nextScheduledDate,
                        lastFollowUpAt: now,
                        lastActivityAt: now,
                    },
                });
                await tx.leadActivity.create({
                    data: {
                        leadId,
                        userId,
                        type: client_1.ActivityType.FOLLOWUP_SCHEDULED,
                        description: `Follow-up #${nextSequence} scheduled`,
                        metadata: {
                            followUpId: nextFollowUp.id,
                            sequenceNumber: nextSequence,
                            scheduledAt: nextScheduledDate.toISOString(),
                        },
                        createdAt: now,
                    },
                });
            }
            else {
                // Clear active followUpAt on lead if no next follow-up is set
                await tx.lead.update({
                    where: { id: leadId },
                    data: {
                        followUpAt: null,
                        nextFollowUpAt: null,
                        lastFollowUpAt: now,
                        lastActivityAt: now,
                    },
                });
            }
            return completedFollowUp;
        });
    }
    static async rescheduleFollowUp(userId, leadId, followUpId, data) {
        await this.getLeadById(userId, leadId);
        const followUp = await prisma_1.prisma.followUp.findFirst({
            where: { id: followUpId, leadId },
        });
        if (!followUp) {
            throw new error_middleware_1.AppError('Follow-up record not found', 404);
        }
        if (followUp.status !== client_1.FollowUpStatus.SCHEDULED) {
            throw new error_middleware_1.AppError('Only scheduled follow-ups can be rescheduled', 400);
        }
        const previousScheduledAt = followUp.scheduledAt;
        const newScheduledAt = new Date(data.scheduledAt);
        const now = new Date();
        return await prisma_1.prisma.$transaction(async (tx) => {
            const updatedFollowUp = await tx.followUp.update({
                where: { id: followUpId },
                data: {
                    scheduledAt: newScheduledAt,
                },
            });
            await tx.lead.update({
                where: { id: leadId },
                data: {
                    followUpAt: newScheduledAt,
                    nextFollowUpAt: newScheduledAt,
                    lastActivityAt: now,
                },
            });
            await tx.leadActivity.create({
                data: {
                    leadId,
                    userId,
                    type: client_1.ActivityType.FOLLOWUP_RESCHEDULED,
                    description: `Follow-up #${followUp.sequenceNumber} rescheduled`,
                    metadata: {
                        followUpId,
                        sequenceNumber: followUp.sequenceNumber,
                        previousScheduledAt: previousScheduledAt.toISOString(),
                        newScheduledAt: newScheduledAt.toISOString(),
                    },
                    createdAt: now,
                },
            });
            return updatedFollowUp;
        });
    }
    // Activities API
    static async getActivities(userId, leadId, query) {
        await this.getLeadById(userId, leadId);
        const { page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const [activities, totalItems] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.leadActivity.findMany({
                where: { leadId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.prisma.leadActivity.count({ where: { leadId } }),
        ]);
        const totalPages = Math.ceil(totalItems / limit) || 1;
        return {
            data: activities,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
}
exports.LeadService = LeadService;
