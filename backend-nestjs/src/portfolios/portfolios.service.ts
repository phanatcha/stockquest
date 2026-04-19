
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketService } from '../market/market.service';

@Injectable()
export class PortfoliosService {
    constructor(
        private prisma: PrismaService,
        private marketService: MarketService,
    ) { }

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
        const priceMap = new Map(quotes.map((q) => [q.symbol, q.price]));
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
                    select: { username: true, name: true }
                }
            }
        });

        if (!portfolio) {
            throw new NotFoundException('Portfolio not found');
        }

        if (portfolio.userId !== userId) {
            throw new ForbiddenException('You can only access your own portfolio');
        }

        const symbols = portfolio.holdings.map(h => h.symbol);
        const quotes = await this.marketService.getBatchQuotes(symbols);
        const priceMap = new Map(quotes.map(q => [q.symbol, q.price]));

        // Augment holdings with currentPrice
        const augmentedHoldings = portfolio.holdings.map(h => {
             const currentPrice = priceMap.get(h.symbol) || h.avgPrice;
             return { ...h, currentPrice };
        });

        const holdingsValue = augmentedHoldings.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0);
        const totalValue = portfolio.cashBalance + holdingsValue;

        return { ...portfolio, holdings: augmentedHoldings, totalValue };
    }

    async findMine(userId: string, isLive: boolean) {
        const leagueName = isLive ? 'Live Market Global' : 'The Bull Run Global';
        
        let portfolio = await this.prisma.portfolio.findFirst({
            where: { userId, league: { name: leagueName } },
            include: { holdings: true, league: true, user: { select: { username: true, name: true } } }
        });

        // Auto-create league and portfolio if none exists
        if (!portfolio) {
            let targetLeague = await this.prisma.league.findFirst({
                where: { name: leagueName }
            });

            if (!targetLeague) {
                targetLeague = await this.prisma.league.create({
                    data: {
                        name: leagueName,
                        startingCapital: isLive ? 10000 : 100000, // Live starts with 10k real money mock, sim 100k
                        endDate: new Date('2030-12-31T23:59:59.000Z'),
                        isPublic: true
                    }
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
                include: { holdings: true, league: true, user: { select: { username: true, name: true } } }
            });
        }

        const symbols = portfolio.holdings.map(h => h.symbol);
        const quotes = await this.marketService.getBatchQuotes(symbols);
        const priceMap = new Map(quotes.map(q => [q.symbol, q.price]));

        const augmentedHoldings = portfolio.holdings.map(h => {
             const currentPrice = priceMap.get(h.symbol) || h.avgPrice;
             return { ...h, currentPrice };
        });

        const holdingsValue = augmentedHoldings.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0);
        const totalValue = portfolio.cashBalance + holdingsValue;

        return { ...portfolio, holdings: augmentedHoldings, totalValue };
    }
}
