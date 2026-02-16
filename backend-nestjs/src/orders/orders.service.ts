
import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { MarketStatusService } from './market-status.service';
import { OrderType } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private marketStatusService: MarketStatusService,
    ) { }

    async create(userId: string, createOrderDto: CreateOrderDto) {
        if (!this.marketStatusService.isMarketOpen()) {
            throw new BadRequestException('Market is closed');
        }

        const { portfolioId, symbol, quantity, type, price } = createOrderDto;

        // Verify portfolio ownership
        const portfolio = await this.prisma.portfolio.findUnique({
            where: { id: portfolioId },
        });

        if (!portfolio) {
            throw new NotFoundException('Portfolio not found');
        }

        if (portfolio.userId !== userId) {
            throw new ForbiddenException('You can only store orders for your own portfolio');
        }

        return this.prisma.$transaction(async (tx) => {
            const currentPortfolio = await tx.portfolio.findUniqueOrThrow({
                where: { id: portfolioId },
            });

            if (type === OrderType.BUY) {
                const totalCost = price * quantity;
                if (currentPortfolio.cashBalance < totalCost) {
                    throw new BadRequestException('Insufficient cash balance');
                }

                // Deduct cash
                await tx.portfolio.update({
                    where: { id: portfolioId },
                    data: { cashBalance: { decrement: totalCost } },
                });

                // Update or create holding
                const existingHolding = await tx.holding.findFirst({
                    where: { portfolioId, symbol },
                });

                if (existingHolding) {
                    const newAvgPrice =
                        (existingHolding.quantity * existingHolding.avgPrice + totalCost) /
                        (existingHolding.quantity + quantity);

                    await tx.holding.update({
                        where: { id: existingHolding.id },
                        data: {
                            quantity: { increment: quantity },
                            avgPrice: newAvgPrice,
                        },
                    });
                } else {
                    await tx.holding.create({
                        data: {
                            portfolioId,
                            symbol,
                            quantity,
                            avgPrice: price,
                        },
                    });
                }
            } else if (type === OrderType.SELL) {
                const existingHolding = await tx.holding.findFirst({
                    where: { portfolioId, symbol },
                });

                if (!existingHolding || existingHolding.quantity < quantity) {
                    throw new BadRequestException('Insufficient shares to sell');
                }

                const totalProceeds = price * quantity;

                // Add cash
                await tx.portfolio.update({
                    where: { id: portfolioId },
                    data: { cashBalance: { increment: totalProceeds } },
                });

                // Update holding
                if (existingHolding.quantity === quantity) {
                    await tx.holding.delete({
                        where: { id: existingHolding.id },
                    });
                } else {
                    // Sell does not change avg price usually (FIFO/LIFO accounting notwithstanding, simplest model assumes avg cost basis remains same)
                    await tx.holding.update({
                        where: { id: existingHolding.id },
                        data: {
                            quantity: { decrement: quantity },
                        },
                    });
                }
            }

            // Create Order Record
            return tx.order.create({
                data: {
                    portfolioId,
                    symbol,
                    quantity,
                    type,
                    price,
                },
            });
        });
    }
}
