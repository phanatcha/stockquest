import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MarketStatusService } from './market-status.service';
import { MarketModule } from '../market/market.module';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [MarketModule, PortfoliosModule, GamificationModule],
  controllers: [OrdersController],
  providers: [OrdersService, MarketStatusService],
  exports: [OrdersService],
})
export class OrdersModule {}
