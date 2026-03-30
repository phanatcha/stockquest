
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(uniqueInput: Prisma.UserWhereUniqueInput): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: uniqueInput,
        });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data,
        });
    }

    async completeOnboarding(userId: string, dto: import('./dto/onboarding.dto').OnboardingDto) {
        // Calculate risk tolerance based on answers.
        // Simple logic for example sake
        let score = 0;
        
        if (dto.goal.includes('Aggressive') || dto.goal.includes('Maximize')) score += 3;
        else if (dto.goal.includes('Balanced') || dto.goal.includes('Grow')) score += 2;
        else score += 1;

        if (dto.reactionDrop.includes('Buy') || dto.reactionDrop.includes('See it as a buying')) score += 3;
        else if (dto.reactionDrop.includes('Wait')) score += 2;
        else score += 1;

        if (dto.horizon.includes('More than 7') || dto.horizon.includes('Long-term')) score += 3;
        else if (dto.horizon.includes('3 - 7') || dto.horizon.includes('Medium-term')) score += 2;
        else score += 1;

        let riskTolerance = 'Conservative';
        if (score >= 7) riskTolerance = 'Aggressive';
        else if (score >= 5) riskTolerance = 'Moderate';

        await this.prisma.$transaction(async (prisma) => {
            await prisma.riskProfile.create({
                data: {
                    userId,
                    age: dto.age,
                    goal: dto.goal,
                    reactionDrop: dto.reactionDrop,
                    horizon: dto.horizon,
                    riskTolerance,
                }
            });

            await prisma.user.update({
                where: { id: userId },
                data: {
                    onboardingCompleted: true,
                    riskTolerance: riskTolerance,
                }
            });
        });

        return { riskTolerance };
    }
}
