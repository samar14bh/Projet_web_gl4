import {
  Component,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rxResource, toObservable } from '@angular/core/rxjs-interop';
import { Observable, map, switchMap } from 'rxjs';
import { EventService } from '../../../Core/services/event.service';
import { Event, EventFilters } from '../../../Core/models/event.model';
import { EventStatus } from '../../../Core/models/event.model';
import { ButtonComponent } from '../../../shared/components/button/button';
import { ModalComponent } from '../../../shared/components/modal/modal';
import { EventFormComponent } from '../events/event-form/event-form';
import { RegistrationsModalComponent } from '../events/registrations-modal/registrations-modal';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../Core/services/toast.service';

@Component({
  selector: 'app-events-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    ModalComponent,
    EventFormComponent,
    RegistrationsModalComponent,
  ],
  templateUrl: './events-manager.html',
  styleUrl: './events-manager.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsManagerComponent {
  private readonly eventService = inject(EventService);
  private readonly toastService = inject(ToastService);

  clubId = input<number, string | number>(0, {
    transform: (val: string | number) => Number(val),
  });

  readonly activeTab = signal<'upcoming' | 'past' | 'drafts'>('upcoming');
  readonly searchQuery = signal('');
  readonly selectedStatus = signal<EventStatus | 'all'>('all');
  readonly sortBy = signal<'date' | 'title' | 'registrations'>('date');
  readonly sortOrder = signal<'asc' | 'desc'>('desc');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly isFormModalOpen = signal(false);
  readonly selectedEvent = signal<Event | null>(null);
  readonly isDeleting = signal(false);
  readonly isRegistrationsModalOpen = signal(false);
  readonly selectedEventForRegistrations = signal<Event | null>(null);

  // Filtres combinés pour l'API (avec clubId)
  readonly filters = computed<EventFilters>(() => {
    const tab = this.activeTab();
    const filters: EventFilters = {
      search: this.searchQuery() || undefined,
      page: this.currentPage(),
      limit: this.pageSize(),
      sortBy: this.sortBy(),
      order: this.sortOrder(),
      clubId: this.clubId(),
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

  readonly eventsResource = rxResource({
    params: this.filters,
    stream: ({ params }) =>
      this.eventService.getEvents(params).pipe(
        map(res => res)
      ),
  });

  // ========== COMPUTED SIGNALS (pour compatibilité) ==========
  readonly events = computed(() => this.eventsResource.value()?.data ?? []);
  readonly totalEvents = computed(() => this.eventsResource.value()?.total ?? 0);
  readonly totalPages = computed(() => this.eventsResource.value()?.totalPages ?? 0);
  readonly isLoading = computed(() => this.eventsResource.isLoading());
  readonly hasError = computed(() => !!this.eventsResource.error());

  // ========== OBSERVABLES RÉACTIFS pour ASYNC PIPE ==========
  /**
   * Se met à jour automatiquement quand filters change
   */
  readonly events$: Observable<Event[]> = toObservable(this.filters).pipe(
    switchMap(filters =>
      this.eventService.getEvents(filters).pipe(
        map(response => response.data || [])
      )
    )
  );

  /**
   * Se met à jour automatiquement quand filters change
   */
  readonly totalPages$: Observable<number> = toObservable(this.filters).pipe(
    switchMap(filters =>
      this.eventService.getEvents(filters).pipe(
        map(response => response.totalPages || 0)
      )
    )
  );

  /**
   * Se met à jour automatiquement quand filters change
   */
  readonly totalEvents$: Observable<number> = toObservable(this.filters).pipe(
    switchMap(filters =>
      this.eventService.getEvents(filters).pipe(
        map(response => response.total || 0)
      )
    )
  );

  readonly EventStatus = EventStatus;

  readonly trackByEventId = (_index: number, event: Event) => event.id;

  // ========== MÉTHODES UTILITAIRES (PURES) ==========

  getImageUrl(path: string | null | undefined): string {
    if (!path) {
      return 'https://via.placeholder.com/400x200?text=No+Image';
    }
    if (path.startsWith('http')) {
      return path;
    }
    return `${environment.uploadsUrl}${path}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusBadgeClass(status: EventStatus): string {
    const classes: Record<EventStatus, string> = {
      [EventStatus.UPCOMING]: 'badge-info',
      [EventStatus.ONGOING]: 'badge-success',
      [EventStatus.COMPLETED]: 'badge-secondary',
      [EventStatus.CANCELLED]: 'badge-danger',
    };
    return classes[status] || 'badge-secondary';
  }

  getStatusLabel(status: EventStatus): string {
    const labels: Record<EventStatus, string> = {
      [EventStatus.UPCOMING]: 'À venir',
      [EventStatus.ONGOING]: 'En cours',
      [EventStatus.COMPLETED]: 'Terminé',
      [EventStatus.CANCELLED]: 'Annulé',
    };
    return labels[status] || status;
  }

  // ========== ACTIONS ==========

  reloadEvents(): void {
    this.eventsResource.reload();
  }

  setActiveTab(tab: 'upcoming' | 'past' | 'drafts'): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  changeSortBy(field: 'date' | 'title' | 'registrations'): void {
    if (this.sortBy() === field) {
      this.sortOrder.update((order) => (order === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('desc');
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  openCreateModal(): void {
    this.selectedEvent.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(event: Event): void {
    this.selectedEvent.set(event);
    this.isFormModalOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
    this.selectedEvent.set(null);
  }

  onFormCancel(): void {
    this.closeFormModal();
  }

  onFormSuccess(event: Event): void {
    const isEditMode = this.selectedEvent() !== null;
    this.closeFormModal();
    this.reloadEvents();

    const message = isEditMode
      ? `Événement "${event.title}" modifié avec succès !`
      : `Événement "${event.title}" créé avec succès !`;
    this.toastService.success(message);
  }

  deleteEvent(event: Event): void {
    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer l'événement "${event.title}" ?`,
    );

    if (!confirmed) return;

    this.isDeleting.set(true);

    this.eventService.deleteEvent(event.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.reloadEvents();
        this.toastService.success(`Événement "${event.title}" supprimé avec succès !`);
      },
      error: (error) => {
        this.isDeleting.set(false);
        console.error('Erreur lors de la suppression:', error);
        this.toastService.error("Erreur lors de la suppression de l'événement");
      },
    });
  }

  duplicateEvent(event: Event): void {
    this.eventService.duplicateEvent(event.id).subscribe({
      next: (duplicatedEvent) => {
        this.reloadEvents();
        this.toastService.success(`Événement "${duplicatedEvent.title}" dupliqué avec succès !`);
      },
      error: (error) => {
        console.error('Erreur lors de la duplication:', error);
        this.toastService.error("Erreur lors de la duplication de l'événement");
      },
    });
  }

  viewRegistrations(event: Event): void {
    this.selectedEventForRegistrations.set(event);
    this.isRegistrationsModalOpen.set(true);
  }

  closeRegistrationsModal(): void {
    this.isRegistrationsModalOpen.set(false);
    this.selectedEventForRegistrations.set(null);
  }
}
