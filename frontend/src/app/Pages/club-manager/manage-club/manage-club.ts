import { Component, signal, computed, OnInit, effect, inject, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ClubManagerService } from '../../../Core/services/club-manager.service';
import { TabNavigationComponent } from '../../../shared/components/tab-navigation/tab-navigation';
import { TabItem } from '../../../shared/interfaces/components.interface';
import { ClubContextService } from '../../../Core/services/club-context.service';
import { Club } from '../../../Core/interfaces/club-manager.interface';
import {
  ManageClubState,
  ClubInfoState,
  ClubStatsState,
  NotificationState
} from '../../../Core/interfaces/club-management.interface';
import { ClubEvent } from '../../../shared/interfaces/club-management-models.interface';

// Dumb Components
import { DashboardHeroComponent } from '../../../shared/components/dashboard-hero/dashboard-hero';
import { ClubStatsSimpleGridComponent } from '../../../shared/components/club-stats-simple-grid/club-stats-simple-grid';
import { ClubInfoSectionComponent } from '../../../shared/components/club-info-section/club-info-section';
import { ClubEventsPreviewComponent } from '../../../shared/components/club-events-preview/club-events-preview';
import { ClubSettingsFormComponent } from '../../../shared/components/club-settings-form/club-settings-form';
import { NotificationToastComponent } from '../../../shared/components/notification-toast/notification-toast';


