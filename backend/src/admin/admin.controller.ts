import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';

/**
 * Controller pour le dashboard administrateur
 * Route de base: /api/admin
 */
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /api/admin/stats
   * Récupérer les statistiques globales
   */
  @Get('stats')
  getGlobalStats(@Query('period') period: string = 'month') {
    return this.adminService.getGlobalStats(period);
  }

  /**
   * GET /api/admin/top-clubs
   * Récupérer les clubs les plus actifs
   */
  @Get('top-clubs')
  getTopClubs(
    @Query('period') period: string = 'month',
    @Query('limit') limit: string = '4',
  ) {
    return this.adminService.getTopClubs(period, parseInt(limit));
  }

  /**
   * GET /api/admin/activities
   * Récupérer les activités récentes
   */
  @Get('activities')
  getRecentActivities(@Query('limit') limit: string = '5') {
    return this.adminService.getRecentActivities(parseInt(limit));
  }

  /**
   * GET /api/admin/membership-trend
   * Récupérer la tendance des membres
   */
  @Get('membership-trend')
  getMembershipTrend(@Query('months') months: string = '6') {
    return this.adminService.getMembershipTrend(parseInt(months));
  }

  /**
   * GET /api/admin/events-trend
   * Récupérer la tendance des événements
   */
  @Get('events-trend')
  getEventsTrend(@Query('months') months: string = '6') {
    return this.adminService.getEventsTrend(parseInt(months));
  }

  /**
   * GET /api/admin/revenue-trend
   * Récupérer la tendance des revenus
   */
  @Get('revenue-trend')
  getRevenueTrend(@Query('months') months: string = '6') {
    return this.adminService.getRevenueTrend(parseInt(months));
  }

  /**
   * GET /api/admin/alerts
   * Récupérer les alertes
   */
  @Get('alerts')
  getAlerts() {
    return this.adminService.getAlerts();
  }

  /**
   * GET /api/admin/clubs-by-category
   * Récupérer la distribution des clubs par catégorie
   */
  @Get('clubs-by-category')
  getClubsByCategory() {
    return this.adminService.getClubsByCategory();
  }

  /**
   * GET /api/admin/dashboard
   * Récupérer toutes les données du dashboard en une seule requête
   */
  @Get('dashboard')
  async getDashboardData(@Query('period') period: string = 'month') {
    const [
      globalStats,
      topClubs,
      recentActivities,
      membershipTrend,
      eventsTrend,
      revenueTrend,
      alerts,
      clubsByCategory,
    ] = await Promise.all([
      this.adminService.getGlobalStats(period),
      this.adminService.getTopClubs(period, 4),
      this.adminService.getRecentActivities(5),
      this.adminService.getMembershipTrend(6),
      this.adminService.getEventsTrend(6),
      this.adminService.getRevenueTrend(6),
      this.adminService.getAlerts(),
      this.adminService.getClubsByCategory(),
    ]);

    return {
      globalStats,
      topClubs,
      recentActivities,
      membershipTrend,
      eventsTrend,
      revenueTrend,
      alerts,
      clubsByCategory,
    };
  }
}
