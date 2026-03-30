import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { OnboardingDto } from './dto/onboarding.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Post('onboarding')
    async onboarding(@Request() req, @Body() dto: OnboardingDto) {
        return this.usersService.completeOnboarding(req.user.id || req.user.sub, dto);
    }
}
