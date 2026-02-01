import {
  Component,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { AdminService } from '../../../Core/services/admin.service';
import {
  GlobalStats,
  TopClub,
  RecentActivity,
  MembershipTrendData,
  EventsTrendData,
  RevenueTrendData,
  Alert,
  ClubCategoryDistribution,
} from '../../../Core/models/admin.model';
import { ButtonComponent } from '../../../shared/components/button/button';
import { ToastService } from '../../../Core/services/toast.service';

/**
 * PAGE 17 : Admin Dashboard
 * Tableau de bord administrateur avec vue d'ensemble globale
 * Optimisé Angular 20 avec Signals et OnPush
 */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ OnPush
})
export class AdminDashboardComponent {
  // ========== SERVICES ==========
  private readonly adminService = inject(AdminService);
  private readonly toastService = inject(ToastService);

  // ========== SIGNALS D'ÉTAT ==========
  readonly selectedPeriod = signal<'week' | 'month' | 'quarter' | 'year'>('month');

  // ========== RESOURCES (rxResource avec API) ==========

  /**
   * Resource pour les statistiques globales
   */
  readonly statsResource = rxResource({
    params: computed(() => ({
      period: this.selectedPeriod(),
    })),
    stream: ({ params }) => this.adminService.getGlobalStats(params.period),
  });

  /**
   * Resource pour les clubs les plus actifs
   */
  readonly topClubsResource = rxResource({
    params: computed(() => ({
      period: this.selectedPeriod(),
      limit: 4,
    })),
    stream: ({ params }) =>
      this.adminService.getTopClubs(params.period, params.limit),
  });

  /**
   * Resource pour les activités récentes
   */
  readonly activitiesResource = rxResource({
    params: computed(() => ({ limit: 5 })),
    stream: ({ params }) => this.adminService.getRecentActivities(params.limit),
  });

  /**
   * Resource pour la tendance des membres
   */
  readonly membershipTrendResource = rxResource({
    params: computed(() => ({ months: 6 })),
    stream: ({ params }) => this.adminService.getMembershipTrend(params.months),
  });

  /**
   * Resource pour la tendance des événements
   */
  readonly eventsTrendResource = rxResource({
    params: computed(() => ({ months: 6 })),
    stream: ({ params }) => this.adminService.getEventsTrend(params.months),
  });

  /**
   * Resource pour la tendance des revenus
   */
  readonly revenueTrendResource = rxResource({
    params: computed(() => ({ months: 6 })),
    stream: ({ params }) => this.adminService.getRevenueTrend(params.months),
  });

  /**
   * Resource pour les alertes
   */
  readonly alertsResource = rxResource({
    params: computed(() => ({})),
    stream: () => this.adminService.getAlerts(),
  });

  /**
   * Resource pour la distribution des clubs
   */
  readonly clubsByCategoryResource = rxResource({
    params: computed(() => ({})),
    stream: () => this.adminService.getClubsByCategory(),
  });

  // ========== COMPUTED SIGNALS DÉRIVÉS ==========

  readonly globalStats = computed(
    () => this.statsResource.value() ?? this.getDefaultStats(),
  );
  readonly topClubs = computed(() => this.topClubsResource.value() ?? []);
  readonly recentActivities = computed(() => this.activitiesResource.value() ?? []);
  readonly membershipTrend = computed(
    () => this.membershipTrendResource.value() ?? [],
  );
  readonly eventsTrend = computed(() => this.eventsTrendResource.value() ?? []);
  readonly revenueTrend = computed(() => this.revenueTrendResource.value() ?? []);
  readonly alerts = computed(() => this.alertsResource.value() ?? []);
  readonly clubsByCategory = computed(
    () => this.clubsByCategoryResource.value() ?? [],
  );

  // États de chargement
  readonly isLoading = computed(
    () => this.statsResource.isLoading() || this.topClubsResource.isLoading(),
  );

  readonly hasError = computed(
    () => !!this.statsResource.error() || !!this.topClubsResource.error(),
  );

