
import { Controller, Get,  Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';



@Controller('dashboard')

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('member')
  
  async getMemberDashboard(@Req() req) {
    const userId = req.user.id;
    return this.dashboardService.getMemberDashboard(userId);
  }
}