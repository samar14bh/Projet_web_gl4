
import { Controller, Get, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('member')
  @UseGuards(JwtAuthGuard)
  async getMemberDashboard(@Request() req) {
    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    
    const userId = req.user.userId;
    return this.dashboardService.getMemberDashboard(userId);
  }
}
