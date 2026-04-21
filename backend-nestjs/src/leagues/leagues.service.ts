import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeagueDto } from './dto/create-league.dto';
import { UpdateLeagueDto } from './dto/update-league.dto';
import {
  BadgeTriggerEvent,
  LeagueStatus,
  NotificationType,
  SnapshotType,
} from '@prisma/client';
import { MarketService } from '../market/market.service';
import { ProgressionService } from '../gamification/progression.service';
import { GamificationEventsService } from '../gamification/gamification-events.service';
import { BadgesService } from '../gamification/badges.service';
import { NotificationsService } from '../gamification/notifications.service';

const XP_BY_RANK: Record<number, number> = {
  1: 500,
  2: 300,
  3: 150,
};

/** Persistent sandbox leagues — leaving would break market/portfolio auto-provision. */
const GLOBAL_MARKET_LEAGUE_NAMES = new Set([
  'Live Market Global',
  'The Bull Run Global',
]);

@Injectable()
export class LeaguesService {
  constructor(
    private prisma: PrismaService,
    private marketService: MarketService,
    private progression: ProgressionService,
    private gamification: GamificationEventsService,
    private badges: BadgesService,
    private notifications: NotificationsService,
  ) {}

  async create(createLeagueDto: CreateLeagueDto, creatorId: string) {
    const endDate = new Date(createLeagueDto.endDate);
    if (endDate <= new Date()) {
      throw new BadRequestException('End date must be in the future');
    }

    const league = await this.prisma.league.create({
      data: {
        name: createLeagueDto.name,
        description: createLeagueDto.description,
        creatorId,
        startingCapital: createLeagueDto.startingCapital,
        startDate: createLeagueDto.startDate
          ? new Date(createLeagueDto.startDate)
          : new Date(),
        endDate,
        maxParticipants: createLeagueDto.maxParticipants ?? 100,
        minParticipants: createLeagueDto.minParticipants ?? 2,
        status: LeagueStatus.LOBBY,
        isPublic: createLeagueDto.isPublic ?? true,
      },
    });

    // League creators should automatically participate in their own league.
    await this.prisma.portfolio.create({
      data: {
        userId: creatorId,
        leagueId: league.id,
        cashBalance: league.startingCapital,
        startingCash: league.startingCapital,
        portfolioValue: league.startingCapital,
      },
    });

    await this.gamification.onLeagueCreated(creatorId);
    await this.gamification.onLeagueJoined(creatorId);
    await this.processLeagueTransitions();
    return this.prisma.league.findUniqueOrThrow({ where: { id: league.id } });
  }

