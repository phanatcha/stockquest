
import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MarketStatusService } from './market-status.service';
import { MarketModule } from '../market/market.module';

@Module({
  imports: [MarketModule],
  controllers: [OrdersController],
  providers: [OrdersService, MarketStatusService],
  exports: [OrdersService]
})
export class OrdersModule { }
