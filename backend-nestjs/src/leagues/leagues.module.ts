
import { Module } from '@nestjs/common';
import { LeaguesService } from './leagues.service';
import { LeaguesController } from './leagues.controller';
import { MarketModule } from '../market/market.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [MarketModule, GamificationModule],
  controllers: [LeaguesController],
  providers: [LeaguesService],
})
export class LeaguesModule { }
