import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { ProgressionService } from './progression.service';
import { GamificationEventsService } from './gamification-events.service';
import { NotificationsService } from './notifications.service';
import { LearningStreakService } from './learning-streak.service';

export type SubmitAnswersDto = { answers: number[] };

type QuestionBreakdown = {
  questionId: string;
  text: string;
  correctIndex: number;
  yourIndex: number;
  correct: boolean;
  explanation: string | null;
  pointsEarned: number;
  pointsPossible: number;
};

@Injectable()
export class QuizzesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progression: ProgressionService,
    private readonly events: GamificationEventsService,
    private readonly notifications: NotificationsService,
    private readonly streak: LearningStreakService,
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

  async listQuizzesWithUserState(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const quizzes = await this.listQuizzes();
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
    });
    const byQuiz = new Map<string, typeof attempts>();
    for (const a of attempts) {
      const arr = byQuiz.get(a.quizId) ?? [];
      arr.push(a);
      byQuiz.set(a.quizId, arr);
    }

    return quizzes.map((q) => {
      const list = byQuiz.get(q.id) ?? [];
      const best = list.length ? Math.max(...list.map((a) => a.score)) : null;
      const passed = list.some((a) => a.passed);
      const lastFail = list.find((a) => !a.passed);
      let cooldownUntil: string | null = null;
      if (lastFail && !passed) {
        const eligibleAt = new Date(
          lastFail.submittedAt.getTime() + q.cooldownMinutes * 60 * 1000,
        );
        if (new Date() < eligibleAt) cooldownUntil = eligibleAt.toISOString();
      }
      const locked = user.tier < q.tierRequirement;
      return {
        ...q,
        locked,
        bestScore: list.length ? best : null,
        passed,
        attemptCount: list.length,
        cooldownUntil,
      };
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

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.tier < quiz.tierRequirement) {
      throw new ForbiddenException('Your tier is too low for this quiz');
    }

    const hadPassedBefore = !!(await this.prisma.quizAttempt.findFirst({
      where: { userId, quizId, passed: true },
    }));

    if (quiz.isTierPrerequisite && hadPassedBefore) {
      throw new BadRequestException('Quiz already passed');
    }

    const lastAttempt = await this.prisma.quizAttempt.findFirst({
      where: { userId, quizId },
      orderBy: { submittedAt: 'desc' },
    });
    if (lastAttempt && !lastAttempt.passed) {
      const cooldownMs = quiz.cooldownMinutes * 60 * 1000;
      const eligibleAt = new Date(lastAttempt.submittedAt.getTime() + cooldownMs);
      if (new Date() < eligibleAt) {
        throw new BadRequestException(
          `Retry available after ${eligibleAt.toISOString()}`,
        );
      }
    }

    let earned = 0;
    let possible = 0;
    const breakdown: QuestionBreakdown[] = [];
    quiz.questions.forEach((q, i) => {
      possible += q.points;
      const ok = dto.answers[i] === q.correctIndex;
      if (ok) earned += q.points;
      breakdown.push({
        questionId: q.id,
        text: q.text,
        correctIndex: q.correctIndex,
        yourIndex: dto.answers[i],
        correct: ok,
        explanation: q.explanation ?? null,
        pointsEarned: ok ? q.points : 0,
        pointsPossible: q.points,
      });
    });
    const score = possible > 0 ? earned / possible : 0;
    const passed = score >= quiz.passScore;

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        passed,
        answers: dto.answers,
      },
    });

    await this.notifications.create(
      userId,
      NotificationType.QUIZ_RESULT,
      passed
        ? `You passed "${quiz.title}" with ${(score * 100).toFixed(0)}%.`
        : `Quiz "${quiz.title}" scored ${(score * 100).toFixed(0)}%. Pass at ${(quiz.passScore * 100).toFixed(0)}%.`,
    );

    let xpEarned = 0;
    let barleyEarned = 0;
    let streak: { currentStreak: number; longestStreak: number; milestoneXpAwarded: number } | null =
      null;

    if (passed && !hadPassedBefore) {
      const baseXp = quiz.isTierPrerequisite ? 100 : 50;
      const baseBarley = quiz.isTierPrerequisite ? 50 : 25;
      xpEarned = baseXp;
      barleyEarned = baseBarley;
      const perfect = score >= 1 - 1e-9;
      if (perfect) {
        xpEarned += 50;
      }

      await this.progression.grantBarley(userId, barleyEarned);
      if (xpEarned > 0) {
        await this.progression.grantXp(userId, xpEarned);
      }

      await this.events.onQuizPassed(userId, score);
      streak = await this.streak.recordArticleOrQuizActivity(userId);
    }

    return {
      attempt: {
        id: attempt.id,
        score,
        passed,
        submittedAt: attempt.submittedAt,
      },
      breakdown,
      xpEarned,
      barleyEarned,
      streak,
      firstPassRewards: passed && !hadPassedBefore,
    };
  }

  attemptsForUser(userId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      include: { quiz: { select: { title: true, id: true } } },
    });
  }
}
