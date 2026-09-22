"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../lib/prisma");
class DashboardService {
    static async getDashboardStats(userId) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        // Total leads count
        const total = await prisma_1.prisma.lead.count({ where: { userId } });
        // Breakdown by stage
        const stageCounts = await prisma_1.prisma.lead.groupBy({
            by: ['stage'],
            where: { userId },
            _count: { stage: true },
        });
        const stages = {
            new: 0,
            contacted: 0,
            qualified: 0,
            won: 0,
            lost: 0,
        };
        stageCounts.forEach((sc) => {
            if (sc.stage === client_1.LeadStage.NEW)
                stages.new = sc._count.stage;
            if (sc.stage === client_1.LeadStage.CONTACTED)
                stages.contacted = sc._count.stage;
            if (sc.stage === client_1.LeadStage.QUALIFIED)
                stages.qualified = sc._count.stage;
            if (sc.stage === client_1.LeadStage.WON)
                stages.won = sc._count.stage;
            if (sc.stage === client_1.LeadStage.LOST)
                stages.lost = sc._count.stage;
        });
        // Today's follow-ups count
        const todayCount = await prisma_1.prisma.lead.count({
            where: {
                userId,
                followUpAt: {
                    gte: startOfToday,
                    lte: endOfToday,
                },
            },
        });
        // Overdue follow-ups count (excluding WON and LOST)
        const overdueCount = await prisma_1.prisma.lead.count({
            where: {
                userId,
                followUpAt: {
                    lt: startOfToday,
                },
                stage: {
                    notIn: [client_1.LeadStage.WON, client_1.LeadStage.LOST],
                },
            },
        });
        // Today's follow-ups records
        const todayFollowUps = await prisma_1.prisma.lead.findMany({
            where: {
                userId,
                followUpAt: {
                    gte: startOfToday,
                    lte: endOfToday,
                },
            },
            select: {
                id: true,
                name: true,
                company: true,
                stage: true,
                followUpAt: true,
                phone: true,
                email: true,
            },
            orderBy: { followUpAt: 'asc' },
            take: 10,
        });
        // Overdue follow-ups records
        const overdueFollowUps = await prisma_1.prisma.lead.findMany({
            where: {
                userId,
                followUpAt: {
                    lt: startOfToday,
                },
                stage: {
                    notIn: [client_1.LeadStage.WON, client_1.LeadStage.LOST],
                },
            },
            select: {
                id: true,
                name: true,
                company: true,
                stage: true,
                followUpAt: true,
                phone: true,
                email: true,
            },
            orderBy: { followUpAt: 'asc' },
            take: 10,
        });
        return {
            total,
            stages,
            followUps: {
                today: todayCount,
                overdue: overdueCount,
            },
            todayFollowUps,
            overdueFollowUps,
        };
    }
}
exports.DashboardService = DashboardService;
