import { Component, signal, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ClubManagerService } from '../../../Core/services/club-manager.service';
import { TabNavigationComponent } from '../../../shared/components/tab-navigation/tab-navigation';
import { TabItem } from '../../../shared/interfaces/components.interface';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { ClubContextService } from '../../../Core/services/club-context.service';
import {Club} from '../../../Core/interfaces/club-manager.interface';


@Component({
  selector: 'app-manage-club',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TabNavigationComponent],
  templateUrl: './manage-club.html',
  styleUrl: './manage-club.css',
})
export class ManageClubComponent implements OnInit {
  // SERVICES
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clubContext = inject(ClubContextService);
  private clubManagerService = inject(ClubManagerService);

  // SIGNAUX - ÉTAT DE LA PAGE
  activeTab = signal<string>('info');
  clubId = signal<number | null>(null);
  saving = signal(false);

  // SIGNAUX - NOTIFICATION
  notification = signal<{
    type: 'success' | 'error' | null;
    message: string;
  }>({
    type: null,
    message: '',
  });
  notificationTimeout: any;

  // SIGNAUX - DONNÉES DU CLUB
  clubName = signal('');
  clubDescription = signal('');
  clubEmail = signal('');
  clubLogo = signal('');
  clubCoverImage = signal('');
  categoryId = signal<number | null>(null);
  categoryName = signal('');
  categoryIcon = signal('');
  isPublic = signal(false);
  membershipFee = signal<number>(0);
  approvalRequired = signal(true);
  isActive = signal(true);
  creationDate = signal<string>('');

  // SIGNAUX - STATISTIQUES
  totalMembers = signal(0);
  totalEvents = signal(0);
  pendingRequests = signal(0);
  totalRevenue = signal(0);
  monthlyRevenue = signal(0);

  // SIGNAUX - DONNÉES PRÉVISUALISÉES
  upcomingEvents = signal<any[]>([]);

  // CONFIGURATION DES ONGLETS
  tabs = signal<TabItem[]>([
    { id: 'info', label: 'Informations', icon: 'info-circle' },
    { id: 'events', label: 'Événements', icon: 'calendar-event' },
    { id: 'settings', label: 'Paramètres', icon: 'gear' },
  ]);

  // CATEGORY COLOR MAPPING
  categoryColorMap: Record<string, string> = {
    'Sports': '#EF4444',
    'Culture': '#F59E0B',
    'Éducation': '#3B82F6',
    'Social': '#10B981',
    'Loisir': '#8B5CF6',
    'Professionnel': '#06B6D4',
  };

  constructor() {
    effect(() => {
      const id = this.clubId();
      if (id) {
        this.loadClubData();
      }
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['clubId'];
      if (id) {
        this.clubId.set(+id);
        this.clubContext.setCurrentClub(+id);
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
    this.notificationTimeout = setTimeout(() => {
      this.notification.set({ type: null, message: '' });
    }, 4000);
  }

  closeNotification() {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    this.notification.set({ type: null, message: '' });
  }

  // CHARGEMENT DES DONNÉES
  loadClubData() {
    const clubId = this.clubId();
    if (!clubId) return;

    // Charger les détails du club
    this.clubManagerService.getClubDetails(clubId).subscribe({
      next: (club: Club) => {
        if (club.logo) this.clubLogo.set(club.logo);
        if (club.coverImage) this.clubCoverImage.set(club.coverImage);
        if (club.name) this.clubName.set(club.name);
        if (club.description) this.clubDescription.set(club.description);
        if (club.contactEmail) this.clubEmail.set(club.contactEmail);

        // Récupérer les données de la catégorie
        if (club.category) {
          this.categoryId.set(club.category.id);
          this.categoryName.set(club.category.name);
          this.categoryIcon.set(club.category.icon);
        }

        if (club.isPublic !== undefined) this.isPublic.set(club.isPublic);
        if (club.membershipFeeAmount)
          this.membershipFee.set(club.membershipFeeAmount);
        if (club.isActive !== undefined) this.isActive.set(club.isActive);
        if (club.creationDate) this.creationDate.set(club.creationDate);
        this.approvalRequired.set(club.approvalRequired ?? true);
      },
      error: (err) => {
        console.error('Erreur chargement détails club:', err);
      },
    });

    // Charger les statistiques détaillées
    this.clubManagerService.getClubDetailedStats(clubId).subscribe({
      next: (stats) => {
        this.totalMembers.set(stats.totalMembers || 0);
        this.totalEvents.set(stats.totalEvents || 0);
        this.pendingRequests.set(stats.pendingRequests || 0);
        this.totalRevenue.set(stats.totalRevenue || 0);
        this.monthlyRevenue.set(stats.monthlyRevenue || 0);
      },
      error: (err) => {
        console.error('Erreur chargement statistiques:', err);
      },
    });

    // Charger les événements à venir
    this.clubManagerService.getUpcomingEvents(clubId).subscribe({
      next: (events: any[]) => {
        const mapped = (events || []).map((e: any) => ({
          id: e.id,
          title: e.name || e.title,
          date: e.startDate,
          participants: e.capacity || 0,
        }));
        this.upcomingEvents.set(mapped);
      },
      error: (err) => {
        console.error('Erreur chargement événements:', err);
      },
    });
  }

  // GESTION DES ONGLETS
  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
  }

  // ACTIONS DE NAVIGATION
  goBack() {
    this.router.navigate(['/club-manager', this.clubId(), 'dashboard']);
  }

  // ACTIONS DE SAUVEGARDE
  saveClubInfo() {
    this.saving.set(true);
    const clubId = this.clubId();
    if (!clubId) return;

    this.clubManagerService
      .updateClub(clubId, {
        name: this.clubName(),
        description: this.clubDescription(),
        contactEmail: this.clubEmail(),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showNotification('success', 'Informations mises à jour avec succès');
        },
        error: (err) => {
          this.saving.set(false);
          console.error('Erreur sauvegarde info:', err);
          this.showNotification('error', 'Erreur lors de la mise à jour des informations');
        },
      });
  }

  saveSettings() {
    this.saving.set(true);
    const clubId = this.clubId();
    if (!clubId) return;

    this.clubManagerService
      .updateClubSettings(clubId, {
        isPublic: this.isPublic(),
        membershipFeeAmount: Number(this.membershipFee()),
        approvalRequired: this.approvalRequired(),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showNotification('success', 'Paramètres mis à jour avec succès');
        },
        error: (err) => {
          this.saving.set(false);
          console.error('Erreur sauvegarde paramètres:', err);
          this.showNotification('error', 'Erreur lors de la mise à jour des paramètres');
        },
      });
  }

  // NAVIGATION
  navigateToDashboard() {
    const clubId = this.clubId();
    if (clubId) {
      this.router.navigate([`/club-manager/${clubId}/dashboard`]);
    }
  }

  navigateToEvents() {
    const clubId = this.clubId();
    if (clubId) {
      this.router.navigate([`/events`], { queryParams: { clubId } });
    }
  }

  // GET CATEGORY INFO
  getCategoryInfo() {
    const color = this.categoryColorMap[this.categoryName()] || '#6B7280';
    const icon = this.categoryIcon() || 'bi-question-circle';
    return {
      name: this.categoryName(),
      color: color,
      icon: `bi ${icon}`,
    };
  }

  // FORMATAGE
  formatDate(dateString: string | null | undefined): string {
    try {
      if (!dateString) return '-';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString as string;
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      return dateString || '-';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}
