import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  BadgeTriggerEvent,
  LeagueStatus,
  NotificationType,
  OrderType,
  QuestActionType,
  BadgeRarity,
  UserQuestStatus,
  SnapshotType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QuestsService } from './quests.service';
import { NotificationsService } from './notifications.service';

/** Context passed from callers; shape depends on `event`. */
export type BadgeEventContext = Record<string, unknown>;

@Injectable()
export class BadgesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => QuestsService))
    private readonly quests: QuestsService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Central entry: load badges for this trigger, evaluate threshold per badge code, award once.
   * BADGE_EARNED is not used here (quests only).
   */
  async checkAndAwardBadge(
    userId: string,
    event: BadgeTriggerEvent,
    context: BadgeEventContext = {},
  ): Promise<string[]> {
    const awardedCodes: string[] = [];
    const badges = await this.prisma.badge.findMany({
      where: { triggerEvent: event },
    });

    for (const badge of badges) {
      const has = await this.prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
      });
      if (has) continue;

      const ok = await this.evaluateBadge(badge.code, userId, event, context);
      if (!ok) continue;

      await this.prisma.userBadge.create({
        data: { userId, badgeId: badge.id, seen: false },
      });
      awardedCodes.push(badge.code);

      await this.notifications.create(
        userId,
        NotificationType.BADGE_EARNED,
        `Badge earned: ${badge.name}`,
      );

      await this.quests.applyEvent(userId, QuestActionType.BADGE_EARNED, 1);
    }

    return awardedCodes;
  }

  private async evaluateBadge(
    code: string,
    userId: string,
    _event: BadgeTriggerEvent,
    ctx: BadgeEventContext,
  ): Promise<boolean> {
    switch (code) {
      case 'first_trade': {
        const n = await this.prisma.order.count({
          where: { portfolio: { userId } },
        });
        return n >= 1;
      }
      case 'high_roller': {
        const n = await this.prisma.order.count({
          where: { portfolio: { userId } },
        });
        return n >= 50;
      }
      case 'diversified': {
        const pid = ctx.portfolioId as string | undefined;
        if (!pid) return false;
        const distinct = await this.prisma.holding.groupBy({
          by: ['symbol'],
          where: { portfolioId: pid },
        });
        return distinct.length >= 5;
      }
      case 'whale': {
        const pid = ctx.portfolioId as string | undefined;
        if (!pid) return false;
        const distinct = await this.prisma.holding.groupBy({
          by: ['symbol'],
          where: { portfolioId: pid },
        });
        return distinct.length >= 10;
      }
      case 'quick_flip': {
        if (ctx.orderType !== 'SELL') return false;
        const pid = ctx.portfolioId as string | undefined;
        const symbol = ctx.symbol as string | undefined;
        const sellAt = ctx.sellAt as Date | undefined;
        if (!pid || !symbol || !sellAt) return false;
        const buy = await this.prisma.order.findFirst({
          where: {
            portfolioId: pid,
            symbol,
            type: OrderType.BUY,
            createdAt: { lt: sellAt },
          },
          orderBy: { createdAt: 'desc' },
        });
        if (!buy) return false;
        const ms = sellAt.getTime() - buy.createdAt.getTime();
        return ms >= 0 && ms <= 24 * 60 * 60 * 1000;
      }
      case 'league_creator':
        return true;
      case 'league_participant': {
        const rank = ctx.finalRank as number | undefined;
        return typeof rank === 'number' && rank >= 1;
      }
      case 'top_3_finisher': {
        const rank = ctx.finalRank as number | undefined;
        return typeof rank === 'number' && rank >= 1 && rank <= 3;
      }
      case 'league_champion': {
        const rank = ctx.finalRank as number | undefined;
        return rank === 1;
      }
      case 'undefeated':
        return this.checkUndefeated(userId);
      case 'bull_run': {
        const start = ctx.startingCash as number | undefined;
        const val = ctx.finalPortfolioValue as number | undefined;
        if (start == null || val == null || start <= 0) return false;
        return (val - start) / start >= 0.2;
      }
      case 'comeback_kid':
        return this.checkComebackKid(
          ctx.leagueId as string,
          ctx.portfolioId as string,
          ctx.finalRank as number,
        );
      case 'first_step': {
        const claimed = await this.prisma.userQuest.count({
          where: { userId, status: UserQuestStatus.CLAIMED },
        });
        return claimed >= 1;
      }
      case 'quest_hunter': {
        const claimed = await this.prisma.userQuest.count({
          where: { userId, status: UserQuestStatus.CLAIMED },
        });
        return claimed >= 10;
      }
      case 'scholar': {
        const u = await this.prisma.user.findUnique({ where: { id: userId } });
        return (u?.articlesReadCount ?? 0) >= 10;
      }
      case 'quiz_passed': {
        const passedQuizzes = await this.prisma.quizAttempt.findMany({
          where: { userId, passed: true },
          distinct: ['quizId'],
          select: { quizId: true },
        });
        return passedQuizzes.length >= 1;
      }
      case 'quiz_master': {
        const passedQuizzes = await this.prisma.quizAttempt.findMany({
          where: { userId, passed: true },
          distinct: ['quizId'],
          select: { quizId: true },
        });
        return passedQuizzes.length >= 5;
      }
      case 'perfect_score': {
        const score = ctx.score as number | undefined;
        return score != null && score >= 1 - 1e-9;
      }
      case 'tier_up': {
        return ctx.upgraded === true;
      }
      case 'elite_trader': {
        const newTier = ctx.newTier as number | undefined;
        if (newTier == null) return false;
        const maxRow = await this.prisma.tierConfig.findFirst({
          orderBy: { tier: 'desc' },
        });
        if (!maxRow) return false;
        return newTier >= maxRow.tier;
      }
      default:
        return false;
    }
  }

  private async checkUndefeated(userId: string): Promise<boolean> {
    const rows = await this.prisma.portfolio.findMany({
      where: {
        userId,
        finalRank: { not: null },
        league: { status: LeagueStatus.COMPLETED },
      },
      include: { league: true },
      orderBy: { league: { endDate: 'desc' } },
      take: 3,
    });
    if (rows.length < 3) return false;
    return rows.every((r) => r.finalRank === 1);
  }

  private async checkComebackKid(
    leagueId: string | undefined,
    portfolioId: string | undefined,
    finalRank: number | undefined,
  ): Promise<boolean> {
    if (!leagueId || !portfolioId || finalRank !== 1) return false;
    const snap = await this.prisma.leagueSnapshot.findFirst({
      where: { leagueId, snapshotType: SnapshotType.MIDPOINT },
      include: { entries: true },
    });
    if (!snap?.entries.length) return false;
    const maxRank = Math.max(...snap.entries.map((e) => e.rank));
    const mine = snap.entries.find((e) => e.portfolioId === portfolioId);
    if (!mine) return false;
    return mine.rank === maxRank;
  }

  async getCatalog(userId: string) {
    const badges = await this.prisma.badge.findMany({
      orderBy: [{ rarity: 'asc' }, { name: 'asc' }],
    });
    const earned = await this.prisma.userBadge.findMany({
      where: { userId },
    });
    const earnedByBadge = new Map(earned.map((e) => [e.badgeId, e]));

    const items = badges.map((b) => {
      const u = earnedByBadge.get(b.id);
      return {
        ...b,
        earnedAt: u?.earnedAt?.toISOString() ?? null,
        seen: u?.seen ?? null,
      };
    });

    const totalPossible = badges.length;
    const totalEarned = earned.length;
    const unseenCount = earned.filter((e) => !e.seen).length;

    const byCategory = {
      ACTION_STRATEGY: { earned: 0, total: 0 },
      COMMUNITY_LEARNING: { earned: 0, total: 0 },
    };
    const byRarity: Record<BadgeRarity, { earned: number; total: number }> = {
      COMMON: { earned: 0, total: 0 },
      RARE: { earned: 0, total: 0 },
      EPIC: { earned: 0, total: 0 },
      LEGENDARY: { earned: 0, total: 0 },
    };

    for (const b of badges) {
      byCategory[b.category].total++;
      byRarity[b.rarity].total++;
      if (earnedByBadge.has(b.id)) {
        byCategory[b.category].earned++;
        byRarity[b.rarity].earned++;
      }
    }

    return {
      items,
      summary: {
        totalEarned,
        totalPossible,
        unseenCount,
        byCategory,
        byRarity,
      },
    };
  }

  async acknowledgeAll(userId: string) {
    await this.prisma.userBadge.updateMany({
      where: { userId, seen: false },
      data: { seen: true },
    });
    return { ok: true };
  }

  async unseenCount(userId: string) {
    return this.prisma.userBadge.count({
      where: { userId, seen: false },
    });
  }

  /** @deprecated use getCatalog */
  listForUser(userId: string) {
    return this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });
  }
}