@Component({
  selector: 'app-manage-club',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TabNavigationComponent,
    DashboardHeroComponent,
    ClubStatsSimpleGridComponent,
    ClubInfoSectionComponent,
    ClubEventsPreviewComponent,
    ClubSettingsFormComponent,
    NotificationToastComponent
  ],
  templateUrl: './manage-club.html',
  styleUrl: './manage-club.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageClubComponent implements OnInit {
  // SERVICES
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clubContext = inject(ClubContextService);
  private clubManagerService = inject(ClubManagerService);
  private ngZone = inject(NgZone);

  // CONSOLIDATED STATE SIGNALS
  state = signal<ManageClubState>({
    clubId: null,
    activeTab: 'info',
    saving: false
  });

  clubInfo = signal<ClubInfoState>({
    name: '',
    description: '',
    email: '',
    logo: '',
    coverImage: '',
    categoryId: null,
    categoryName: '',
    categoryIcon: '',
    isPublic: false,
    membershipFee: 0,
    approvalRequired: true,
    isActive: true,
    creationDate: ''
  });

  stats = signal<ClubStatsState>({
    totalMembers: 0,
    totalEvents: 0,
    pendingRequests: 0,
    monthlyRevenue: 0
  });

  notification = signal<NotificationState>({
    type: null,
    message: ''
  });

  // EVENTS DATA
  upcomingEvents = signal<ClubEvent[]>([]);

  // SETTINGS FORM - Separate writable signals for two-way binding
  settingsIsPublic = signal<boolean>(false);
  settingsMembershipFee = signal<number>(0);
  settingsApprovalRequired = signal<boolean>(true);
  internalRole = signal<string>('MEMBER');

  // CONFIGURATION DES ONGLETS
  tabs = computed<TabItem[]>(() => {
    const role = this.internalRole().toUpperCase();
    const isPresident = role === 'PRESIDENT';

    const baseTabs: TabItem[] = [
      { id: 'info', label: 'Informations', icon: 'info-circle' },
      { id: 'events', label: 'Événements', icon: 'calendar-event' },
    ];

    if (isPresident) {
      baseTabs.push({ id: 'settings', label: 'Paramètres', icon: 'gear' });
    }

    return baseTabs;
  });

  // CATEGORY COLOR MAPPING
  private categoryColorMap: Record<string, string> = {
    'Sports': '#EF4444',
    'Culture': '#F59E0B',
    'Éducation': '#3B82F6',
    'Social': '#10B981',
    'Loisir': '#8B5CF6',
    'Professionnel': '#06B6D4'
  };

  // COMPUTED SIGNALS
  categoryColor = computed(() => {
    return this.categoryColorMap[this.clubInfo().categoryName] || '#6B7280';
  });

  private notificationTimeout: any;

  constructor() {
    effect(() => {
      const id = this.state().clubId;
      if (id) {
        this.loadClubData();
      }
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['clubId'];
      if (id) {
        this.state.update(s => ({ ...s, clubId: +id }));
        this.clubContext.setCurrentClub(+id);
        this.loadInternalRole(+id);
      } else {
        this.router.navigate(['/club-manager/select']);
      }
    });
  }

  // GESTION DES NOTIFICATIONS
  showNotification(type: 'success' | 'error', message: string) {
    this.notification.set({ type, message });

    // Clear any existing timeout
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    // Auto-hide after 4 seconds
    this.ngZone.runOutsideAngular(() => {
      this.notificationTimeout = setTimeout(() => {
        this.ngZone.run(() => {
          this.notification.set({ type: null, message: '' });
        });
      }, 4000);
    });
  }

  closeNotification() {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    this.notification.set({ type: null, message: '' });
  }

  loadInternalRole(clubId: number) {
    this.clubManagerService.getMyRole(clubId).subscribe({
      next: (res) => {
        this.internalRole.set(res.role || 'MEMBER');
      },
      error: (err) => {
        console.error('Erreur chargement rôle:', err);
        this.internalRole.set('MEMBER');
      }
    });
  }

  // CHARGEMENT DES DONNÉES
  loadClubData() {
    const clubId = this.state().clubId;
    if (!clubId) return;

    // Charger les détails du club
    this.clubManagerService.getClubDetails(clubId).subscribe({
      next: (club: Club) => {
        this.clubInfo.set({
          name: club.name || '',
          description: club.description || '',
          email: club.contactEmail || '',
          logo: club.logo || '',
          coverImage: club.coverImage || '',
          categoryId: club.category?.id || null,
          categoryName: club.category?.name || '',
          categoryIcon: club.category?.icon || '',
          isPublic: club.isPublic ?? false,
          membershipFee: club.membershipFeeAmount || 0,
          approvalRequired: club.approvalRequired ?? true,
          isActive: club.isActive ?? true,
          creationDate: club.creationDate || ''
        });

        // Sync settings form signals
        this.settingsIsPublic.set(club.isPublic ?? false);
        this.settingsMembershipFee.set(club.membershipFeeAmount || 0);
        this.settingsApprovalRequired.set(club.approvalRequired ?? true);
      },
      error: (err) => {
        console.error('Erreur chargement détails club:', err);
      }
    });

    // Charger les statistiques détaillées
    this.clubManagerService.getClubDetailedStats(clubId).subscribe({
      next: (statsData) => {
        this.stats.set({
          totalMembers: statsData.totalMembers || 0,
          totalEvents: statsData.totalEvents || 0,
          pendingRequests: statsData.pendingRequests || 0,
          monthlyRevenue: statsData.monthlyRevenue || 0
        });
      },
      error: (err) => {
        console.error('Erreur chargement statistiques:', err);
      }
    });

    // Charger les événements à venir
    this.clubManagerService.getUpcomingEvents(clubId).subscribe({
      next: (events: any[]) => {
        const mapped = (events || []).map((e: any) => ({
          id: e.id,
          title: e.name || e.title,
          date: e.startDate,
          participants: e.capacity || 0
        }));
        this.upcomingEvents.set(mapped);
      },
      error: (err) => {
        console.error('Erreur chargement événements:', err);
      }
    });
  }

  // GESTION DES ONGLETS
  onTabChange(tabId: string) {
    this.state.update(s => ({ ...s, activeTab: tabId }));
  }

  // ACTIONS DE NAVIGATION
  goBack() {
    this.router.navigate(['/club-manager', this.state().clubId, 'dashboard']);
  }

  navigateToEvents() {
    const clubId = this.state().clubId;
    if (clubId) {
      this.router.navigate([`/events`], { queryParams: { clubId } });
    }
  }

  // ACTIONS DE SAUVEGARDE
  saveSettings() {
    this.state.update(s => ({ ...s, saving: true }));
    const clubId = this.state().clubId;
    if (!clubId) return;

    this.clubManagerService
      .updateClubSettings(clubId, {
        isPublic: this.settingsIsPublic(),
        membershipFeeAmount: Number(this.settingsMembershipFee()),
        approvalRequired: this.settingsApprovalRequired()
      })
      .subscribe({
        next: () => {
          this.state.update(s => ({ ...s, saving: false }));
          // Update clubInfo to match settings
          this.clubInfo.update(info => ({
            ...info,
            isPublic: this.settingsIsPublic(),
            membershipFee: this.settingsMembershipFee(),
            approvalRequired: this.settingsApprovalRequired()
          }));
          this.showNotification('success', 'Paramètres mis à jour avec succès');
        },
        error: (err) => {
          this.state.update(s => ({ ...s, saving: false }));
          console.error('Erreur sauvegarde paramètres:', err);
          this.showNotification('error', 'Erreur lors de la mise à jour des paramètres');
        }
      });
  }

  // HANDLE TWO-WAY BINDING UPDATES FROM SETTINGS FORM
  onIsPublicChange(value: boolean) {
    this.clubInfo.update(info => ({ ...info, isPublic: value }));
  }

  onMembershipFeeChange(value: number) {
    this.clubInfo.update(info => ({ ...info, membershipFee: value }));
  }

  onApprovalRequiredChange(value: boolean) {
    this.clubInfo.update(info => ({ ...info, approvalRequired: value }));
  }
}
