import { Controller, Get, Param, Query } from '@nestjs/common';
import { MarketService } from './market.service';

@Controller('market')
export class MarketController {
    constructor(private readonly marketService: MarketService) {}

    @Get('quote/:symbol')
    getQuote(@Param('symbol') symbol: string) {
        return this.marketService.getQuote(symbol);
    }
    
    @Get('batch')
    getBatch(@Query('symbols') symbols: string) {
        if (!symbols) return [];
        return this.marketService.getBatchQuotes(symbols.split(','));
    }

    @Get('history/:symbol')
    getHistory(@Param('symbol') symbol: string, @Query('interval') interval: any) {
        return this.marketService.getHistory(symbol, interval || '1d');
    }
}
