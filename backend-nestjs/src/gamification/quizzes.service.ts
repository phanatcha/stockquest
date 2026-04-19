import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { ProgressionService } from './progression.service';
import { GamificationEventsService } from './gamification-events.service';
import { NotificationsService } from './notifications.service';

export type SubmitAnswersDto = { answers: number[] };

@Injectable()
export class QuizzesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progression: ProgressionService,
    private readonly events: GamificationEventsService,
    private readonly notifications: NotificationsService,
  ) {}

  /** Questions omit correct answers (graded server-side on submit). */
  listQuizzes() {
    return this.prisma.quiz.findMany({
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            options: true,
            points: true,
          },
          orderBy: { id: 'asc' },
        },
      },
      orderBy: { tierUnlocked: 'asc' },
    });
  }

  async submitAttempt(userId: string, quizId: string, dto: SubmitAnswersDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { orderBy: { id: 'asc' } } },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.questions.length !== dto.answers.length) {
      throw new BadRequestException('Answer every question');
    }

    const passedBefore = await this.prisma.quizAttempt.findFirst({
      where: { userId, quizId, passed: true },
    });
    if (passedBefore) {
      throw new BadRequestException('Quiz already passed');
    }

    const lastFail = await this.prisma.quizAttempt.findFirst({
      where: { userId, quizId, passed: false },
      orderBy: { submittedAt: 'desc' },
    });
    if (lastFail) {
      const cooldownMs = quiz.cooldownMinutes * 60 * 1000;
      const eligibleAt = new Date(lastFail.submittedAt.getTime() + cooldownMs);
      if (new Date() < eligibleAt) {
        throw new BadRequestException(
          `Retry available after ${eligibleAt.toISOString()}`,
        );
      }
    }

    let earned = 0;
    let possible = 0;
    quiz.questions.forEach((q, i) => {
      possible += q.points;
      if (dto.answers[i] === q.correctIndex) earned += q.points;
    });
    const score = possible > 0 ? earned / possible : 0;
    const passed = score >= quiz.passScore;

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        passed,
      },
    });

    await this.notifications.create(
      userId,
      NotificationType.QUIZ_RESULT,
      passed
        ? `You passed "${quiz.title}" with ${(score * 100).toFixed(0)}%.`
        : `Quiz "${quiz.title}" scored ${(score * 100).toFixed(0)}%. Pass at ${(quiz.passScore * 100).toFixed(0)}%.`,
    );

    if (passed) {
      await this.events.onQuizPassed(userId, score);
      await this.progression.checkTierUpgrade(userId);
    }

    return { attempt, passed, score };
  }

  attemptsForUser(userId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      include: { quiz: { select: { title: true, id: true } } },
    });
  }
}
