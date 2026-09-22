import { Prisma, LeadStage, FollowUpStatus, ActivityType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';
import {
  CreateLeadInput,
  UpdateLeadInput,
  GetLeadsQuery,
  CompleteFollowUpInput,
  CreateFollowUpInput,
  RescheduleFollowUpInput,
  GetFollowUpsQuery,
  GetActivitiesQuery,
} from './lead.schema';

export class LeadService {
  static async getLeads(userId: string, query: GetLeadsQuery) {
    const pageNum = Math.max(1, parseInt(String(query?.page || 1), 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(String(query?.limit || 20), 10)));
    const { search, stage, followUp, sortBy = 'createdAt', sortOrder = 'desc' } = query || {};

    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    const where: Prisma.LeadWhereInput = {
      userId,
    };

    if (stage) {
      where.stage = stage;
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
        { company: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (followUp) {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      if (followUp === 'today') {
        where.followUpAt = {
          gte: startOfToday,
          lte: endOfToday,
        };
      } else if (followUp === 'overdue') {
        where.followUpAt = {
          lt: startOfToday,
        };
        where.stage = {
          notIn: [LeadStage.WON, LeadStage.LOST],
        };
      } else if (followUp === 'upcoming') {
        where.followUpAt = {
          gt: endOfToday,
        };
      }
    }

    const validSortFields = ['createdAt', 'name', 'company', 'stage', 'nextFollowUpAt', 'lastActivityAt', 'followUpAt'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const orderBy: Prisma.LeadOrderByWithRelationInput = {
      [actualSortBy]: sortOrder,
    };

    const [leads, totalItems] = await prisma.$transaction([
      prisma.lead.findMany({
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
      prisma.lead.count({ where }),
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

  static async getLeadById(userId: string, leadId: string) {
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        userId,
      },
    });

    if (!lead) {
      throw new AppError('Lead not found or access denied', 404);
    }

    return lead;
  }

  static async createLead(userId: string, data: CreateLeadInput) {
    const scheduledDate = data.followUpAt ? new Date(data.followUpAt) : null;

    return await prisma.$transaction(async (tx) => {
      const now = new Date();
      const lead = await tx.lead.create({
        data: {
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          company: data.company || null,
          source: data.source || null,
          stage: data.stage || LeadStage.NEW,
          followUpAt: scheduledDate,
          nextFollowUpAt: scheduledDate,
          lastActivityAt: now,
          notes: data.notes || null,
          userId,
        },
      });

      await tx.leadActivity.create({
        data: {
          leadId: lead.id,
          userId,
          type: ActivityType.LEAD_CREATED,
          description: `Lead created for ${lead.name}`,
          createdAt: now,
        },
      });

      if (scheduledDate) {
        await tx.followUp.create({
          data: {
            leadId: lead.id,
            userId,
            sequenceNumber: 1,
            status: FollowUpStatus.SCHEDULED,
            scheduledAt: scheduledDate,
            createdAt: now,
          },
        });

        await tx.leadActivity.create({
          data: {
            leadId: lead.id,
            userId,
            type: ActivityType.FOLLOWUP_SCHEDULED,
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

  static async updateLead(userId: string, leadId: string, data: UpdateLeadInput) {
    const existingLead = await this.getLeadById(userId, leadId);

    const updateData: Prisma.LeadUpdateInput = {};
    const changedFields: string[] = [];

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

    return await prisma.$transaction(async (tx) => {
      const updatedLead = await tx.lead.update({
        where: { id: leadId },
        data: updateData,
      });

      if (changedFields.length > 0) {
        await tx.leadActivity.create({
          data: {
            leadId,
            userId,
            type: ActivityType.LEAD_UPDATED,
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
            type: ActivityType.STAGE_CHANGED,
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

  static async deleteLead(userId: string, leadId: string) {
    await this.getLeadById(userId, leadId);

    await prisma.lead.delete({
      where: { id: leadId },
    });

    return { message: 'Lead deleted successfully' };
  }

  static async getFollowUps(userId: string, leadId: string, query: GetFollowUpsQuery) {
    await this.getLeadById(userId, leadId);

    const pageNum = Math.max(1, parseInt(String(query?.page || 1), 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(String(query?.limit || 10), 10)));
    const { status } = query || {};
    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    const where: Prisma.FollowUpWhereInput = {
      leadId,
    };

    if (status) {
      where.status = status;
    }

    const [followUps, totalItems] = await prisma.$transaction([
      prisma.followUp.findMany({
        where,
        skip,
        take,
        orderBy: [{ sequenceNumber: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.followUp.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum) || 1;

    return {
      data: followUps,
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

  static async createFollowUp(userId: string, leadId: string, data: CreateFollowUpInput) {
    const lead = await this.getLeadById(userId, leadId);
    const scheduledDate = new Date(data.scheduledAt);
    const now = new Date();

    return await prisma.$transaction(async (tx) => {
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
          status: FollowUpStatus.SCHEDULED,
          scheduledAt: scheduledDate,
          communicationMedium: data.communicationMedium?.trim() || null,
          createdAt: now,
        },
      });

      await tx.lead.update({
        where: { id: leadId },
        data: {
          followUpAt: scheduledDate,
          nextFollowUpAt: scheduledDate,
          lastActivityAt: now,
        },
      });

      await tx.leadActivity.create({
        data: {
          leadId,
          userId,
          type: ActivityType.FOLLOWUP_SCHEDULED,
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

  static async completeFollowUp(userId: string, leadId: string, followUpId: string, data: CompleteFollowUpInput) {
    const lead = await this.getLeadById(userId, leadId);

    let followUp = null;
    if (followUpId === 'latest' || followUpId === 'new') {
      followUp = await prisma.followUp.findFirst({
        where: { leadId, status: FollowUpStatus.SCHEDULED },
        orderBy: [{ sequenceNumber: 'desc' }, { scheduledAt: 'desc' }],
      });

      if (!followUp) {
        followUp = await prisma.followUp.findFirst({
          where: { leadId },
          orderBy: { sequenceNumber: 'desc' },
        });
      }
    } else {
      followUp = await prisma.followUp.findFirst({
        where: { id: followUpId, leadId },
      });
    }

    const now = new Date();
    const normalizedMedium = data.communicationMedium.toLowerCase().trim();
    const nextScheduledDate = data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : null;

    return await prisma.$transaction(async (tx) => {
      let targetFollowUp = followUp;

      if (!targetFollowUp) {
        const maxSeq = await tx.followUp.aggregate({
          where: { leadId },
          _max: { sequenceNumber: true },
        });
        const sequenceNumber = (maxSeq._max.sequenceNumber || 0) + 1;

        targetFollowUp = await tx.followUp.create({
          data: {
            leadId,
            userId,
            sequenceNumber,
            status: FollowUpStatus.SCHEDULED,
            scheduledAt: now,
            createdAt: now,
          },
        });
      }

      const completedFollowUp = await tx.followUp.update({
        where: { id: targetFollowUp.id },
        data: {
          status: FollowUpStatus.COMPLETED,
          completedAt: now,
          communicationMedium: data.communicationMedium,
          communicationMediumNormalized: normalizedMedium,
          discussionNote: data.discussionNote,
          outcome: data.outcome || null,
          nextFollowUpAt: nextScheduledDate,
        },
      });

      await tx.leadActivity.create({
        data: {
          leadId,
          userId,
          type: ActivityType.FOLLOWUP_COMPLETED,
          description: `Follow-up #${targetFollowUp.sequenceNumber} completed (${data.communicationMedium})`,
          metadata: {
            followUpId: targetFollowUp.id,
            sequenceNumber: targetFollowUp.sequenceNumber,
            communicationMedium: data.communicationMedium,
            discussionNote: data.discussionNote,
            outcome: data.outcome || null,
          },
          createdAt: now,
        },
      });

      if (data.stage && data.stage !== lead.stage) {
        await tx.lead.update({
          where: { id: leadId },
          data: { stage: data.stage },
        });

        await tx.leadActivity.create({
          data: {
            leadId,
            userId,
            type: ActivityType.STAGE_CHANGED,
            description: `Stage changed from ${lead.stage} to ${data.stage}`,
            metadata: {
              oldStage: lead.stage,
              newStage: data.stage,
            },
            createdAt: now,
          },
        });
      }

      if (nextScheduledDate) {
        const maxSeq = await tx.followUp.aggregate({
          where: { leadId },
          _max: { sequenceNumber: true },
        });
        const nextSequence = (maxSeq._max.sequenceNumber || targetFollowUp.sequenceNumber || 0) + 1;

        const nextFollowUp = await tx.followUp.create({
          data: {
            leadId,
            userId,
            sequenceNumber: nextSequence,
            status: FollowUpStatus.SCHEDULED,
            scheduledAt: nextScheduledDate,
            createdAt: now,
          },
        });

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
            type: ActivityType.FOLLOWUP_SCHEDULED,
            description: `Follow-up #${nextSequence} scheduled`,
            metadata: {
              followUpId: nextFollowUp.id,
              sequenceNumber: nextSequence,
              scheduledAt: nextScheduledDate.toISOString(),
            },
            createdAt: now,
          },
        });
      } else {
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

  static async rescheduleFollowUp(userId: string, leadId: string, followUpId: string, data: RescheduleFollowUpInput) {
    await this.getLeadById(userId, leadId);

    const followUp = await prisma.followUp.findFirst({
      where: { id: followUpId, leadId },
    });

    if (!followUp) {
      throw new AppError('Follow-up record not found', 404);
    }

    if (followUp.status !== FollowUpStatus.SCHEDULED) {
      throw new AppError('Only scheduled follow-ups can be rescheduled', 400);
    }

    const previousScheduledAt = followUp.scheduledAt;
    const newScheduledAt = new Date(data.scheduledAt);
    const now = new Date();

    return await prisma.$transaction(async (tx) => {
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
          type: ActivityType.FOLLOWUP_RESCHEDULED,
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

  static async getActivities(userId: string, leadId: string, query: GetActivitiesQuery) {
    await this.getLeadById(userId, leadId);

    const pageNum = Math.max(1, parseInt(String(query?.page || 1), 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(String(query?.limit || 20), 10)));
    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    const [activities, totalItems] = await prisma.$transaction([
      prisma.leadActivity.findMany({
        where: { leadId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.leadActivity.count({ where: { leadId } }),
    ]);

    const followUpIds = activities
      .filter((a) => a.type === ActivityType.FOLLOWUP_COMPLETED && (a.metadata as any)?.followUpId)
      .map((a) => (a.metadata as any).followUpId as string);

    let followUpMap: Record<string, any> = {};
    if (followUpIds.length > 0) {
      const followUps = await prisma.followUp.findMany({
        where: { id: { in: followUpIds } },
      });
      followUpMap = followUps.reduce((acc, f) => {
        acc[f.id] = f;
        return acc;
      }, {} as Record<string, any>);
    }

    const enrichedActivities = activities.map((act) => {
      const meta = (act.metadata as any) || {};
      if (act.type === ActivityType.FOLLOWUP_COMPLETED) {
        const f = meta.followUpId ? followUpMap[meta.followUpId] : null;
        return {
          ...act,
          metadata: {
            ...meta,
            discussionNote: meta.discussionNote || f?.discussionNote || null,
            communicationMedium: meta.communicationMedium || f?.communicationMedium || null,
            outcome: meta.outcome || f?.outcome || null,
          },
        };
      }
      return act;
    });

    const totalPages = Math.ceil(totalItems / limitNum) || 1;

    return {
      data: enrichedActivities,
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
}
