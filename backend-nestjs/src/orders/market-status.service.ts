
import { Injectable } from '@nestjs/common';

@Injectable()
export class MarketStatusService {
    isMarketOpen(): boolean {
        // Mock implementation: always open
        return true;
    }
}
