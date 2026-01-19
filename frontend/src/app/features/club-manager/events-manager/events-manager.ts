import {
  Component,
  signal,
  computed,
  inject,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {rxResource} from '@angular/core/rxjs-interop';
import {EventService} from '../../../Core/services/event.service';
import {Event, EventFilters} from '../../../Core/models/event.model';
import {EventStatus} from '../../../Core/models/event.model';
import {ButtonComponent} from '../../../shared/components/button/button';
import {ModalComponent} from '../../../shared/components/modal/modal';
import {EventFormComponent} from '../events/event-form/event-form';
import {RegistrationsModalComponent} from '../events/registrations-modal/registrations-modal';
import {environment} from '../../../../environments/environment';
import {ToastService} from '../../../Core/services/toast.service';

/**
 * PAGE 15 : Gérer les événements
 * Composant moderne Angular 20 avec Signals
 * Compatible avec le mode zoneless
 */
@Component({
  selector: 'app-events-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, ModalComponent, EventFormComponent, RegistrationsModalComponent],
  templateUrl: './events-manager.html',
  styleUrl: './events-manager.css',
})
export class EventsManagerComponent {
  private readonly eventService = inject(EventService);

// Dans la classe :
 private readonly toastService = inject(ToastService);

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
  isFormModalOpen = signal(false);
  selectedEvent = signal<Event | null>(null);

  // États de chargement
  isDeleting = signal(false);

  // Modal des inscriptions
  isRegistrationsModalOpen = signal(false);
  selectedEventForRegistrations = signal<Event | null>(null);
  // ========== COMPUTED SIGNALS ==========

  // Filtres combinés pour l'API
  filters = computed<EventFilters>(() => {
    const tab = this.activeTab();
    const filters: EventFilters = {
      search: this.searchQuery() || undefined,
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
  /**
   * Obtenir l'URL complète d'une image
   */
  getImageUrl(path: string | null | undefined): string {
    if (!path) {
      return 'https://via.placeholder.com/400x200?text=No+Image';
    }

    // Si le chemin commence déjà par http, le retourner tel quel
    if (path.startsWith('http')) {
      return path;
    }

    // Sinon, ajouter l'URL du backend
    return `${environment.uploadsUrl}${path}`;
  }

  // ========== RESOURCE POUR LES ÉVÉNEMENTS (rxResource) ==========

  eventsResource = rxResource({
    params: this.filters,
    stream: ({params}) => this.eventService.getEvents(params),
  });

  // Computed signals dérivés de la resource
  events = computed(() => this.eventsResource.value()?.data ?? []);
  totalEvents = computed(() => this.eventsResource.value()?.total ?? 0);
  totalPages = computed(() => this.eventsResource.value()?.totalPages ?? 0);
  isLoading = computed(() => this.eventsResource.isLoading());
  hasError = computed(() => !!this.eventsResource.error());
  error = computed(() => this.eventsResource.error());

  // ========== ÉNUMÉRATIONS POUR LE TEMPLATE ==========
  EventStatus = EventStatus;

  // ========== MÉTHODES ==========

  /**
   * Recharger les événements manuellement
   */
  reloadEvents(): void {
    this.eventsResource.reload();
  }

  /**
   * Changer d'onglet
   */
  setActiveTab(tab: 'upcoming' | 'past' | 'drafts') {
    this.activeTab.set(tab);
    this.currentPage.set(1);
  }

  /**
   * Rechercher des événements
   */
  onSearch(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  /**
   * Changer le tri
   */
  changeSortBy(field: 'date' | 'title' | 'registrations') {
    if (this.sortBy() === field) {
      this.sortOrder.update((order) => (order === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('desc');
    }
  }

  /**
   * Changer de page
   */
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  /**
   * Ouvrir le modal de création
   */
  openCreateModal() {
    this.selectedEvent.set(null);
    this.isFormModalOpen.set(true);
  }

  /**
   * Ouvrir le modal d'édition
   */
  openEditModal(event: Event) {
    this.selectedEvent.set(event);
    this.isFormModalOpen.set(true);
  }

  /**
   * Fermer le modal de formulaire
   */
  closeFormModal() {
    this.isFormModalOpen.set(false);
    this.selectedEvent.set(null);
  }



  /**
   * Annulation du formulaire
   */
  onFormCancel() {
    this.closeFormModal();
  }

  /**
   * Supprimer un événement
   */


  /**
   * Dupliquer un événement
   */
  /**
   * Dupliquer un événement
   */
  duplicateEvent(event: Event) {
    this.eventService.duplicateEvent(event.id).subscribe({
      next: (duplicatedEvent) => {
        this.reloadEvents();
        alert(`Événement "${duplicatedEvent.title}" dupliqué avec succès !`); // ← CORRIGÉ ICI
      },
      error: (error) => {
        console.error('Erreur lors de la duplication:', error);
        alert('Erreur lors de la duplication de l\'événement');
      },
    });
  }

  /**
   * Voir les inscrits
   */
  viewRegistrations(event: Event) {
    this.selectedEventForRegistrations.set(event);
    this.isRegistrationsModalOpen.set(true);
  }

  /**
   * Fermer le modal des inscriptions
   */
  closeRegistrationsModal() {
    this.isRegistrationsModalOpen.set(false);
    this.selectedEventForRegistrations.set(null);
  }

  /**
   * Scanner les QR codes
   */
  scanQRCodes(event: Event) {
    // TODO: Ouvrir scanner QR
    console.log('Scanner QR:', event);
    alert('Fonctionnalité "Scanner QR Code" à venir...');
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
  /**
   * Succès de création/modification
   */
  onFormSuccess(event: Event) {
    // Vérifier le mode AVANT de fermer le modal
    const isEditMode = this.selectedEvent() !== null;

    this.closeFormModal();
    this.reloadEvents();

    const message = isEditMode
      ? `Événement "${event.title}" modifié avec succès !`
      : `Événement "${event.title}" créé avec succès !`;
    this.toastService.success(message);
  }

  /**
   * Supprimer un événement
   */
  deleteEvent(event: Event) {
    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer l'événement "${event.title}" ?`
    );

    if (!confirmed) return;

    this.isDeleting.set(true);

    this.eventService.deleteEvent(event.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.reloadEvents();
        this.toastService.success(`Événement "${event.title}" supprimé avec succès !`);  // ← ICI
      },
      error: (error) => {
        this.isDeleting.set(false);
        console.error('Erreur lors de la suppression:', error);
        this.toastService.error('Erreur lors de la suppression de l\'événement');  // ← ICI
      },
    });
  }
}
