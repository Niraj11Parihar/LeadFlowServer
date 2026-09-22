"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivitiesQuerySchema = exports.rescheduleFollowUpSchema = exports.completeFollowUpSchema = exports.createFollowUpSchema = exports.getFollowUpsQuerySchema = exports.getLeadsQuerySchema = exports.followUpParamSchema = exports.leadIdParamSchema = exports.updateLeadSchema = exports.createLeadSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createLeadSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required'),
        email: zod_1.z.string().email('Invalid email address').optional().or(zod_1.z.literal('')),
        phone: zod_1.z.string().optional(),
        company: zod_1.z.string().optional(),
        source: zod_1.z.string().optional(),
        stage: zod_1.z.nativeEnum(client_1.LeadStage).optional().default(client_1.LeadStage.NEW),
        followUpAt: zod_1.z.string().nullable().optional(),
        notes: zod_1.z.string().optional(),
    }),
});
exports.updateLeadSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid lead ID format'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name cannot be empty').optional(),
        email: zod_1.z.string().email('Invalid email address').nullable().optional().or(zod_1.z.literal('')),
        phone: zod_1.z.string().nullable().optional(),
        company: zod_1.z.string().nullable().optional(),
        source: zod_1.z.string().nullable().optional(),
        stage: zod_1.z.nativeEnum(client_1.LeadStage).optional(),
        followUpAt: zod_1.z.string().nullable().optional(),
        notes: zod_1.z.string().nullable().optional(),
    }),
});
exports.leadIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid lead ID format'),
    }),
});
exports.followUpParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid lead ID format'),
        followUpId: zod_1.z.string().uuid('Invalid follow-up ID format'),
    }),
});
exports.getLeadsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
        limit: zod_1.z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 20)) : 20)),
        search: zod_1.z.string().optional(),
        stage: zod_1.z.nativeEnum(client_1.LeadStage).optional(),
        followUp: zod_1.z.enum(['today', 'overdue', 'upcoming']).optional(),
        sortBy: zod_1.z.enum(['createdAt', 'name', 'company', 'stage', 'nextFollowUpAt', 'lastActivityAt']).optional().default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
exports.getFollowUpsQuerySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid lead ID format'),
    }),
    query: zod_1.z.object({
        page: zod_1.z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
        limit: zod_1.z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
        status: zod_1.z.nativeEnum(client_1.FollowUpStatus).optional(),
    }),
});
exports.createFollowUpSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid lead ID format'),
    }),
    body: zod_1.z.object({
        scheduledAt: zod_1.z.string().min(1, 'Scheduled date & time is required'),
        communicationMedium: zod_1.z.string().max(100).optional(),
        notes: zod_1.z.string().optional(),
    }),
});
exports.completeFollowUpSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid lead ID format'),
        followUpId: zod_1.z.string().uuid('Invalid follow-up ID format'),
    }),
    body: zod_1.z.object({
        communicationMedium: zod_1.z.string().min(1, 'Communication medium is required').max(100).transform((s) => s.trim()),
        discussionNote: zod_1.z.string().min(1, 'Discussion note is required').transform((s) => s.trim()),
        outcome: zod_1.z.string().optional().transform((s) => (s && s.trim().length > 0 ? s.trim() : undefined)),
        nextFollowUpAt: zod_1.z.string().nullable().optional(),
        stage: zod_1.z.nativeEnum(client_1.LeadStage).optional(),
    }),
});
exports.rescheduleFollowUpSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid lead ID format'),
        followUpId: zod_1.z.string().uuid('Invalid follow-up ID format'),
    }),
    body: zod_1.z.object({
        scheduledAt: zod_1.z.string().min(1, 'New scheduled date & time is required'),
    }),
});
exports.getActivitiesQuerySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid lead ID format'),
    }),
    query: zod_1.z.object({
        page: zod_1.z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
        limit: zod_1.z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 20)) : 20)),
    }),
});
