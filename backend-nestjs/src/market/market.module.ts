import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';

@Module({
  providers: [MarketService],
  controllers: [MarketController],
  exports: [MarketService], // We export it so orders can use it
})
export class MarketModule {}
