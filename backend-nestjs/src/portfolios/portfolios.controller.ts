import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@Request() req, @Query('live') live: string) {
    return this.portfoliosService.findMine(req.user.userId, live === 'true');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    return this.portfoliosService.findOne(id, req.user.userId);
  }
}
