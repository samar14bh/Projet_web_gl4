import { DashboardStatsDto } from './dashboard-stats.dto';
import { UpcomingEventDto } from './upcoming-event.dto';

export class DashboardResponseDto {
  stats: DashboardStatsDto;
  upcomingEvents: UpcomingEventDto[];
}

