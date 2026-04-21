import { Injectable, BadRequestException } from '@nestjs/common';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new (YahooFinance as any)({
  suppressNotices: ['ripHistorical'],
});

@Injectable()
export class MarketService {
  async getQuote(symbol: string) {
    try {
      const result: any = await yahooFinance.quote(symbol);
      if (!result || !result.regularMarketPrice)
        throw new Error('No price Data');
      return {
        symbol: result.symbol,
        price: result.regularMarketPrice,
        change: result.regularMarketChange || 0,
        changePercent: result.regularMarketChangePercent || 0,
        volume: result.regularMarketVolume || 0,
        marketCap: result.marketCap || 0,
        name: result.shortName || result.longName || result.symbol,
      };
    } catch (e: any) {
      throw new BadRequestException(
        `Fetch failed for ${symbol}: ${e.message || String(e)}`,
      );
    }
  }

  async getHistory(
    symbol: string,
    interval: '1m' | '5m' | '1d' | '1wk' | '1mo' = '1d',
  ) {
    try {
      const today = new Date();
      const pastDate = new Date();
      if (interval === '1mo' || interval === '1wk') {
        pastDate.setFullYear(today.getFullYear() - 1);
      } else if (interval === '1d') {
        pastDate.setMonth(today.getMonth() - 6);
      } else {
        pastDate.setDate(today.getDate() - 7); // For intraday 1m/5m, max 7 days usually
      }

      const results: any = await yahooFinance.chart(symbol, {
        period1: pastDate,
        period2: today,
        interval: interval as any,
      });
      return results.quotes.map((r: any) => ({
        date: r.date,
        price: r.close,
      }));
    } catch (e: any) {
      throw new BadRequestException(
        `Fetch failed for ${symbol}: ${e.message || String(e)}`,
      );
    }
  }

  async getBatchQuotes(symbols: string[]) {
    try {
      const results = await Promise.all(
        symbols.map((s) => this.getQuote(s).catch(() => null)),
      );
      return results.filter((r) => r !== null);
    } catch (e) {
      return [];
    }
  }
}
