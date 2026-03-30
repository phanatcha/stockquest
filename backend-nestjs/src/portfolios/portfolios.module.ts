
import { Module } from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { PortfoliosController } from './portfolios.controller';
import { MarketModule } from '../market/market.module';

@Module({
  imports: [MarketModule],
  controllers: [PortfoliosController],
  providers: [PortfoliosService],
  exports: [PortfoliosService]
})
export class PortfoliosModule { }
