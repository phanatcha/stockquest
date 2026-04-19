import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeagueDto } from './dto/create-league.dto';
import { UpdateLeagueDto } from './dto/update-league.dto';
import { LeagueStatus, NotificationType } from '@prisma/client';
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

    await this.gamification.onLeagueCreated(creatorId);
    await this.processLeagueTransitions();
    return league;
  }

  async findAllActive() {
    await this.processLeagueTransitions();
    return this.prisma.league.findMany({
      where: {
        endDate: { gt: new Date() },
        isPublic: true,
        status: { not: LeagueStatus.CANCELLED },
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
      ...new Set(league.portfolios.flatMap((p) => p.holdings.map((h) => h.symbol))),
    ];
    const quotes = allSymbols.length
      ? await this.marketService.getBatchQuotes(allSymbols)
      : [];
    const priceMap = new Map(quotes.map((q) => [q.symbol, q.price]));

    const participants = league.portfolios.map((p) => {
      const holdingsValue = p.holdings.reduce((sum, h) => {
        const px = priceMap.get(h.symbol) ?? h.avgPrice;
        return sum + h.quantity * px;
      }, 0);
      const portfolioTotalValue = p.cashBalance + holdingsValue;
      const start = p.startingCash || league.startingCapital;
      const pct =
        start > 0 ? ((portfolioTotalValue - start) / start) * 100 : 0;
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
      throw new BadRequestException('Cannot delete active league with participants');
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
      throw new BadRequestException('League is full - maximum participants reached.');
    }

    const existingPortfolio = league.portfolios.find((p) => p.userId === userId);

    if (existingPortfolio) {
      throw new ConflictException('User already joined this league');
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
      if (now < start) continue;

      const n = league.portfolios.length;
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
      } else {
        await this.prisma.league.update({
          where: { id: league.id },
          data: { status: LeagueStatus.CANCELLED },
        });
        for (const p of league.portfolios) {
          await this.notifications.create(
            p.userId,
            NotificationType.LEAGUE_CANCELLED,
            `League "${league.name}" was cancelled — not enough players joined before the start.`,
          );
        }
        if (league.creatorId) {
          await this.notifications.create(
            league.creatorId,
            NotificationType.LEAGUE_CANCELLED,
            `Your league "${league.name}" was cancelled — minimum participants were not met.`,
          );
        }
      }
    }

    const activeLeagues = await this.prisma.league.findMany({
      where: { status: LeagueStatus.ACTIVE },
      include: { portfolios: { include: { holdings: true } } },
    });

    for (const league of activeLeagues) {
      if (new Date(league.endDate) > now) continue;
      await this.completeLeague(league);
    }
  }

  private async completeLeague(
    league: {
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
    },
  ) {
    const allSymbols = [
      ...new Set(league.portfolios.flatMap((p) => p.holdings.map((h) => h.symbol))),
    ];
    const quotes = allSymbols.length
      ? await this.marketService.getBatchQuotes(allSymbols)
      : [];
    const priceMap = new Map(quotes.map((q) => [q.symbol, q.price]));

    const scored = league.portfolios.map((p) => {
      const hv = p.holdings.reduce((s, h) => {
        const px = priceMap.get(h.symbol) ?? h.avgPrice;
        return s + h.quantity * px;
      }, 0);
      const total = p.cashBalance + hv;
      const start = p.startingCash || league.startingCapital;
      return { portfolioId: p.id, userId: p.userId, total, start };
    });

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

      if (rank === 1) await this.badges.awardLeagueChampion(row.userId);
      else if (rank === 2 || rank === 3) await this.badges.awardTop3(row.userId);
      else await this.badges.awardParticipant(row.userId);

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
