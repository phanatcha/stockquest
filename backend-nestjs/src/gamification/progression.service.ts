import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeTriggerEvent, NotificationType } from '@prisma/client';
import { QuestsService } from './quests.service';
import { BadgesService } from './badges.service';

@Injectable()
export class ProgressionService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => QuestsService))
    private readonly questsService: QuestsService,
    @Inject(forwardRef(() => BadgesService))
    private readonly badgesService: BadgesService,
  ) {}

  private async getConfig() {
    let cfg = await this.prisma.progressionConfig.findUnique({
      where: { id: 'default' },
    });
    if (!cfg) {
      cfg = await this.prisma.progressionConfig.create({
        data: { id: 'default', baseXp: 100, exponent: 1.2 },
      });
    }
    return cfg;
  }

  /** Total XP required to reach `level` (minimum XP at that level). Level 1 => 0. */
  totalXpForLevel(level: number, baseXp: number, exponent: number): number {
    if (level <= 1) return 0;
    let sum = 0;
    for (let k = 1; k < level; k++) {
      sum += baseXp * Math.pow(k, exponent);
    }
    return Math.floor(sum);
  }

  computeLevelFromTotalXp(
    totalXp: number,
    baseXp: number,
    exponent: number,
  ): number {
    let level = 1;
    let acc = 0;
    while (true) {
      const nextCost = baseXp * Math.pow(level, exponent);
      if (totalXp < acc + nextCost) break;
      acc += nextCost;
      level++;
    }
    return level;
  }

  async grantXp(
    userId: string,
    amount: number,
  ): Promise<{ newLevel: number; leveledUp: boolean; totalXp: number }> {
    const cfg = await this.getConfig();
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const oldLevel = user.level;
    const totalXp = user.totalXp + amount;
    const newLevel = this.computeLevelFromTotalXp(
      totalXp,
      cfg.baseXp,
      cfg.exponent,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { totalXp, level: newLevel },
    });

    await this.checkTierUpgrade(userId);

    return {
      newLevel,
      leveledUp: newLevel > oldLevel,
      totalXp,
    };
  }

  async grantBarley(userId: string, amount: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { barleyBalance: { increment: amount } },
    });
  }

  async hasPassedQuiz(userId: string, quizId: string): Promise<boolean> {
    const attempt = await this.prisma.quizAttempt.findFirst({
      where: { userId, quizId, passed: true },
    });
    return !!attempt;
  }

  /**
   * If user can move to the next tier, updates tier and notifies.
   * Returns pending gate if upgrade not applied.
   */
  async checkTierUpgrade(userId: string): Promise<{
    upgraded: boolean;
    newTier?: number;
    pending?: 'xp' | 'quiz';
  }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const nextTier = user.tier + 1;
    const tierCfg = await this.prisma.tierConfig.findUnique({
      where: { tier: nextTier },
    });
    if (!tierCfg) {
      return { upgraded: false };
    }

    const levelOk = user.level >= tierCfg.minLevel;
    let quizOk = true;
    if (tierCfg.prerequisiteQuizId) {
      quizOk = await this.hasPassedQuiz(userId, tierCfg.prerequisiteQuizId);
    }

    if (levelOk && quizOk) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { tier: nextTier },
      });
      await this.prisma.notification.create({
        data: {
          userId,
          type: NotificationType.TIER_UPGRADE,
          message: `You reached ${tierCfg.name} (Tier ${nextTier}). New features unlocked.`,
        },
      });
      await this.questsService.assignEligibleQuests(userId);
      await this.badgesService.checkAndAwardBadge(
        userId,
        BadgeTriggerEvent.TIER_UPGRADED,
        {
          upgraded: true,
          newTier: nextTier,
          previousTier: user.tier,
        },
      );
      return { upgraded: true, newTier: nextTier };
    }

    if (!levelOk && !quizOk) {
      return { upgraded: false, pending: 'xp' };
    }
    if (!levelOk) return { upgraded: false, pending: 'xp' };
    return { upgraded: false, pending: 'quiz' };
  }

  async getTierStatus(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const nextTier = user.tier + 1;
    const tierCfg = await this.prisma.tierConfig.findUnique({
      where: { tier: nextTier },
    });
    if (!tierCfg) {
      return {
        tier: user.tier,
        nextTier: null,
        nextTierName: undefined as string | undefined,
        minLevelForNextTier: undefined as number | undefined,
        prerequisiteQuizId: null as string | null,
        levelOk: true,
        quizOk: true,
        pending: null as 'xp' | 'quiz' | null,
      };
    }
    const levelOk = user.level >= tierCfg.minLevel;
    let quizOk = true;
    if (tierCfg.prerequisiteQuizId) {
      quizOk = await this.hasPassedQuiz(userId, tierCfg.prerequisiteQuizId);
    }
    let pending: 'xp' | 'quiz' | null = null;
    if (!levelOk || !quizOk) {
      if (!levelOk && !quizOk) pending = 'xp';
      else if (!levelOk) pending = 'xp';
      else pending = 'quiz';
    }
    return {
      tier: user.tier,
      nextTier: nextTier,
      nextTierName: tierCfg.name,
      minLevelForNextTier: tierCfg.minLevel,
      prerequisiteQuizId: tierCfg.prerequisiteQuizId,
      levelOk,
      quizOk,
      pending,
    };
  }
}
