
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

    async findMine(userId: string) {
        let portfolio = await this.prisma.portfolio.findFirst({
            where: { userId },
            include: { holdings: true, league: true, user: { select: { username: true, name: true } } }
        });

        // Auto-create global league and portfolio if none exists
        if (!portfolio) {
            let globalLeague = await this.prisma.league.findFirst({
                where: { name: 'The Bull Run Global' }
            });

            if (!globalLeague) {
                globalLeague = await this.prisma.league.create({
                    data: {
                        name: 'The Bull Run Global',
                        startingCapital: 100000,
                        endDate: new Date('2030-12-31T23:59:59.000Z'),
                        isPublic: true
                    }
                });
            }

            portfolio = await this.prisma.portfolio.create({
                data: {
                    userId,
                    leagueId: globalLeague.id,
                    cashBalance: globalLeague.startingCapital
                },
                include: { holdings: true, league: true, user: { select: { username: true, name: true } } }
            });
        }

        const holdingsValue = portfolio.holdings.reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
        const totalValue = portfolio.cashBalance + holdingsValue;

        return { ...portfolio, totalValue };
    }
}
