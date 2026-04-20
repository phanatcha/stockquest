import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GamificationModule } from '../gamification/gamification.module';
import { LearnController } from './learn.controller';
import { LearnService } from './learn.service';

@Module({
  imports: [PrismaModule, GamificationModule],
  controllers: [LearnController],
  providers: [LearnService],
})
export class LearnModule {}