  // ========== COMPUTED CALCULATIONS ==========

  /**
   * Taux de croissance des membres
   */
  readonly memberGrowthRate = computed(() => {
    const trend = this.membershipTrend();
    if (trend.length < 2) return '0.0';
    const current = trend[trend.length - 1].count;
    const previous = trend[trend.length - 2].count;
    return (((current - previous) / previous) * 100).toFixed(1);
  });

  /**
   * Taux de clubs actifs
   */
  readonly activeClubsRate = computed(() => {
    const stats = this.globalStats();
    if (stats.totalClubs === 0) return '0.0';
    return ((stats.activeClubs / stats.totalClubs) * 100).toFixed(1);
  });

  // ========== TRACKBY FUNCTIONS ==========
  // ✅ TrackBy pour optimiser le rendu des listes
  readonly trackByAlertId = (_index: number, alert: Alert) => alert.id;
  readonly trackByClubId = (_index: number, club: TopClub) => club.id;
  readonly trackByActivityId = (_index: number, activity: RecentActivity) =>
    activity.id;
  readonly trackByMonth = (_index: number, data: any) => data.month;
  readonly trackByCategory = (_index: number, data: ClubCategoryDistribution) =>
    data.category;

  // ========== MÉTHODES UTILITAIRES (PURES) ==========

  /**
   * Formater un nombre avec séparateurs
   */
  formatNumber(num: number): string {
    return num.toLocaleString('fr-FR');
  }

  /**
   * Formater un montant en TND
   */
  formatCurrency(amount: number): string {
    return `${amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} TND`;
  }

  /**
   * Formater un timestamp relatif
   */
  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays} jours`;
  }

  /**
   * Obtenir la classe CSS selon le type d'alerte
   */
  getAlertClass(type: string): string {
    const classes: Record<string, string> = {
      success: 'alert-success',
      info: 'alert-info',
      warning: 'alert-warning',
      danger: 'alert-danger',
    };
    return classes[type] || 'alert-info';
  }

  /**
   * Obtenir la classe CSS selon le type d'activité
   */
  getActivityIconClass(color: string): string {
    return `activity-icon activity-icon-${color}`;
  }

  /**
   * Obtenir les statistiques par défaut (fallback)
   */
  private getDefaultStats(): GlobalStats {
    return {
      totalClubs: 0,
      activeClubs: 0,
      totalMembers: 0,
      totalEvents: 0,
      upcomingEvents: 0,
      totalRevenue: 0,
      pendingApprovals: 0,
      newMembersThisMonth: 0,
    };
  }

  // ========== ACTIONS ==========

  /**
   * Changer la période des statistiques
   */
  changePeriod(period: 'week' | 'month' | 'quarter' | 'year'): void {
    this.selectedPeriod.set(period);
    // rxResource recharge automatiquement les données
  }

  /**
   * Rafraîchir toutes les données
   */
  refreshData(): void {
    this.statsResource.reload();
    this.topClubsResource.reload();
    this.activitiesResource.reload();
    this.membershipTrendResource.reload();
    this.eventsTrendResource.reload();
    this.revenueTrendResource.reload();
    this.alertsResource.reload();
    this.clubsByCategoryResource.reload();
    this.toastService.success('Données actualisées avec succès !');
  }

  /**
   * Exporter le rapport
   */
  async exportReport(format: 'pdf' | 'excel'): Promise<void> {
    try {
      const period = this.selectedPeriod();
      const blob =
        format === 'pdf'
          ? await this.adminService.exportReportPDF(period).toPromise()
          : await this.adminService.exportReportExcel(period).toPromise();

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const extension = format === 'pdf' ? 'pdf' : 'xlsx';
        link.download = `rapport-admin-${period}.${extension}`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.toastService.success(`Rapport ${format.toUpperCase()} téléchargé avec succès !`);
      }
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      this.toastService.error(`Erreur lors de l'export en ${format.toUpperCase()}`);
    }
  }
}
