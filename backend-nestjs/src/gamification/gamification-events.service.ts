import { Injectable } from '@nestjs/common';
import { QuestActionType } from '@prisma/client';
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

  async onTradeExecuted(userId: string, portfolioId: string) {
    await this.quests.applyEvent(userId, QuestActionType.TRADE_EXECUTED, 1);
    await this.badges.checkFirstTrade(userId);
    await this.badges.checkDiversified(userId, portfolioId);
  }

  async onLeagueJoined(userId: string) {
    await this.quests.applyEvent(userId, QuestActionType.LEAGUE_JOINED, 1);
  }

  async onLeagueCreated(userId: string) {
    await this.quests.applyEvent(userId, QuestActionType.LEAGUE_CREATED, 1);
    await this.badges.awardLeagueCreator(userId);
  }

  async onLeagueFinishedTop3(userId: string) {
    await this.quests.applyEvent(userId, QuestActionType.LEAGUE_FINISHED_TOP3, 1);
  }

  async onQuizPassed(userId: string) {
    await this.quests.applyEvent(userId, QuestActionType.QUIZ_PASSED, 1);
    await this.badges.checkQuizMaster(userId);
  }

  async onArticleRead(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { articlesReadCount: { increment: 1 } },
    });
    await this.quests.applyEvent(userId, QuestActionType.ARTICLE_READ, 1);
    await this.badges.checkScholar(userId);
  }
}
