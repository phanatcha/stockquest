
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LeaguesModule } from './leagues/leagues.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MarketModule } from './market/market.module';
import { AdminModule } from './admin/admin.module';
import { GamificationModule } from './gamification/gamification.module';
import { LearnModule } from './learn/learn.module';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    AuthModule,
    MarketModule,
    AdminModule,
    GamificationModule,
    LearnModule,
    LeaguesModule,
    PortfoliosModule,
    OrdersModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
