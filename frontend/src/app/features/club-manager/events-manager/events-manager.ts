import {
  Component,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { EventService } from '../../../Core/services/event.service';
import {
  Event,
  EventStatus,
  EventFilters,
  PaginatedResponse,
} from '../../../Core/models/event.model';
import { ButtonComponent } from '../../../shared/components/button/button';
import { ModalComponent } from '../../../shared/components/modal/modal';

/**
 * PAGE 15 : Gérer les événements
 * Composant moderne Angular 20 avec Signals
 * Compatible avec le mode zoneless
 */
@Component({
  selector: 'app-events-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, ModalComponent],
  templateUrl: './events-manager.html',
  styleUrl: './events-manager.css',
})
export class EventsManagerComponent {
  private readonly eventService = inject(EventService);

  // ========== SIGNALS D'ÉTAT ==========

  // Onglet actif (À venir, Passés, Brouillons)
  activeTab = signal<'upcoming' | 'past' | 'drafts'>('upcoming');

  // Filtres de recherche
  searchQuery = signal('');
  selectedStatus = signal<EventStatus | 'all'>('all');
  sortBy = signal<'date' | 'title' | 'registrations'>('date');
  sortOrder = signal<'asc' | 'desc'>('desc');

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);

  // État du modal
  isModalOpen = signal(false);
  selectedEvent = signal<Event | null>(null);

  // États de chargement
  isDeleting = signal(false);

  // ========== COMPUTED SIGNALS ==========

  // Filtres combinés pour l'API
  filters = computed<EventFilters>(() => {
    const tab = this.activeTab();
    const filters: EventFilters = {
      search: this.searchQuery() || undefined,
      sortBy: this.sortBy(),
      order: this.sortOrder(),
      page: this.currentPage(),
      limit: this.pageSize(),
    };

    // Filtrer par statut selon l'onglet
    if (tab === 'upcoming') {
      filters.status = EventStatus.UPCOMING;
    } else if (tab === 'past') {
      filters.status = EventStatus.COMPLETED;
    }

    // Ajouter le filtre de statut si sélectionné
    if (this.selectedStatus() !== 'all') {
      filters.status = this.selectedStatus() as EventStatus;
    }

    return filters;
  });

  // ========== RESOURCE POUR LES ÉVÉNEMENTS (rxResource) ==========

  /**
   * rxResource gère automatiquement le chargement, les erreurs et les données
   * C'est la façon moderne de gérer les observables en Angular 20 zoneless
   */
  eventsResource = rxResource({
    params: this.filters,
    stream: ({ params }) => this.eventService.getEvents(params),
  });

  // Computed signals dérivés de la resource
  events = computed(() => this.eventsResource.value()?.data ?? []);
  totalEvents = computed(() => this.eventsResource.value()?.total ?? 0);
  totalPages = computed(() => this.eventsResource.value()?.totalPages ?? 0);
  isLoading = computed(() => this.eventsResource.isLoading());
  hasError = computed(() => !!this.eventsResource.error());
  error = computed(() => this.eventsResource.error());

  // ========== CONSTRUCTEUR ==========

  constructor() {
    // Plus besoin de charger manuellement, rxResource le fait automatiquement
  }

  /**
   * Recharger les événements manuellement
   * Utilisé après création/suppression/modification
   */
  reloadEvents(): void {
    this.eventsResource.reload();
  }

  // ========== ÉNUMÉRATIONS POUR LE TEMPLATE ==========
  EventStatus = EventStatus;

  // ========== MÉTHODES ==========

  /**
   * Changer d'onglet
   */
  setActiveTab(tab: 'upcoming' | 'past' | 'drafts') {
    this.activeTab.set(tab);
    this.currentPage.set(1); // Reset pagination
    // rxResource se met à jour automatiquement quand filters() change
  }

  /**
   * Rechercher des événements
   */
  onSearch(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    // rxResource se met à jour automatiquement
  }

  /**
   * Changer le tri
   */
  changeSortBy(field: 'date' | 'title' | 'registrations') {
    if (this.sortBy() === field) {
      // Toggle l'ordre si même champ
      this.sortOrder.update((order) => (order === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('desc');
    }
    // rxResource se met à jour automatiquement
  }

  /**
   * Changer de page
   */
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      // rxResource se met à jour automatiquement
    }
  }

  /**
   * Ouvrir le modal de création
   */
  openCreateModal() {
    this.selectedEvent.set(null);
    this.isModalOpen.set(true);
  }

  /**
   * Ouvrir le modal d'édition
   */
  openEditModal(event: Event) {
    this.selectedEvent.set(event);
    this.isModalOpen.set(true);
  }

  /**
   * Fermer le modal
   */
  closeModal() {
    this.isModalOpen.set(false);
    this.selectedEvent.set(null);
  }

  /**
   * Supprimer un événement
   */
  async deleteEvent(event: Event) {
    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer l'événement "${event.title}" ?`
    );

    if (!confirmed) return;

    this.isDeleting.set(true);

    try {
      await this.eventService.deleteEvent(event.id).toPromise();
      // Recharger la liste avec rxResource
      this.reloadEvents();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'événement');
    } finally {
      this.isDeleting.set(false);
    }
  }

  /**
   * Dupliquer un événement
   */
  duplicateEvent(event: Event) {
    // TODO: Implémenter la duplication
    console.log('Dupliquer:', event);
  }

  /**
   * Voir les inscrits
   */
  viewRegistrations(event: Event) {
    // TODO: Ouvrir modal des inscrits
    console.log('Voir inscrits:', event);
  }

  /**
   * Scanner les QR codes
   */
  scanQRCodes(event: Event) {
    // TODO: Ouvrir scanner QR
    console.log('Scanner QR:', event);
  }

  /**
   * Formater une date
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  /**
   * Formater l'heure
   */
  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Obtenir le badge de statut
   */
  getStatusBadgeClass(status: EventStatus): string {
    const classes = {
      [EventStatus.UPCOMING]: 'badge-info',
      [EventStatus.ONGOING]: 'badge-success',
      [EventStatus.COMPLETED]: 'badge-secondary',
      [EventStatus.CANCELLED]: 'badge-danger',
    };
    return classes[status] || 'badge-secondary';
  }

  /**
   * Obtenir le label du statut
   */
  getStatusLabel(status: EventStatus): string {
    const labels = {
      [EventStatus.UPCOMING]: 'À venir',
      [EventStatus.ONGOING]: 'En cours',
      [EventStatus.COMPLETED]: 'Terminé',
      [EventStatus.CANCELLED]: 'Annulé',
    };
    return labels[status] || status;
  }
}
