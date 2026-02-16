
import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MarketStatusService } from './market-status.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, MarketStatusService],
})
export class OrdersModule { }
