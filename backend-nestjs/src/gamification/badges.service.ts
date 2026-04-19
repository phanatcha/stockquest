import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeTrigger, NotificationType, QuestActionType } from '@prisma/client';
import { QuestsService } from './quests.service';
import { NotificationsService } from './notifications.service';

@Injectable()
export class BadgesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quests: QuestsService,
    private readonly notifications: NotificationsService,
  ) {}

  async awardIfNew(userId: string, trigger: BadgeTrigger) {
    const badge = await this.prisma.badge.findUnique({ where: { trigger } });
    if (!badge) return null;

    const existing = await this.prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
    });
    if (existing) return null;

    await this.prisma.userBadge.create({
      data: { userId, badgeId: badge.id },
    });

    await this.notifications.create(
      userId,
      NotificationType.BADGE_EARNED,
      `Badge earned: ${badge.name}`,
    );

    await this.quests.applyEvent(userId, QuestActionType.BADGE_EARNED, 1);
    return badge;
  }

  async checkFirstTrade(userId: string) {
    const count = await this.prisma.order.count({
      where: { portfolio: { userId } },
    });
    if (count === 1) {
      await this.awardIfNew(userId, BadgeTrigger.FIRST_TRADE);
    }
  }

  async checkDiversified(userId: string, portfolioId: string) {
    const distinct = await this.prisma.holding.groupBy({
      by: ['symbol'],
      where: { portfolioId },
    });
    if (distinct.length >= 5) {
      await this.awardIfNew(userId, BadgeTrigger.DIVERSIFIED);
    }
    await this.quests.applyEvent(userId, QuestActionType.PORTFOLIO_DIVERSIFIED, distinct.length, {
      portfolioId,
    });
  }

  async checkQuizMaster(userId: string) {
    const passed = await this.prisma.quizAttempt.findMany({
      where: { userId, passed: true },
      distinct: ['quizId'],
      select: { quizId: true },
    });
    if (passed.length >= 5) {
      await this.awardIfNew(userId, BadgeTrigger.QUIZ_MASTER);
    }
  }

  async checkScholar(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user && user.articlesReadCount >= 10) {
      await this.awardIfNew(userId, BadgeTrigger.SCHOLAR);
    }
  }

  async awardLeagueChampion(userId: string) {
    await this.awardIfNew(userId, BadgeTrigger.LEAGUE_CHAMPION);
  }

  async awardTop3(userId: string) {
    await this.awardIfNew(userId, BadgeTrigger.TOP_3_FINISHER);
  }

  async awardParticipant(userId: string) {
    await this.awardIfNew(userId, BadgeTrigger.LEAGUE_PARTICIPANT);
  }

  async awardLeagueCreator(userId: string) {
    await this.awardIfNew(userId, BadgeTrigger.LEAGUE_CREATOR);
  }

  listForUser(userId: string) {
    return this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });
  }
}
