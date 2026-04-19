import {
  forwardRef,
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadgeTriggerEvent,
  NotificationType,
  QuestActionType,
  UserQuestStatus,
} from '@prisma/client';
import { ProgressionService } from './progression.service';
import { NotificationsService } from './notifications.service';
import { BadgesService } from './badges.service';

@Injectable()
export class QuestsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ProgressionService))
    private readonly progression: ProgressionService,
    private readonly notifications: NotificationsService,
    @Inject(forwardRef(() => BadgesService))
    private readonly badges: BadgesService,
  ) {}

  async assignEligibleQuests(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const quests = await this.prisma.quest.findMany({
      where: {
        OR: [{ expiry: null }, { expiry: { gt: new Date() } }],
        tierRequirement: { lte: user.tier },
      },
    });

    for (const q of quests) {
      const existing = await this.prisma.userQuest.findFirst({
        where: { userId, questId: q.id },
      });

      if (existing) {
        if (
          existing.status === UserQuestStatus.ACTIVE ||
          existing.status === UserQuestStatus.COMPLETED
        ) {
          continue;
        }
        if (existing.status === UserQuestStatus.CLAIMED) {
          if (q.repeatable) {
            await this.prisma.userQuest.update({
              where: { id: existing.id },
              data: {
                progress: 0,
                status: UserQuestStatus.ACTIVE,
                claimedAt: null,
              },
            });
          }
          continue;
        }
        continue;
      }

      await this.prisma.userQuest.create({
        data: { userId, questId: q.id, progress: 0, status: UserQuestStatus.ACTIVE },
      });
    }
  }

  async applyEvent(userId: string, action: QuestActionType, delta: number, meta?: { portfolioId?: string }) {
    const userQuests = await this.prisma.userQuest.findMany({
      where: {
        userId,
        status: UserQuestStatus.ACTIVE,
        quest: { actionType: action },
      },
      include: { quest: true },
    });

    for (const uq of userQuests) {
      let progress: number;
      if (action === QuestActionType.PORTFOLIO_DIVERSIFIED && meta?.portfolioId) {
        const distinct = await this.prisma.holding.groupBy({
          by: ['symbol'],
          where: { portfolioId: meta.portfolioId },
        });
        progress = distinct.length;
      } else {
        progress = uq.progress + delta;
      }

      const complete = progress >= uq.quest.targetValue;
      await this.prisma.userQuest.update({
        where: { id: uq.id },
        data: {
          progress,
          status: complete ? UserQuestStatus.COMPLETED : UserQuestStatus.ACTIVE,
        },
      });

      if (complete) {
        if (uq.quest.autoClaim) {
          await this.claimQuest(userId, uq.id);
        } else {
          await this.notifications.create(
            userId,
            NotificationType.QUEST_COMPLETED,
            `Quest completed: ${uq.quest.title}. Claim your rewards.`,
          );
        }
      }
    }
  }

  listForUser(userId: string) {
    return this.prisma.userQuest.findMany({
      where: { userId },
      include: { quest: true },
      orderBy: { quest: { title: 'asc' } },
    });
  }

  async claimQuest(userId: string, userQuestId: string) {
    const uq = await this.prisma.userQuest.findFirst({
      where: { id: userQuestId, userId },
      include: { quest: true },
    });
    if (!uq) throw new NotFoundException('Quest progress not found');
    if (uq.status !== UserQuestStatus.COMPLETED) {
      throw new BadRequestException('Quest is not ready to claim');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.userQuest.update({
        where: { id: userQuestId },
        data: { status: UserQuestStatus.CLAIMED, claimedAt: new Date() },
      });
      await tx.user.update({
        where: { id: userId },
        data: { barleyBalance: { increment: uq.quest.barleyReward } },
      });
    });

    await this.progression.grantXp(userId, uq.quest.xpReward);
    await this.progression.checkTierUpgrade(userId);

    if (uq.quest.repeatable) {
      await this.prisma.userQuest.update({
        where: { id: uq.id },
        data: {
          progress: 0,
          status: UserQuestStatus.ACTIVE,
          claimedAt: null,
        },
      });
    }

    await this.badges.checkAndAwardBadge(userId, BadgeTriggerEvent.QUEST_COMPLETED, {});

    return { ok: true, xp: uq.quest.xpReward, barley: uq.quest.barleyReward };
  }
}
