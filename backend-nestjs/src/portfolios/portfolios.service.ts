import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LeagueStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MarketService } from '../market/market.service';

@Injectable()
export class PortfoliosService {
  constructor(
    private prisma: PrismaService,
    private marketService: MarketService,
  ) {}

  async updatePortfolioValue(portfolioId: string) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: { holdings: true },
    });
    if (!portfolio) return 0;
    const symbols = portfolio.holdings.map((h) => h.symbol);
    const quotes = symbols.length
      ? await this.marketService.getBatchQuotes(symbols)
      : [];
    const priceMap = new Map<string, number>(
      quotes.map((q) => [q.symbol, q.price] as const),
    );
    const holdingsValue = portfolio.holdings.reduce((sum, h) => {
      const p = priceMap.get(h.symbol) ?? h.avgPrice;
      return sum + h.quantity * p;
    }, 0);
    const total = portfolio.cashBalance + holdingsValue;
    await this.prisma.portfolio.update({
      where: { id: portfolioId },
      data: { portfolioValue: total },
    });
    return total;
  }

  async findOne(id: string, userId: string) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id },
      include: {
        holdings: true,
        league: true,
        user: {
          select: { username: true, name: true },
        },
      },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    if (portfolio.userId !== userId) {
      throw new ForbiddenException('You can only access your own portfolio');
    }

    const symbols = portfolio.holdings.map((h) => h.symbol);
    const quotes = await this.marketService.getBatchQuotes(symbols);
    const priceMap = new Map<string, number>(
      quotes.map((q) => [q.symbol, q.price] as const),
    );

    // Augment holdings with currentPrice
    const augmentedHoldings = portfolio.holdings.map((h) => {
      const currentPrice = priceMap.get(h.symbol) || h.avgPrice;
      return { ...h, currentPrice };
    });

    const holdingsValue = augmentedHoldings.reduce(
      (sum, h) => sum + h.quantity * h.currentPrice,
      0,
    );
    const totalValue = portfolio.cashBalance + holdingsValue;

    return { ...portfolio, holdings: augmentedHoldings, totalValue };
  }

  async findMine(userId: string, isLive: boolean) {
    const leagueName = isLive ? 'Live Market Global' : 'The BullRing Global';
    const defaultStartingCapital = isLive ? 100 : 10000;

    let portfolio = await this.prisma.portfolio.findFirst({
      where: { userId, league: { name: leagueName } },
      include: {
        holdings: true,
        league: true,
        user: { select: { username: true, name: true } },
      },
    });

    // Auto-create league and portfolio if none exists
    if (!portfolio) {
      let targetLeague = await this.prisma.league.findFirst({
        where: { name: leagueName },
      });

      if (!targetLeague) {
        targetLeague = await this.prisma.league.create({
          data: {
            name: leagueName,
            startingCapital: defaultStartingCapital,
            endDate: new Date('2030-12-31T23:59:59.000Z'),
            startDate: new Date(),
            status: 'ACTIVE',
            minParticipants: 1,
            maxParticipants: 100000,
            isPublic: true,
          },
        });
      } else if (
        targetLeague.status !== LeagueStatus.ACTIVE ||
        targetLeague.startingCapital !== defaultStartingCapital
      ) {
        targetLeague = await this.prisma.league.update({
          where: { id: targetLeague.id },
          data: {
            status: LeagueStatus.ACTIVE,
            minParticipants: 1,
            maxParticipants: Math.max(targetLeague.maxParticipants, 100000),
            startingCapital: defaultStartingCapital,
            startDate: targetLeague.startDate ?? new Date(),
            endDate:
              targetLeague.endDate < new Date('2030-12-31T23:59:59.000Z')
                ? new Date('2030-12-31T23:59:59.000Z')
                : targetLeague.endDate,
          },
        });
      }

      portfolio = await this.prisma.portfolio.create({
        data: {
          userId,
          leagueId: targetLeague.id,
          cashBalance: targetLeague.startingCapital,
          startingCash: targetLeague.startingCapital,
          portfolioValue: targetLeague.startingCapital,
        },
        include: {
          holdings: true,
          league: true,
          user: { select: { username: true, name: true } },
        },
      });
    } else if (portfolio.league.status !== LeagueStatus.ACTIVE) {
      await this.prisma.league.update({
        where: { id: portfolio.league.id },
        data: {
          status: LeagueStatus.ACTIVE,
          minParticipants: 1,
          maxParticipants: Math.max(portfolio.league.maxParticipants, 100000),
        },
      });
      portfolio = await this.prisma.portfolio.findUniqueOrThrow({
        where: { id: portfolio.id },
        include: {
          holdings: true,
          league: true,
          user: { select: { username: true, name: true } },
        },
      });
    } else if (
      portfolio.holdings.length === 0 &&
      portfolio.cashBalance === portfolio.startingCash &&
      portfolio.startingCash !== defaultStartingCapital
    ) {
      // Keep existing progress, but normalize untouched starter portfolios.
      portfolio = await this.prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          cashBalance: defaultStartingCapital,
          startingCash: defaultStartingCapital,
          portfolioValue: defaultStartingCapital,
        },
        include: {
          holdings: true,
          league: true,
          user: { select: { username: true, name: true } },
        },
      });
    }

    const symbols = portfolio.holdings.map((h) => h.symbol);
    const quotes = await this.marketService.getBatchQuotes(symbols);
    const priceMap = new Map<string, number>(
      quotes.map((q) => [q.symbol, q.price] as const),
    );

    const augmentedHoldings = portfolio.holdings.map((h) => {
      const currentPrice = priceMap.get(h.symbol) || h.avgPrice;
      return { ...h, currentPrice };
    });

    const holdingsValue = augmentedHoldings.reduce(
      (sum, h) => sum + h.quantity * h.currentPrice,
      0,
    );
    const totalValue = portfolio.cashBalance + holdingsValue;

    return { ...portfolio, holdings: augmentedHoldings, totalValue };
  }
}
