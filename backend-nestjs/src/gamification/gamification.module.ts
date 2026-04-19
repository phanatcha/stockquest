import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProgressionService } from './progression.service';
import { NotificationsService } from './notifications.service';
import { QuestsService } from './quests.service';
import { BadgesService } from './badges.service';
import { GamificationEventsService } from './gamification-events.service';
import { QuizzesService } from './quizzes.service';
import { GamificationController } from './gamification.controller';

@Module({
  imports: [PrismaModule],
  controllers: [GamificationController],
  providers: [
    ProgressionService,
    NotificationsService,
    QuestsService,
    BadgesService,
    GamificationEventsService,
    QuizzesService,
  ],
  exports: [
    ProgressionService,
    NotificationsService,
    QuestsService,
    BadgesService,
    GamificationEventsService,
    QuizzesService,
  ],
})
export class GamificationModule {}
