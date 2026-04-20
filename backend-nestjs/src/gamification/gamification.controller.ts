import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProgressionService } from './progression.service';
import { QuestsService } from './quests.service';
import { QuizzesService } from './quizzes.service';
import { NotificationsService } from './notifications.service';
import { BadgesService } from './badges.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('gamification')
export class GamificationController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progression: ProgressionService,
    private readonly questsService: QuestsService,
    private readonly quizzesService: QuizzesService,
    private readonly notifications: NotificationsService,
    private readonly badgesService: BadgesService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req: { user: { userId: string } }) {
    const userId = req.user.userId;
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        level: true,
        tier: true,
        totalXp: true,
        barleyBalance: true,
        articlesReadCount: true,
      },
    });
    const tierStatus = await this.progression.getTierStatus(userId);
    const cfg = await this.prisma.progressionConfig.findUnique({
      where: { id: 'default' },
    });
    const baseXp = cfg?.baseXp ?? 100;
    const exponent = cfg?.exponent ?? 1.2;
    const nextLevelCost = baseXp * Math.pow(user.level, exponent);
    const xpIntoLevel =
      user.totalXp -
      this.progression.totalXpForLevel(user.level, baseXp, exponent);
    return {
      user,
      tierStatus,
      nextLevelXpCost: Math.floor(nextLevelCost),
      xpIntoCurrentLevel: Math.max(0, Math.floor(xpIntoLevel)),
    };
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  async sync(@Request() req: { user: { userId: string } }) {
    await this.questsService.assignEligibleQuests(req.user.userId);
    return { ok: true };
  }

  @Get('quests')
  @UseGuards(JwtAuthGuard)
  listQuests(@Request() req: { user: { userId: string } }) {
    return this.questsService.listForUser(req.user.userId);
  }

  @Post('quests/:userQuestId/claim')
  @UseGuards(JwtAuthGuard)
  claim(
    @Request() req: { user: { userId: string } },
    @Param('userQuestId') userQuestId: string,
  ) {
    return this.questsService.claimQuest(req.user.userId, userQuestId);
  }

  @Get('quizzes')
  @UseGuards(JwtAuthGuard)
  listQuizzes() {
    return this.quizzesService.listQuizzes();
  }

  @Post('quizzes/:quizId/attempt')
  @UseGuards(JwtAuthGuard)
  attempt(
    @Request() req: { user: { userId: string } },
    @Param('quizId') quizId: string,
    @Body() body: { answers: number[] },
  ) {
    return this.quizzesService.submitAttempt(req.user.userId, quizId, {
      answers: body.answers,
    });
  }

  @Get('quiz-attempts')
  @UseGuards(JwtAuthGuard)
  quizAttempts(@Request() req: { user: { userId: string } }) {
    return this.quizzesService.attemptsForUser(req.user.userId);
  }

  /** Full catalog with earned/locked + summary (preferred for UI). */
  @Get('badges/catalog')
  @UseGuards(JwtAuthGuard)
  badgeCatalog(@Request() req: { user: { userId: string } }) {
    return this.badgesService.getCatalog(req.user.userId);
  }

  @Get('badges/unseen-count')
  @UseGuards(JwtAuthGuard)
  async badgeUnseenCount(@Request() req: { user: { userId: string } }) {
    const count = await this.badgesService.unseenCount(req.user.userId);
    return { count };
  }

  @Post('badges/acknowledge')
  @UseGuards(JwtAuthGuard)
  acknowledgeBadges(@Request() req: { user: { userId: string } }) {
    return this.badgesService.acknowledgeAll(req.user.userId);
  }

  @Get('badges')
  @UseGuards(JwtAuthGuard)
  listBadges(@Request() req: { user: { userId: string } }) {
    return this.badgesService.listForUser(req.user.userId);
  }

  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  notifs(@Request() req: { user: { userId: string } }) {
    return this.notifications.listForUser(req.user.userId);
  }

  @Patch('notifications/:id/read')
  @UseGuards(JwtAuthGuard)
  readNotif(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
  ) {
    return this.notifications.markRead(req.user.userId, id);
  }
}
