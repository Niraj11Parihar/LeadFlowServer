import { LeadStage } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export class DashboardService {
  static async getDashboardStats(userId: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const total = await prisma.lead.count({ where: { userId } });

    const stageCounts = await prisma.lead.groupBy({
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
      if (sc.stage === LeadStage.NEW) stages.new = sc._count.stage;
      if (sc.stage === LeadStage.CONTACTED) stages.contacted = sc._count.stage;
      if (sc.stage === LeadStage.QUALIFIED) stages.qualified = sc._count.stage;
      if (sc.stage === LeadStage.WON) stages.won = sc._count.stage;
      if (sc.stage === LeadStage.LOST) stages.lost = sc._count.stage;
    });

    const todayCount = await prisma.lead.count({
      where: {
        userId,
        followUpAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    const overdueCount = await prisma.lead.count({
      where: {
        userId,
        followUpAt: {
          lt: startOfToday,
        },
        stage: {
          notIn: [LeadStage.WON, LeadStage.LOST],
        },
      },
    });

    const todayFollowUps = await prisma.lead.findMany({
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

    const overdueFollowUps = await prisma.lead.findMany({
      where: {
        userId,
        followUpAt: {
          lt: startOfToday,
        },
        stage: {
          notIn: [LeadStage.WON, LeadStage.LOST],
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
