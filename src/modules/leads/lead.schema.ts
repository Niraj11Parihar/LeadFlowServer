import { z } from 'zod';
import { LeadStage, FollowUpStatus } from '@prisma/client';

export const createLeadSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().optional(),
    company: z.string().optional(),
    source: z.string().optional(),
    stage: z.nativeEnum(LeadStage).optional().default(LeadStage.NEW),
    followUpAt: z.string().nullable().optional(),
    notes: z.string().optional(),
  }),
});

export const updateLeadSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid lead ID format'),
  }),
  body: z.object({
    name: z.string().min(1, 'Name cannot be empty').optional(),
    email: z.string().email('Invalid email address').nullable().optional().or(z.literal('')),
    phone: z.string().nullable().optional(),
    company: z.string().nullable().optional(),
    source: z.string().nullable().optional(),
    stage: z.nativeEnum(LeadStage).optional(),
    followUpAt: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  }),
});

export const leadIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid lead ID format'),
  }),
});

export const followUpParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid lead ID format'),
    followUpId: z.string().uuid('Invalid follow-up ID format'),
  }),
});

export const getLeadsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 20)) : 20)),
    search: z.string().optional(),
    stage: z.nativeEnum(LeadStage).optional(),
    followUp: z.enum(['today', 'overdue', 'upcoming']).optional(),
    sortBy: z.enum(['createdAt', 'name', 'company', 'stage', 'nextFollowUpAt', 'lastActivityAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const getFollowUpsQuerySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid lead ID format'),
  }),
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
    status: z.nativeEnum(FollowUpStatus).optional(),
  }),
});

export const createFollowUpSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid lead ID format'),
  }),
  body: z.object({
    scheduledAt: z.string().min(1, 'Scheduled date & time is required'),
    communicationMedium: z.string().max(100).optional(),
    notes: z.string().optional(),
  }),
});

export const completeFollowUpSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid lead ID format'),
    followUpId: z.union([
      z.string().uuid(),
      z.literal('latest'),
      z.literal('new'),
    ]),
  }),
  body: z.object({
    communicationMedium: z.string().min(1, 'Communication medium is required').max(100).transform((s) => s.trim()),
    discussionNote: z.string().min(1, 'Discussion note is required').transform((s) => s.trim()),
    outcome: z.string().optional().transform((s) => (s && s.trim().length > 0 ? s.trim() : undefined)),
    nextFollowUpAt: z.string().nullable().optional(),
    stage: z.nativeEnum(LeadStage).optional(),
  }),
});

export const rescheduleFollowUpSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid lead ID format'),
    followUpId: z.string().min(1, 'Invalid follow-up ID format'),
  }),
  body: z.object({
    scheduledAt: z.string().min(1, 'New scheduled date & time is required'),
  }),
});

export const getActivitiesQuerySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid lead ID format'),
  }),
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 20)) : 20)),
  }),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>['body'];
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>['body'];
export type GetLeadsQuery = z.infer<typeof getLeadsQuerySchema>['query'];
export type CompleteFollowUpInput = z.infer<typeof completeFollowUpSchema>['body'];
export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>['body'];
export type RescheduleFollowUpInput = z.infer<typeof rescheduleFollowUpSchema>['body'];
export type GetFollowUpsQuery = z.infer<typeof getFollowUpsQuerySchema>['query'];
export type GetActivitiesQuery = z.infer<typeof getActivitiesQuerySchema>['query'];
