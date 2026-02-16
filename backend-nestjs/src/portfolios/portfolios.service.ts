
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

        // Calculate total value
        // Assuming current price = avgPrice for now as discussed, or I need a mock price service.
        // For the sake of "total value" requirement, I'll sum cash + (quantity * avgPrice)
        const holdingsValue = portfolio.holdings.reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
        const totalValue = portfolio.cashBalance + holdingsValue;

        return {
            ...portfolio,
            totalValue
        };
    }
}