  async findAllActive() {
    await this.processLeagueTransitions();
    const now = new Date();
    return this.prisma.league.findMany({
      where: {
        isPublic: true,
        endDate: { gt: now },
        status: { in: [LeagueStatus.LOBBY, LeagueStatus.ACTIVE] },
      },
      orderBy: [{ endDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findMyLeagues(userId: string) {
    await this.processLeagueTransitions();
    return this.prisma.league.findMany({
      where: {
        portfolios: {
          some: { userId },
        },
      },
      orderBy: [{ status: 'asc' }, { endDate: 'asc' }],
      include: {
        portfolios: {
          include: {
            user: {
              select: { username: true, name: true },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    await this.processLeagueTransitions();
    const league = await this.prisma.league.findUnique({
      where: { id },
      include: {
        portfolios: {
          include: {
            user: {
              select: {
                username: true,
                name: true,
              },
            },
            holdings: true,
          },
        },
      },
    });

    if (!league) {
      throw new NotFoundException('League not found');
    }

    const allSymbols = [
      ...new Set(
        league.portfolios.flatMap((p) => p.holdings.map((h) => h.symbol)),
      ),
    ];
    const quotes = allSymbols.length
      ? await this.marketService.getBatchQuotes(allSymbols)
      : [];
    const priceMap = new Map<string, number>(
      quotes.map((q) => [q.symbol, q.price] as const),
    );

    const participants = league.portfolios.map((p) => {
      const holdingsValue = p.holdings.reduce((sum, h) => {
        const px = priceMap.get(h.symbol) ?? h.avgPrice;
        return sum + h.quantity * px;
      }, 0);
      const portfolioTotalValue = p.cashBalance + holdingsValue;
      const start = p.startingCash || league.startingCapital;
      const pct = start > 0 ? ((portfolioTotalValue - start) / start) * 100 : 0;
      return {
        portfolioId: p.id,
        username: p.user.username,
        name: p.user.name,
        portfolioTotalValue,
        pctGainLoss: pct,
        cashBalance: p.cashBalance,
        finalRank: p.finalRank,
      };
    });

    const ranked = [...participants].sort(
      (a, b) => b.portfolioTotalValue - a.portfolioTotalValue,
    );
    const withRanks = ranked.map((p, idx) => ({ ...p, liveRank: idx + 1 }));

    return { ...league, participants: withRanks };
  }

  async remove(id: string) {
    const league = await this.prisma.league.findUnique({
      where: { id },
      include: { portfolios: true },
    });

    if (!league) {
      throw new NotFoundException('League not found');
    }

    if (league.portfolios.length > 0 && new Date(league.endDate) > new Date()) {
      throw new BadRequestException(
        'Cannot delete active league with participants',
      );
    }

    return this.prisma.league.delete({
      where: { id },
    });
  }

  async join(leagueId: string, userId: string) {
    const league = await this.prisma.league.findUnique({
      where: { id: leagueId },
      include: { portfolios: true },
    });
    if (!league) throw new NotFoundException('League not found');

    if (
      league.status === LeagueStatus.COMPLETED ||
      league.status === LeagueStatus.CANCELLED
    ) {
      throw new BadRequestException('League has ended or was cancelled');
    }

    if (new Date(league.endDate) <= new Date()) {
      throw new BadRequestException('League has ended');
    }

    if (league.portfolios.length >= league.maxParticipants) {
      throw new BadRequestException(
        'League is full - maximum participants reached.',
      );
    }

    const existingPortfolio = league.portfolios.find(
      (p) => p.userId === userId,
    );

    if (existingPortfolio) {
      await this.processLeagueTransitions();
      return existingPortfolio;
    }

    const newPortfolio = await this.prisma.portfolio.create({
      data: {
        userId,
        leagueId,
        cashBalance: league.startingCapital,
        startingCash: league.startingCapital,
        portfolioValue: league.startingCapital,
      },
    });

    await this.gamification.onLeagueJoined(userId);
    await this.processLeagueTransitions();
    return newPortfolio;
  }

  async leave(leagueId: string, userId: string) {
    const league = await this.prisma.league.findUnique({
      where: { id: leagueId },
    });
    if (!league) {
      throw new NotFoundException('League not found');
    }
    if (GLOBAL_MARKET_LEAGUE_NAMES.has(league.name)) {
      throw new BadRequestException(
        'You cannot leave the global market league. It holds your default portfolio.',
      );
    }

    const portfolio = await this.prisma.portfolio.findFirst({
      where: { leagueId, userId },
    });
    if (!portfolio) {
      throw new BadRequestException('You are not a member of this league');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.leagueSnapshotEntry.deleteMany({
        where: { portfolioId: portfolio.id },
      });
      await tx.order.deleteMany({ where: { portfolioId: portfolio.id } });
      await tx.holding.deleteMany({ where: { portfolioId: portfolio.id } });
      await tx.portfolio.delete({ where: { id: portfolio.id } });
    });

    await this.notifications.create(
      userId,
      NotificationType.LEAGUE_STATE,
      `You left the league "${league.name}".`,
    );
    await this.processLeagueTransitions();
    return { ok: true };
  }

  async update(id: string, updateLeagueDto: UpdateLeagueDto) {
    const league = await this.prisma.league.findUnique({ where: { id } });
    if (!league) throw new NotFoundException('League not found');

    if (updateLeagueDto.endDate) {
      const endDate = new Date(updateLeagueDto.endDate);
      if (endDate <= new Date()) {
        throw new BadRequestException('End date must be in the future');
      }
    }

    return this.prisma.league.update({
      where: { id },
      data: {
        ...updateLeagueDto,
        endDate: updateLeagueDto.endDate
          ? new Date(updateLeagueDto.endDate)
          : undefined,
        startDate: updateLeagueDto.startDate
          ? new Date(updateLeagueDto.startDate)
          : undefined,
      },
    });
  }

  /** Lobby → active/cancelled; active → completed when dates warrant. */
  async processLeagueTransitions() {
    const now = new Date();

    const lobbyLeagues = await this.prisma.league.findMany({
      where: { status: LeagueStatus.LOBBY },
      include: { portfolios: true },
    });

    for (const league of lobbyLeagues) {
      const start = league.startDate ? new Date(league.startDate) : new Date(0);
      const end = new Date(league.endDate);
      const n = league.portfolios.length;

      // Past end date: never promote to ACTIVE (that would immediately complete and confuse joiners).
      if (end <= now) {
        if (n < league.minParticipants) {
          await this.prisma.league.update({
            where: { id: league.id },
            data: { status: LeagueStatus.CANCELLED },
          });
          for (const p of league.portfolios) {
            await this.notifications.create(
              p.userId,
              NotificationType.LEAGUE_CANCELLED,
              `League "${league.name}" was cancelled — not enough players joined before the end.`,
            );
          }
          if (league.creatorId) {
            await this.notifications.create(
              league.creatorId,
              NotificationType.LEAGUE_CANCELLED,
              `Your league "${league.name}" was cancelled — minimum participants were not met.`,
            );
          }
        } else {
          await this.prisma.league.update({
            where: { id: league.id },
            data: { status: LeagueStatus.ACTIVE },
          });
          const full = await this.prisma.league.findUniqueOrThrow({
            where: { id: league.id },
            include: { portfolios: { include: { holdings: true } } },
          });
          await this.completeLeague(full);
        }
        continue;
      }

      if (now < start) continue;

      if (n >= league.minParticipants) {
        await this.prisma.league.update({
          where: { id: league.id },
          data: { status: LeagueStatus.ACTIVE },
        });
        for (const p of league.portfolios) {
          await this.notifications.create(
            p.userId,
            NotificationType.LEAGUE_STATE,
            `League "${league.name}" is now ACTIVE. Trading is open.`,
          );
        }
      }
    }

    await this.ensureMidpointSnapshots();

    const activeLeagues = await this.prisma.league.findMany({
      where: { status: LeagueStatus.ACTIVE },
      include: { portfolios: { include: { holdings: true } } },
    });

    for (const league of activeLeagues) {
      if (new Date(league.endDate) > now) continue;
      await this.completeLeague(league);
    }
  }

  private async ensureMidpointSnapshots() {
    const now = new Date();
    const active = await this.prisma.league.findMany({
      where: { status: LeagueStatus.ACTIVE },
      include: { portfolios: { include: { holdings: true } } },
    });

    for (const league of active) {
      const start = league.startDate
        ? new Date(league.startDate)
        : league.createdAt;
      const end = new Date(league.endDate);
      const midTime = new Date(
        start.getTime() + (end.getTime() - start.getTime()) / 2,
      );
      if (now < midTime) continue;

      const exists = await this.prisma.leagueSnapshot.findFirst({
        where: { leagueId: league.id, snapshotType: SnapshotType.MIDPOINT },
      });
      if (exists) continue;

      const scored = await this.scoreLeaguePortfolios(league);
      const ranked = [...scored].sort((a, b) => b.total - a.total);

      await this.prisma.leagueSnapshot.create({
        data: {
          leagueId: league.id,
          snapshotType: SnapshotType.MIDPOINT,
          entries: {
            create: ranked.map((row, i) => ({
              portfolioId: row.portfolioId,
              rank: i + 1,
              portfolioValue: row.total,
            })),
          },
        },
      });
    }
  }

  private async scoreLeaguePortfolios(league: {
    id: string;
    startingCapital: number;
    portfolios: Array<{
      id: string;
      userId: string;
      cashBalance: number;
      startingCash: number;
      holdings: Array<{ symbol: string; quantity: number; avgPrice: number }>;
    }>;
  }) {
    const allSymbols = [
      ...new Set(
        league.portfolios.flatMap((p) => p.holdings.map((h) => h.symbol)),
      ),
    ];
    const quotes = allSymbols.length
      ? await this.marketService.getBatchQuotes(allSymbols)
      : [];
    const priceMap = new Map<string, number>(
      quotes.map((q) => [q.symbol, q.price] as const),
    );

    return league.portfolios.map((p) => {
      const hv = p.holdings.reduce((s, h) => {
        const px = priceMap.get(h.symbol) ?? h.avgPrice;
        return s + h.quantity * px;
      }, 0);
      const total = p.cashBalance + hv;
      const start = p.startingCash || league.startingCapital;
      return { portfolioId: p.id, userId: p.userId, total, start };
    });
  }

  private async completeLeague(league: {
    id: string;
    name: string;
    startingCapital: number;
    portfolios: Array<{
      id: string;
      userId: string;
      cashBalance: number;
      startingCash: number;
      holdings: Array<{ symbol: string; quantity: number; avgPrice: number }>;
    }>;
  }) {
    const scored = await this.scoreLeaguePortfolios(league);
    scored.sort((a, b) => b.total - a.total);

    for (let i = 0; i < scored.length; i++) {
      const rank = i + 1;
      const row = scored[i];
      const xp = XP_BY_RANK[rank] ?? 50;

      await this.prisma.portfolio.update({
        where: { id: row.portfolioId },
        data: {
          finalRank: rank,
          portfolioValue: row.total,
          xpEarned: { increment: xp },
        },
      });

      await this.progression.grantXp(row.userId, xp);
      await this.progression.checkTierUpgrade(row.userId);

      if (rank <= 3) {
        await this.gamification.onLeagueFinishedTop3(row.userId);
      }

      await this.badges.checkAndAwardBadge(
        row.userId,
        BadgeTriggerEvent.LEAGUE_COMPLETED,
        {
          leagueId: league.id,
          portfolioId: row.portfolioId,
          finalRank: rank,
          finalPortfolioValue: row.total,
          startingCash: row.start,
        },
      );

      await this.notifications.create(
        row.userId,
        NotificationType.LEAGUE_REWARDS,
        `League "${league.name}" finished. You placed #${rank} and earned ${xp} XP.`,
      );
    }

    await this.prisma.league.update({
      where: { id: league.id },
      data: { status: LeagueStatus.COMPLETED },
    });
  }
}
