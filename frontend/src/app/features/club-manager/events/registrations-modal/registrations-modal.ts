import {
  Component,
  signal,
  computed,
  inject,
  input,
  output,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { EventService } from '../../../../Core/services/event.service';

/**
 * Composant modal pour voir les inscriptions d'un événement
 */
@Component({
  selector: 'app-registrations-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './registrations-modal.html',
  styleUrl: './registrations-modal.css',
})
export class RegistrationsModalComponent {
  // ========== SERVICES ==========
  private readonly eventService = inject(EventService);

  // ========== INPUTS/OUTPUTS ==========
  event = input.required<any>(); // Événement
  onClose = output<void>(); // Fermeture

  // ========== SIGNALS ==========
  searchQuery = signal('');
  filterStatus = signal<'all' | 'registered' | 'waitlist' | 'cancelled'>('all');
  isLoading = signal(true);
  registrations = signal<any[]>([]);

  // ========== COMPUTED ==========
  filteredRegistrations = computed(() => {
    let list = this.registrations();

    // Filtre par recherche
    const query = this.searchQuery().toLowerCase();
    if (query) {
      list = list.filter((r) =>
        r.user?.name.toLowerCase().includes(query) ||
        r.user?.email.toLowerCase().includes(query)
      );
    }

    // Filtre par statut
    const status = this.filterStatus();
    if (status !== 'all') {
      list = list.filter((r) => r.status === status);
    }

    return list;
  });

  stats = computed(() => {
    const all = this.registrations();
    return {
      total: all.length,
      registered: all.filter((r) => r.status === 'registered').length,
      waitlist: all.filter((r) => r.status === 'waitlist').length,
      cancelled: all.filter((r) => r.status === 'cancelled').length,
    };
  });

  // ========== CONSTRUCTOR AVEC EFFECT ==========
  constructor() {
    // Charger les inscriptions quand l'event est disponible
    effect(() => {
      const currentEvent = this.event();
      if (currentEvent) {
        this.loadRegistrations();
      }
    });
  }

  /**
   * Charger les inscriptions
   */
  loadRegistrations() {
    this.isLoading.set(true);

    this.eventService.getEventRegistrations(this.event().id).subscribe({
      next: (data) => {
        this.registrations.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur chargement inscriptions:', error);
        this.isLoading.set(false);
        // Données de démonstration en cas d'erreur
        this.registrations.set([
          {
            id: 1,
            status: 'registered',
            date: new Date(),
            user: {
              id: 1,
              name: 'Ahmed Ben Ali',
              email: 'ahmed.benali@insat.tn',
            },
          },
          {
            id: 2,
            status: 'registered',
            date: new Date(),
            user: {
              id: 2,
              name: 'Sarah Mansour',
              email: 'sarah.mansour@insat.tn',
            },
          },
          {
            id: 3,
            status: 'waitlist',
            date: new Date(),
            user: {
              id: 3,
              name: 'Karim Hamdi',
              email: 'karim.hamdi@insat.tn',
            },
          },
        ]);
      },
    });
  }

  /**
   * Rechercher
   */
  onSearch(query: string) {
    this.searchQuery.set(query);
  }

  /**
   * Changer le filtre de statut
   */
  changeFilter(status: 'all' | 'registered' | 'waitlist' | 'cancelled') {
    this.filterStatus.set(status);
  }

  /**
   * Fermer le modal
   */
  close() {
    this.onClose.emit();
  }

  /**
   * Exporter la liste en CSV
   */
  exportCSV() {
    const list = this.filteredRegistrations();
    let csv = 'Nom,Email,Statut,Date inscription\n';

    list.forEach((r) => {
      csv += `${r.user?.name},${r.user?.email},${r.status},${new Date(r.date).toLocaleDateString()}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inscriptions-${this.event().title}.csv`;
    a.click();
  }

  /**
   * Obtenir la classe de badge de statut
   */
  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      registered: 'badge-success',
      waitlist: 'badge-warning',
      cancelled: 'badge-danger',
    };
    return classes[status] || 'badge-secondary';
  }

  /**
   * Obtenir le label du statut
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      registered: 'Inscrit',
      waitlist: 'Liste d\'attente',
      cancelled: 'Annulé',
    };
    return labels[status] || status;
  }

  /**
   * Formater une date
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
