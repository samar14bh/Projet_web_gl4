import {
  Component,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { rxResource, toObservable } from '@angular/core/rxjs-interop';
import { Observable, map } from 'rxjs';
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
 * Version OPTIMALE : rxResource avec pipe(map()) pour async pipe
 * Les Observables sont transformés DIRECTEMENT dans le stream de rxResource
 */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  // ========== SERVICES ==========
  private readonly adminService = inject(AdminService);
  private readonly toastService = inject(ToastService);

  // ========== SIGNALS D'ÉTAT ==========
  readonly selectedPeriod = signal<'week' | 'month' | 'quarter' | 'year'>('month');

  // ========== RESOURCES avec pipe(map()) pour OBSERVABLES ==========

  /**
   * Resource pour les statistiques globales
   * Le service retourne Observable<GlobalStats>
   */
  readonly statsResource = rxResource({
    params: computed(() => ({ period: this.selectedPeriod() })),
    stream: ({ params }) =>
      this.adminService.getGlobalStats(params.period).pipe(
        map((stats) => stats)
      ),
  });

  /**
   * Resource pour les clubs les plus actifs
   */
  readonly topClubsResource = rxResource({
    params: computed(() => ({ period: this.selectedPeriod(), limit: 4 })),
    stream: ({ params }) =>
      this.adminService.getTopClubs(params.period, params.limit).pipe(
        map((clubs) => clubs)
      ),
  });

  /**
   * Resource pour les activités récentes
   */
  readonly activitiesResource = rxResource({
    params: computed(() => ({ limit: 5 })),
    stream: ({ params }) =>
      this.adminService.getRecentActivities(params.limit).pipe(
        map((activities) => activities)
      ),
  });

  /**
   * Resource pour la tendance des membres
   */
  readonly membershipTrendResource = rxResource({
    params: computed(() => ({ months: 6 })),
    stream: ({ params }) =>
      this.adminService.getMembershipTrend(params.months).pipe(
        map((trend) => trend)
      ),
  });

  /**
   * Resource pour la tendance des événements
   */
  readonly eventsTrendResource = rxResource({
    params: computed(() => ({ months: 6 })),
    stream: ({ params }) =>
      this.adminService.getEventsTrend(params.months).pipe(
        map((events) => events)
      ),
  });

  /**
   * Resource pour la tendance des revenus
   */
  readonly revenueTrendResource = rxResource({
    params: computed(() => ({ months: 6 })),
    stream: ({ params }) =>
      this.adminService.getRevenueTrend(params.months).pipe(
        map((revenue) => revenue)
      ),
  });

  /**
   * Resource pour les alertes
   */
  readonly alertsResource = rxResource({
    params: computed(() => ({})),
    stream: () =>
      this.adminService.getAlerts().pipe(
        map((alerts) => alerts)
      ),
  });

  /**
   * Resource pour la distribution des clubs
   */
  readonly clubsByCategoryResource = rxResource({
    params: computed(() => ({})),
    stream: () =>
      this.adminService.getClubsByCategory().pipe(
        map((categories) => categories)
      ),
  });

  // ========== CONVERSION rxResource → OBSERVABLES pour ASYNC PIPE ==========

  /**
   * Observable pour globalStats (utilisé avec async pipe dans template)
   */
  readonly globalStats$: Observable<GlobalStats | undefined> = toObservable(
    computed(() => this.statsResource.value())
  );

  /**
   * Observable pour topClubs
   */
  readonly topClubs$: Observable<TopClub[] | undefined> = toObservable(
    computed(() => this.topClubsResource.value())
  );

  /**
   * Observable pour recentActivities
   */
  readonly recentActivities$: Observable<RecentActivity[] | undefined> = toObservable(
    computed(() => this.activitiesResource.value())
  );

  /**
   * Observable pour membershipTrend
   */
  readonly membershipTrend$: Observable<MembershipTrendData[] | undefined> = toObservable(
    computed(() => this.membershipTrendResource.value())
  );

  /**
   * Observable pour eventsTrend
   */
  readonly eventsTrend$: Observable<EventsTrendData[] | undefined> = toObservable(
    computed(() => this.eventsTrendResource.value())
  );

  /**
   * Observable pour revenueTrend
   */
  readonly revenueTrend$: Observable<RevenueTrendData[] | undefined> = toObservable(
    computed(() => this.revenueTrendResource.value())
  );

  /**
   * Observable pour alerts
   */
  readonly alerts$: Observable<Alert[] | undefined> = toObservable(
    computed(() => this.alertsResource.value())
  );

  /**
   * Observable pour clubsByCategory
   */
  readonly clubsByCategory$: Observable<ClubCategoryDistribution[] | undefined> = toObservable(
    computed(() => this.clubsByCategoryResource.value())
  );

  // ========== COMPUTED SIGNALS DÉRIVÉS (Observable) ==========

  /**
   * Taux de croissance des membres
   */
  readonly memberGrowthRate$: Observable<string> = this.membershipTrend$.pipe(
    map((trend) => {
      if (!trend || trend.length < 2) return '0.0';
      const current = trend[trend.length - 1].count;
      const previous = trend[trend.length - 2].count;
      return (((current - previous) / previous) * 100).toFixed(1);
    })
  );

  /**
   * Taux de clubs actifs
   */
  readonly activeClubsRate$: Observable<string> = this.globalStats$.pipe(
    map((stats) => {
      if (!stats || stats.totalClubs === 0) return '0.0';
      return ((stats.activeClubs / stats.totalClubs) * 100).toFixed(1);
    })
  );

  // ========== ÉTATS DE CHARGEMENT (Signals - pas besoin d'async pipe) ==========
  readonly isLoading = computed(
    () => this.statsResource.isLoading() || this.topClubsResource.isLoading(),
  );

  readonly hasError = computed(
    () => !!this.statsResource.error() || !!this.topClubsResource.error(),
  );

  // ========== TRACKBY FUNCTIONS ==========
  readonly trackByAlertId = (_index: number, alert: Alert) => alert.id;
  readonly trackByClubId = (_index: number, club: TopClub) => club.id;
  readonly trackByActivityId = (_index: number, activity: RecentActivity) =>
    activity.id;
  readonly trackByMonth = (_index: number, data: any) => data.month;
  readonly trackByCategory = (_index: number, data: ClubCategoryDistribution) =>
    data.category;

  // ========== MÉTHODES UTILITAIRES (PURES) ==========

  formatNumber(num: number): string {
    return num.toLocaleString('fr-FR');
  }

  formatCurrency(amount: number): string {
    return `${amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} TND`;
  }

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

  getAlertClass(type: string): string {
    const classes: Record<string, string> = {
      success: 'alert-success',
      info: 'alert-info',
      warning: 'alert-warning',
      danger: 'alert-danger',
    };
    return classes[type] || 'alert-info';
  }

  getActivityIconClass(color: string): string {
    return `activity-icon activity-icon-${color}`;
  }

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

  changePeriod(period: 'week' | 'month' | 'quarter' | 'year'): void {
    this.selectedPeriod.set(period);
  }

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
