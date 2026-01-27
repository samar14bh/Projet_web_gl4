import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
  Res,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ExportService } from './export.service';
import express from 'express';

/**
 * Controller pour le dashboard administrateur
 * Route de base: /api/admin
 */
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly exportService: ExportService,
  ) {}

  /**
   * GET /api/admin/export/pdf
   * Exporter un rapport en PDF
   */
  @Get('export/pdf')
  async exportReportPDF(
    @Query('period') period: 'week' | 'month' | 'quarter' | 'year' = 'month',
    @Res() res: express.Response,
  ) {
    try {
      // Récupérer les statistiques
      const stats = await this.adminService.getGlobalStats(period);

      // Générer le PDF
      const pdfBuffer = await this.exportService.generatePDF(stats, period);

      // Envoyer la réponse
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=rapport-admin-${period}-${Date.now()}.pdf`,
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Erreur export PDF:', error);
      res.status(500).json({
        message: 'Erreur lors de la génération du PDF',
        error: error.message,
      });
    }
  }
  /**
   * GET /api/admin/export/excel
   * Exporter un rapport en Excel
   */
  @Get('export/excel')
  async exportReportExcel(
    @Query('period') period: 'week' | 'month' | 'quarter' | 'year' = 'month',
    @Res() res: express.Response,
  ) {
    try {
      // Récupérer les statistiques et les top clubs
      const stats = await this.adminService.getGlobalStats(period);
      const topClubs = await this.adminService.getTopClubs(period, 10);

      // Générer l'Excel
      const excelBuffer = await this.exportService.generateExcel(
        stats,
        topClubs,
        period,
      );

      // Envoyer la réponse avec les bons headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="rapport-admin-${period}-${Date.now()}.xlsx"`,
      );
      res.setHeader('Content-Length', excelBuffer.length);

      // Envoyer le buffer directement
      return res.end(excelBuffer, 'binary');
    } catch (error) {
      console.error('Erreur export Excel:', error);
      return res.status(500).json({
        message: 'Erreur lors de la génération du fichier Excel',
        error: error.message,
      });
    }
  }

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
