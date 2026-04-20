import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressionService } from './progression.service';

function utcDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

@Injectable()
export class LearningStreakService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progression: ProgressionService,
  ) {}

  /**
   * Call when user completes an article or passes a quiz (same calendar day counts once).
   * Updates streak; awards milestone XP (3/7/30) once each via grantXp + tier check.
   */
  async recordArticleOrQuizActivity(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    milestoneXpAwarded: number;
  }> {
    const today = utcDay(new Date());
    let row = await this.prisma.learningStreak.findUnique({ where: { userId } });
    if (!row) {
      row = await this.prisma.learningStreak.create({
        data: { userId, currentStreak: 0, longestStreak: 0, lastActivityDate: null },
      });
    }

    const last = row.lastActivityDate ? utcDay(row.lastActivityDate) : null;
    let current = row.currentStreak;
    let longest = row.longestStreak;
    let milestoneXpAwarded = 0;

    if (last === today) {
      return { currentStreak: current, longestStreak: longest, milestoneXpAwarded: 0 };
    }

    if (!last) {
      current = 1;
    } else {
      const prev = new Date(last + 'T12:00:00.000Z');
      const expected = new Date(prev);
      expected.setUTCDate(expected.getUTCDate() + 1);
      if (utcDay(expected) === today) {
        current = row.currentStreak + 1;
      } else {
        current = 1;
      }
    }

    longest = Math.max(longest, current);

    await this.prisma.learningStreak.update({
      where: { userId },
      data: {
        currentStreak: current,
        longestStreak: longest,
        lastActivityDate: new Date(),
      },
    });

    const milestones = [
      { days: 3, xp: 50 },
      { days: 7, xp: 150 },
      { days: 30, xp: 500 },
    ] as const;

    for (const m of milestones) {
      if (current < m.days) continue;
      const existing = await this.prisma.streakMilestone.findUnique({
        where: { userId_milestoneDays: { userId, milestoneDays: m.days } },
      });
      if (existing) continue;
      await this.prisma.streakMilestone.create({
        data: { userId, milestoneDays: m.days },
      });
      await this.progression.grantXp(userId, m.xp);
      milestoneXpAwarded += m.xp;
    }

    return { currentStreak: current, longestStreak: longest, milestoneXpAwarded };
  }

  async getForUser(userId: string) {
    let row = await this.prisma.learningStreak.findUnique({ where: { userId } });
    if (!row) {
      row = await this.prisma.learningStreak.create({
        data: { userId, currentStreak: 0, longestStreak: 0, lastActivityDate: null },
      });
    }
    return row;
  }
}
