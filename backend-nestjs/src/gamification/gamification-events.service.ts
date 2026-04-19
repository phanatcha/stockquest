import { Injectable } from '@nestjs/common';
import { BadgeTriggerEvent, QuestActionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QuestsService } from './quests.service';
import { BadgesService } from './badges.service';

@Injectable()
export class GamificationEventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quests: QuestsService,
    private readonly badges: BadgesService,
  ) {}

  async onTradeExecuted(
    userId: string,
    portfolioId: string,
    meta: { orderType: 'BUY' | 'SELL'; symbol: string; sellAt: Date },
  ) {
    await this.quests.applyEvent(userId, QuestActionType.TRADE_EXECUTED, 1);

    const distinct = await this.prisma.holding.groupBy({
      by: ['symbol'],
      where: { portfolioId },
    });
    await this.quests.applyEvent(userId, QuestActionType.PORTFOLIO_DIVERSIFIED, distinct.length, {
      portfolioId,
    });

    await this.badges.checkAndAwardBadge(userId, BadgeTriggerEvent.TRADE_EXECUTED, {
      portfolioId,
      orderType: meta.orderType,
      symbol: meta.symbol,
      sellAt: meta.orderType === 'SELL' ? meta.sellAt : undefined,
    });
  }

  async onLeagueJoined(userId: string) {
    await this.quests.applyEvent(userId, QuestActionType.LEAGUE_JOINED, 1);
  }

  async onLeagueCreated(userId: string) {
    await this.quests.applyEvent(userId, QuestActionType.LEAGUE_CREATED, 1);
    await this.badges.checkAndAwardBadge(userId, BadgeTriggerEvent.LEAGUE_CREATED, {});
  }

  async onLeagueFinishedTop3(userId: string) {
    await this.quests.applyEvent(userId, QuestActionType.LEAGUE_FINISHED_TOP3, 1);
  }

  async onQuizPassed(userId: string, score: number) {
    await this.quests.applyEvent(userId, QuestActionType.QUIZ_PASSED, 1);
    await this.badges.checkAndAwardBadge(userId, BadgeTriggerEvent.QUIZ_PASSED, { score });
  }

  async onArticleRead(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { articlesReadCount: { increment: 1 } },
    });
    await this.quests.applyEvent(userId, QuestActionType.ARTICLE_READ, 1);
    await this.badges.checkAndAwardBadge(userId, BadgeTriggerEvent.ARTICLE_READ, {});
  }
}
