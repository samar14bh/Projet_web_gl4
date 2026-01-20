import { Component, signal, computed, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ClubManagerService } from '../../../Core/services/club-manager.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { ClubContextService } from '../../../Core/services/club-context.service';

interface Member {
  id: number;
  name: string;
  lastName: string;
  email: string;
  joinDate: string;
  status?: string;
}
interface Event {
  id: number;
  name: string;
  startDate: string;
  endDate?: string;
  description?: string;
}
/**
 * PAGE: Tableau de Bord du Gestionnaire de Club
 * Route: /club-manager/:clubId/dashboard
 *
 * Affiche un aperçu complet de la gestion du club avec:
 * - Statistiques clés (membres, événements, demandes, finances)
 * - Listes des demandes, membres et événements récents
 * - Actions rapides pour la gestion
 */
@Component({
  selector: 'app-club-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class ClubManagerDashboardComponent implements OnInit {
  // ============================================
  // SERVICES
  // ============================================
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clubContext = inject(ClubContextService);
  public clubManagerService = inject(ClubManagerService);

  // ============================================
  // SIGNAUX - PARAMÈTRES
  // ============================================
  /** ID du club extrait de l'URL */
  clubId = signal<number | null>(null);

  /** Données locales des membres récents */
  recentMembersData = signal<Member[]>([]);

  /** Données locales des événements à venir */
  upcomingEventsData = signal<Event[]>([]);

  // ============================================
  // SIGNAUX CALCULÉS - DONNÉES AFFICHÉES
  // ============================================

  /** Statistiques du club */
  stats = computed(() => this.clubManagerService.clubStats());

  /** Demandes d'adhésion en attente */
  pendingMembers = computed(() => this.clubManagerService.pendingMembers());

  /** Afficher seulement les 5 premières demandes */
  displayedPendingMembers = computed(() => this.pendingMembers().slice(0, 5));

  /** Membres récents */
  recentMembers = computed(() => this.recentMembersData());

  /** Afficher seulement les 5 premiers membres */
  displayedRecentMembers = computed(() => this.recentMembers().slice(0, 5));

  /** Événements à venir */
  upcomingEvents = computed(() => this.upcomingEventsData());

  /** Afficher seulement les 5 premiers événements */
  displayedEvents = computed(() => this.upcomingEvents().slice(0, 5));

  /** État de chargement */
  loading = computed(() => this.clubManagerService.loading());

  // ============================================
  // CONSTRUCTEUR
  // ============================================
  constructor() {
    // Recharger les données quand l'ID du club change
    effect(() => {
      const id = this.clubId();
      if (id) {
        this.loadDashboardData();
      }
    });
  }

  // ============================================
  // CYCLE DE VIE
  // ============================================
  ngOnInit() {
    // Extraire l'ID du club depuis les paramètres d'URL
    this.route.params.subscribe(params => {
      const id = params['clubId'];
      if (id) {
        this.clubId.set(+id);
        this.clubContext.setCurrentClub(+id);
      } else {
        // Si pas d'ID, rediriger
        this.router.navigate(['/club-manager/select']);
      }
    });
  }

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================

  /**
   * Charger toutes les données du dashboard
   */
  loadDashboardData() {
    const clubId = this.clubId();
    if (!clubId) return;

    // Charger les statistiques
    this.clubManagerService.getClubDetailedStats(clubId).subscribe();

    // Charger les demandes en attente
    this.clubManagerService.getMembers(clubId, 'PENDING').subscribe();

    // Charger les membres récents
    this.clubManagerService.getMembers(clubId, 'APPROVED').subscribe({
      next: (members) => {
        // Trier par date de création (plus récent d'abord) et garder les 5 premiers
        const sorted = (members as Member[])
          .sort((a, b) => {
            const dateA = new Date(a.joinDate || 0).getTime();
            const dateB = new Date(b.joinDate || 0).getTime();
            return dateB - dateA;
          });
        this.recentMembersData.set(sorted);
      },
      error: (err) => console.error('Erreur lors du chargement des membres:', err)
    });

    // Charger les événements à venir
    this.clubManagerService.getUpcomingEvents(clubId).subscribe({
      next: (events: any[]) => {
        // Trier par date (plus proche d'abord)
        const sorted = (events || [])
          .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        this.upcomingEventsData.set(sorted);
      },
      error: (err: any) => console.error('Erreur lors du chargement des événements:', err)
    });
  }

  // ============================================
  // ACTIONS - GESTION DES DEMANDES
  // ============================================

  /**
   * Approuver une demande d'adhésion
   */
  approveMember(membershipId: number) {
    const clubId = this.clubId();
    if (!clubId) return;

    this.clubManagerService.updateMemberStatus(membershipId, 'APPROVED').subscribe({
      next: () => {
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Erreur lors de l\'approbation:', err);
        alert('Erreur lors de l\'approbation du membre');
      }
    });
  }

  /**
   * Rejeter une demande d'adhésion
   */
  rejectMember(membershipId: number) {
    const clubId = this.clubId();
    if (!clubId) return;

    this.clubManagerService.updateMemberStatus(membershipId, 'REJECTED').subscribe({
      next: () => {
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Erreur lors du rejet:', err);
        alert('Erreur lors du rejet du membre');
      }
    });
  }

  // ============================================
  // NAVIGATION
  // ============================================

  /**
   * Naviguer vers la gestion complète des membres
   */
  navigateToMembers() {
    const clubId = this.clubId();
    if (clubId) {
      this.router.navigate([`/club-manager/${clubId}/manage-members`]);
    }
  }

  /**
   * Naviguer vers la liste complète des membres
   */
  navigateToAllMembers() {
    const clubId = this.clubId();
    if (clubId) {
      this.router.navigate([`/club-manager/${clubId}/manage-members`]);
    }
  }

  /**
   * Naviguer vers la liste complète des événements
   */
  navigateToAllEvents() {
    /*const clubId = this.clubId();
    if (clubId) {
      this.router.navigate([`/club-manager/${clubId}/events`]);
    }*/
    this.router.navigate([`/events`], { queryParams: { clubId: this.clubId() } });
  }

  /**
   * Naviguer vers la création d'événement
   */
  navigateToCreateEvent() {
    const clubId = this.clubId();
    if (clubId) {
      this.router.navigate([`/events/create`], { queryParams: { clubId } });
    }
  }

  /**
   * Naviguer vers la gestion des membres
   */
  navigateToManageMembers() {
    const clubId = this.clubId();
    if (clubId) {
      this.router.navigate([`/club-manager/${clubId}/manage-members`]);
    }
  }

  /**
   * Naviguer vers la gestion du club
   */
  navigateToManageClub() {
    const clubId = this.clubId();
    if (clubId) {
      this.router.navigate([`/club-manager/${clubId}/manage-club`]);
    }
  }

  /**
   * Naviguer vers les finances
   */
  navigateToFinances() {
    const clubId = this.clubId();
    if (clubId) {
      this.router.navigate([`/finances`], { queryParams: { clubId } });
    }
  }

  // ============================================
  // FORMATAGE
  // ============================================

  /**
   * Formater un montant en dinars tunisiens
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Formater une date
   */
  formatDate(dateString: string | undefined | null): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
