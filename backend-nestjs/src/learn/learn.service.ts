import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ArticleCategory,
  Prisma,
  UserArticleStatus,
  UserCourseStatus,
  CourseLessonType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressionService } from '../gamification/progression.service';
import { GamificationEventsService } from '../gamification/gamification-events.service';
import { LearningStreakService } from '../gamification/learning-streak.service';

const ARTICLE_XP = 20;
const ARTICLE_BARLEY = 10;

@Injectable()
export class LearnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progression: ProgressionService,
    private readonly events: GamificationEventsService,
    private readonly streak: LearningStreakService,
  ) {}

  private async ensureLearnConfig() {
    await this.prisma.learnConfig.upsert({
      where: { id: 'default' },
      create: { id: 'default', articleMinReadFraction: 0.6 },
      update: {},
    });
  }

  async getHome(userId: string) {
    await this.ensureLearnConfig();
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const tierStatus = await this.progression.getTierStatus(userId);
    const streak = await this.streak.getForUser(userId);

    const articlesRead = await this.prisma.userArticle.count({
      where: { userId, status: UserArticleStatus.COMPLETED },
    });
    const coursesDone = await this.prisma.userCourse.count({
      where: { userId, status: UserCourseStatus.COMPLETED },
    });
    const quizzesPassed = await this.prisma.quizAttempt.groupBy({
      by: ['quizId'],
      where: { userId, passed: true },
    });

    const inProgressArticles = await this.prisma.userArticle.findMany({
      where: { userId, status: UserArticleStatus.IN_PROGRESS },
      orderBy: { lastAccessed: 'desc' },
      take: 1,
      include: { article: true },
    });
    const inProgressCourses = await this.prisma.userCourse.findMany({
      where: { userId, status: UserCourseStatus.IN_PROGRESS },
      orderBy: { lastAccessed: 'desc' },
      take: 1,
      include: {
        course: {
          include: {
            lessons: { orderBy: { orderIndex: 'asc' } },
          },
        },
      },
    });

    let continueItem: {
      type: 'article' | 'course';
      id: string;
      title: string;
      progressPct: number;
    } | null = null;

    const a = inProgressArticles[0];
    const c = inProgressCourses[0];
    const pickArticle = a && (!c || a.lastAccessed >= c.lastAccessed);
    if (pickArticle && a) {
      continueItem = {
        type: 'article',
        id: a.articleId,
        title: a.article.title,
        progressPct: 35,
      };
    } else if (c) {
      const total = c.course.lessons.length || 1;
      const done = c.completedLessonIds.length;
      continueItem = {
        type: 'course',
        id: c.courseId,
        title: c.course.title,
        progressPct: Math.round((done / total) * 100),
      };
    }

    const featured = await this.prisma.article.findMany({
      where: { isFeatured: true },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    });

    const unreadArticles = await this.prisma.article.findMany({
      where: {
        tierRequirement: { lte: user.tier },
        OR: [
          { userArticles: { none: { userId } } },
          {
            userArticles: {
              some: { userId, status: { not: UserArticleStatus.COMPLETED } },
            },
          },
        ],
      },
      take: 8,
      orderBy: { publishedAt: 'desc' },
    });

    const notStartedCourses = await this.prisma.course.findMany({
      where: {
        tierRequirement: { lte: user.tier },
        OR: [
          { userCourses: { none: { userId } } },
          {
            userCourses: {
              some: { userId, status: UserCourseStatus.NOT_STARTED },
            },
          },
        ],
      },
      take: 8,
      orderBy: { publishedAt: 'desc' },
    });

    const recommended: Array<{
      kind: 'article' | 'course';
      id: string;
      title: string;
      subtitle: string;
    }> = [];
    for (const art of unreadArticles) {
      if (recommended.length >= 6) break;
      recommended.push({
        kind: 'article',
        id: art.id,
        title: art.title,
        subtitle: `${art.readTimeMinutes} min read`,
      });
    }
    for (const co of notStartedCourses) {
      if (recommended.length >= 6) break;
      recommended.push({
        kind: 'course',
        id: co.id,
        title: co.title,
        subtitle: `${co.estimatedMinutes} min`,
      });
    }

    const recentArticles = await this.prisma.article.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 4,
    });
    const recentCourses = await this.prisma.course.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 4,
    });
    const recent = [
      ...recentArticles.map((x) => ({ kind: 'article' as const, ...x })),
      ...recentCourses.map((x) => ({ kind: 'course' as const, ...x })),
    ]
      .sort((u, v) => v.publishedAt.getTime() - u.publishedAt.getTime())
      .slice(0, 4);

    return {
      user: { tier: user.tier, level: user.level },
      tierStatus,
      streak,
      stats: {
        articlesRead,
        coursesCompleted: coursesDone,
        quizzesPassed: quizzesPassed.length,
      },
      continueItem,
      featured,
      recommended,
      recent,
    };
  }

  async listArticles(
    userId: string,
    q: {
      search?: string;
      category?: ArticleCategory;
      tier?: number;
      status?: 'UNREAD' | 'IN_PROGRESS' | 'COMPLETED';
      sort?: string;
    },
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const where: Prisma.ArticleWhereInput = {};
    if (q.search) {
      where.OR = [
        { title: { contains: q.search, mode: 'insensitive' } },
        { tags: { has: q.search } },
      ];
    }
    if (q.category) where.category = q.category;
    if (q.tier != null) where.tierRequirement = q.tier;

    let orderBy: Prisma.ArticleOrderByWithRelationInput = {
      publishedAt: 'desc',
    };
    if (q.sort === 'oldest') orderBy = { publishedAt: 'asc' };
    else if (q.sort === 'shortest') orderBy = { readTimeMinutes: 'asc' };
    else if (q.sort === 'longest') orderBy = { readTimeMinutes: 'desc' };

    const articles = await this.prisma.article.findMany({ where, orderBy });
    const ua = await this.prisma.userArticle.findMany({ where: { userId } });
    const uaMap = new Map(ua.map((r) => [r.articleId, r]));

    let rows = articles.map((a) => ({
      ...a,
      locked: user.tier < a.tierRequirement,
      userStatus: uaMap.get(a.id)?.status ?? UserArticleStatus.UNREAD,
      startedAt: uaMap.get(a.id)?.startedAt ?? null,
      completedAt: uaMap.get(a.id)?.completedAt ?? null,
    }));

    if (q.status) {
      rows = rows.filter((r) => r.userStatus === q.status);
    }

    return rows;
  }

  async getArticle(userId: string, articleId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });
    if (!article) throw new NotFoundException('Article not found');
    const locked = user.tier < article.tierRequirement;
    if (locked) {
      return {
        locked: true,
        tierRequirement: article.tierRequirement,
        title: article.title,
      };
    }
    let ua = await this.prisma.userArticle.findUnique({
      where: { userId_articleId: { userId, articleId } },
    });
    if (!ua) {
      ua = await this.prisma.userArticle.create({
        data: {
          userId,
          articleId,
          status: UserArticleStatus.UNREAD,
        },
      });
    }
    await this.prisma.userArticle.update({
      where: { id: ua.id },
      data: { lastAccessed: new Date() },
    });
    return { locked: false, article, userArticle: ua };
  }

  async startArticle(userId: string, articleId: string) {
    const r = await this.getArticle(userId, articleId);
    if (r.locked) throw new ForbiddenException('Tier locked');
    const ua = r.userArticle!;
    if (ua.status === UserArticleStatus.COMPLETED) return ua;
    return this.prisma.userArticle.update({
      where: { id: ua.id },
      data: {
        status: UserArticleStatus.IN_PROGRESS,
        startedAt: ua.startedAt ?? new Date(),
        lastAccessed: new Date(),
      },
    });
  }

  async completeArticle(
    userId: string,
    articleId: string,
    body: { secondsOnPage: number; scrollReachedBottom: boolean },
  ) {
    await this.ensureLearnConfig();
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });
    if (!article) throw new NotFoundException('Article not found');
    if (user.tier < article.tierRequirement) {
      throw new ForbiddenException('Tier locked');
    }

    const cfg = await this.prisma.learnConfig.findUnique({
      where: { id: 'default' },
    });
    const frac = cfg?.articleMinReadFraction ?? 0.6;
    const minSeconds = Math.ceil(article.readTimeMinutes * 60 * frac);
    const timeOk = body.secondsOnPage >= minSeconds;
    const scrollOk = body.scrollReachedBottom === true;
    if (!timeOk && !scrollOk) {
      throw new BadRequestException(
        `Read more of the article or scroll to the end (about ${Math.ceil(minSeconds / 60)} min at normal pace).`,
      );
    }
    if (body.secondsOnPage < 3 && !scrollOk) {
      throw new BadRequestException('Take your time reading the article.');
    }

    let ua = await this.prisma.userArticle.findUnique({
      where: { userId_articleId: { userId, articleId } },
    });
    if (!ua) {
      ua = await this.prisma.userArticle.create({
        data: { userId, articleId, status: UserArticleStatus.IN_PROGRESS },
      });
    }
    if (ua.status === UserArticleStatus.COMPLETED) {
      return {
        alreadyCompleted: true,
        xpEarned: 0,
        barleyEarned: 0,
        streak: await this.streak.getForUser(userId),
      };
    }

    await this.prisma.userArticle.update({
      where: { id: ua.id },
      data: {
        status: UserArticleStatus.COMPLETED,
        completedAt: new Date(),
        lastAccessed: new Date(),
      },
    });

    await this.progression.grantBarley(userId, ARTICLE_BARLEY);
    await this.progression.grantXp(userId, ARTICLE_XP);
    await this.events.onArticleCompletedFirstTime(userId);
    const streak = await this.streak.recordArticleOrQuizActivity(userId);

    return {
      alreadyCompleted: false,
      xpEarned: ARTICLE_XP,
      barleyEarned: ARTICLE_BARLEY,
      streak,
    };
  }

  async relatedArticles(userId: string, articleId: string, take = 4) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const art = await this.prisma.article.findUnique({
      where: { id: articleId },
    });
    if (!art) throw new NotFoundException('Article not found');
    const completed = await this.prisma.userArticle.findMany({
      where: { userId, status: UserArticleStatus.COMPLETED },
      select: { articleId: true },
    });
    const notIn = [...completed.map((c) => c.articleId), articleId];
    return this.prisma.article.findMany({
      where: {
        category: art.category,
        id: { notIn },
        tierRequirement: { lte: user.tier },
      },
      take,
      orderBy: { publishedAt: 'desc' },
    });
  }

  async listCourses(
    userId: string,
    q: { category?: ArticleCategory; status?: string; tier?: number },
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const where: Prisma.CourseWhereInput = {};
    if (q.category) where.category = q.category;
    if (q.tier != null) where.tierRequirement = q.tier;

    const courses = await this.prisma.course.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      include: {
        lessons: { select: { id: true } },
        userCourses: { where: { userId } },
      },
    });

    const rows: Array<{
      id: string;
      title: string;
      description: string;
      category: ArticleCategory;
      thumbnailKey: string;
      tierRequirement: number;
      xpReward: number;
      barleyReward: number;
      estimatedMinutes: number;
      publishedAt: Date;
      lessonCount: number;
      locked: boolean;
      status: UserCourseStatus;
      progressPct: number;
      completed: boolean;
    }> = [];

    for (const c of courses) {
      const uc = c.userCourses[0];
      const locked = user.tier < c.tierRequirement;
      const total = c.lessons.length;
      const done = uc?.completedLessonIds.length ?? 0;
      const pct = total ? Math.round((done / total) * 100) : 0;
      const st = uc?.status ?? UserCourseStatus.NOT_STARTED;
      if (q.status === 'NOT_STARTED' && st !== UserCourseStatus.NOT_STARTED)
        continue;
      if (q.status === 'IN_PROGRESS' && st !== UserCourseStatus.IN_PROGRESS)
        continue;
      if (q.status === 'COMPLETED' && st !== UserCourseStatus.COMPLETED)
        continue;
      rows.push({
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        thumbnailKey: c.thumbnailKey,
        tierRequirement: c.tierRequirement,
        xpReward: c.xpReward,
        barleyReward: c.barleyReward,
        estimatedMinutes: c.estimatedMinutes,
        publishedAt: c.publishedAt,
        lessonCount: total,
        locked,
        status: st,
        progressPct: pct,
        completed: st === UserCourseStatus.COMPLETED,
      });
    }
    return rows;
  }

  async getCourse(userId: string, courseId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { lessons: { orderBy: { orderIndex: 'asc' } } },
    });
    if (!course) throw new NotFoundException('Course not found');
    const locked = user.tier < course.tierRequirement;
    let uc = await this.prisma.userCourse.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!locked && !uc) {
      uc = await this.prisma.userCourse.create({
        data: {
          userId,
          courseId,
          status: UserCourseStatus.NOT_STARTED,
          completedLessonIds: [],
        },
      });
    }
    if (uc) {
      await this.prisma.userCourse.update({
        where: { id: uc.id },
        data: { lastAccessed: new Date() },
      });
    }

    const lessons = [] as Array<{
      id: string;
      orderIndex: number;
      lessonType: CourseLessonType;
      referenceId: string;
      title: string;
      done: boolean;
      locked: boolean;
    }>;

    for (let i = 0; i < course.lessons.length; i++) {
      const L = course.lessons[i];
      const prev = course.lessons.slice(0, i);
      let prevOk = true;
      for (const p of prev) {
        if (!uc?.completedLessonIds.includes(p.id)) {
          const satisfied = await this.lessonSatisfied(userId, p);
          if (!satisfied) prevOk = false;
        }
      }
      const done = uc?.completedLessonIds.includes(L.id) ?? false;
      const lockedLesson = i > 0 && !prevOk && !done;
      lessons.push({
        id: L.id,
        orderIndex: L.orderIndex,
        lessonType: L.lessonType,
        referenceId: L.referenceId,
        title: L.title,
        done,
        locked: lockedLesson,
      });
    }

    return {
      locked,
      tierRequirement: course.tierRequirement,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        thumbnailKey: course.thumbnailKey,
        xpReward: course.xpReward,
        barleyReward: course.barleyReward,
        estimatedMinutes: course.estimatedMinutes,
      },
      userCourse: uc,
      lessons,
    };
  }

  private async lessonSatisfied(
    userId: string,
    lesson: { lessonType: CourseLessonType; referenceId: string },
  ): Promise<boolean> {
    if (lesson.lessonType === CourseLessonType.ARTICLE) {
      const ua = await this.prisma.userArticle.findUnique({
        where: {
          userId_articleId: { userId, articleId: lesson.referenceId },
        },
      });
      return ua?.status === UserArticleStatus.COMPLETED;
    }
    const pass = await this.prisma.quizAttempt.findFirst({
      where: { userId, quizId: lesson.referenceId, passed: true },
    });
    return !!pass;
  }

  async startCourse(userId: string, courseId: string) {
    const detail = await this.getCourse(userId, courseId);
    if (detail.locked) throw new ForbiddenException('Tier locked');
    let uc = detail.userCourse;
    if (!uc) {
      uc = await this.prisma.userCourse.create({
        data: {
          userId,
          courseId,
          status: UserCourseStatus.IN_PROGRESS,
          completedLessonIds: [],
        },
      });
    } else if (uc.status === UserCourseStatus.NOT_STARTED) {
      uc = await this.prisma.userCourse.update({
        where: { id: uc.id },
        data: { status: UserCourseStatus.IN_PROGRESS },
      });
    }
    return uc;
  }

  async completeCourseLesson(
    userId: string,
    courseId: string,
    lessonId: string,
  ) {
    const detail = await this.getCourse(userId, courseId);
    if (detail.locked) throw new ForbiddenException('Tier locked');
    let uc = detail.userCourse;
    if (!uc) throw new BadRequestException('Start the course first');
    if (uc.status === UserCourseStatus.NOT_STARTED) {
      uc = await this.prisma.userCourse.update({
        where: { id: uc.id },
        data: { status: UserCourseStatus.IN_PROGRESS },
      });
    }
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { lessons: { orderBy: { orderIndex: 'asc' } } },
    });
    if (!course) throw new NotFoundException('Course not found');
    const lesson = course.lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new NotFoundException('Lesson not found');

    const idx = course.lessons.findIndex((l) => l.id === lessonId);
    for (let i = 0; i < idx; i++) {
      const p = course.lessons[i];
      if (uc.completedLessonIds.includes(p.id)) continue;
      const ok = await this.lessonSatisfied(userId, p);
      if (!ok) {
        throw new BadRequestException('Complete previous lessons first');
      }
    }

    const coreOk = await this.lessonSatisfied(userId, lesson);
    if (!coreOk) {
      throw new BadRequestException('Finish this lesson content first');
    }

    const ids = new Set(uc.completedLessonIds);
    ids.add(lessonId);
    const allIds = course.lessons.map((l) => l.id);
    const allDone = allIds.every((id) => ids.has(id));

    let status = uc.status;
    let completedAt = uc.completedAt;
    let xpEarned = 0;
    let barleyEarned = 0;

    if (allDone && uc.status !== UserCourseStatus.COMPLETED) {
      status = UserCourseStatus.COMPLETED;
      completedAt = new Date();
      xpEarned = course.xpReward;
      barleyEarned = course.barleyReward;
      await this.progression.grantBarley(userId, barleyEarned);
      await this.progression.grantXp(userId, xpEarned);
      await this.events.onCourseCompleted(userId);
    } else {
      status = UserCourseStatus.IN_PROGRESS;
    }

    const updated = await this.prisma.userCourse.update({
      where: { id: uc.id },
      data: {
        completedLessonIds: [...ids],
        status,
        completedAt,
      },
    });

    return {
      userCourse: updated,
      courseJustCompleted: allDone && xpEarned > 0,
      xpEarned,
      barleyEarned,
    };
  }
}
