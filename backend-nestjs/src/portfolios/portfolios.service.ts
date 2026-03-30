
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PortfoliosService {
    constructor(private prisma: PrismaService) { }

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

        const holdingsValue = portfolio.holdings.reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
        const totalValue = portfolio.cashBalance + holdingsValue;

        return { ...portfolio, totalValue };
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
                    cashBalance: targetLeague.startingCapital
                },
                include: { holdings: true, league: true, user: { select: { username: true, name: true } } }
            });
        }

        const holdingsValue = portfolio.holdings.reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
        const totalValue = portfolio.cashBalance + holdingsValue;

        return { ...portfolio, totalValue };
    }
}
