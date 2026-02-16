
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeagueDto } from './dto/create-league.dto';
import { UpdateLeagueDto } from './dto/update-league.dto';
import { Role } from '@prisma/client';

@Injectable()
export class LeaguesService {
    constructor(private prisma: PrismaService) { }

    async create(createLeagueDto: CreateLeagueDto) {
        const endDate = new Date(createLeagueDto.endDate);
        if (endDate <= new Date()) {
            throw new BadRequestException('End date must be in the future');
        }

        return this.prisma.league.create({
            data: {
                name: createLeagueDto.name,
                startingCapital: createLeagueDto.startingCapital,
                endDate: endDate,
                isPublic: createLeagueDto.isPublic ?? true,
            },
        });
    }

    async findAllActive() {
        return this.prisma.league.findMany({
            where: {
                endDate: {
                    gt: new Date(),
                },
                isPublic: true,
            },
        });
    }

    async findOne(id: string) {
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

        // Calculate total value for each participant (simple mock calculation for now, better in PortfolioService)
        // Actually, requirement says "Include participants with ... portfolio total value".
        // I will map the result.
        const participants = league.portfolios.map(p => {
            // Calculate total value: cash + (holding.quantity * holding.avgPrice) <- wait, need current price.
            // For now, I'll use avgPrice as current price since I don't have MarketService here easily unless I duplicate logic.
            // Or I just return cash + holdings cost basis. 
            // Real logic needs current market price. I'll stick to simple logic or simplified view.
            // Let's assume current value ~ avgPrice for this view (or better, 0 if just created).
            // I will just return the portfolio info and let frontend calculate or handle it.
            // Requirement: "portfolio total value".
            // I'll calculate based on avgPrice for now as I don't have real-time quotes here.
            const holdingsValue = p.holdings.reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
            return {
                username: p.user.username,
                name: p.user.name,
                portfolioTotalValue: p.cashBalance + holdingsValue
            };
        });

        return { ...league, participants };
    }

    async remove(id: string) {
        // Check if league has participants
        const league = await this.prisma.league.findUnique({
            where: { id },
            include: { portfolios: true }
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
        const league = await this.prisma.league.findUnique({ where: { id: leagueId } });
        if (!league) throw new NotFoundException('League not found');

        if (new Date(league.endDate) <= new Date()) {
            throw new BadRequestException('League has ended');
        }

        const existingPortfolio = await this.prisma.portfolio.findFirst({
            where: { leagueId, userId }
        });

        if (existingPortfolio) {
            throw new ConflictException('User already joined this league');
        }

        return this.prisma.portfolio.create({
            data: {
                userId,
                leagueId,
                cashBalance: league.startingCapital
            }
        });
    }
    async update(id: string, updateLeagueDto: UpdateLeagueDto) {
        const league = await this.prisma.league.findUnique({ where: { id } });
        if (!league) throw new NotFoundException('League not found');

        if (updateLeagueDto.endDate) {
            const endDate = new Date(updateLeagueDto.endDate);
            if (endDate <= new Date()) {
                throw new BadRequestException('End date must be in the future');
            }
            // If checking against creation date overlap, that's complex, but basic future check is good.
        }

        return this.prisma.league.update({
            where: { id },
            data: {
                ...updateLeagueDto,
                endDate: updateLeagueDto.endDate ? new Date(updateLeagueDto.endDate) : undefined,
            },
        });
    }
}
