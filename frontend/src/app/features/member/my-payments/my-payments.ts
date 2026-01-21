import { Component, signal, computed, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PaymentService } from '../../../Core/services/payment.service';
import { AuthService } from '../../../Core/services/auth.service';

/**
 * PAGE: Mes Paiements
 * Affiche l'historique des paiements (adhésions et événements)
 * Devise: Dinars Tunisiens (TND)
 */
@Component({
  selector: 'app-my-payments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-payments.html',
  styleUrl: './my-payments.css',
})
export class MyPaymentsComponent implements OnInit {
  // ============================================
  // SERVICES
  // ============================================
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // ============================================
  // SIGNAUX - ÉTAT DE LA PAGE
  // ============================================

  /** ID de l'utilisateur actuel */
  currentUserId = computed(() => Number(this.authService.currentUser()?.id) || 0);

  /** En attente du chargement des données */
  loading = signal(false);

  /** Erreur lors du chargement */
  error = signal<string | null>(null);

  /** Téléchargement en cours */
  downloading = signal(false);

  // ============================================
  // SIGNAUX - DONNÉES
  // ============================================

  /** Liste de tous les paiements */
  payments = signal<any[]>([]);

  /** Statistiques des paiements */
  paymentStats = signal<any>(null);

  /** Dépenses du mois en cours */
  totalSpentThisMonth = computed(() => this.paymentStats()?.totalSpentThisMonth || 0);

  /** Dépenses de l'année en cours */
  totalSpentThisYear = computed(() => this.paymentStats()?.totalSpentThisYear || 0);

  /** Alias pour compatibilité avec le template */
  stats = computed(() => this.paymentStats());

  // ============================================
  // SIGNAUX - FILTRAGE
  // ============================================

  /** Statut sélectionné pour le filtre */
  filterStatus = signal<string | null>(null);

  /** Paiements filtrés selon le statut */
  filteredPayments = computed(() => {
    const payments = this.payments();
    const status = this.filterStatus();

    if (!status) return payments;
    return payments.filter(p => p.status === status);
  });

  // ============================================
  // CONSTRUCTEUR
  // ============================================
  constructor() {
    // Recharger les données quand l'utilisateur change
    effect(() => {
      const userId = this.currentUserId();
      if (userId) {
        this.loadData();
      }
    });
  }

  // ============================================
  // CYCLE DE VIE
  // ============================================
  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.loadData();
    } else {
      this.router.navigate(['/login']);
    }
  }

  // ============================================
  // MÉTHODES PRINCIPALES
  // ============================================

  /**
   * Charger les données des paiements
   */
  loadData() {
    const userId = this.currentUserId();
    if (!userId) return;

    this.loading.set(true);
    this.error.set(null);

    // Charger les statistiques
    this.paymentService.getPaymentStats(userId).subscribe({
      next: (stats) => {
        this.paymentStats.set(stats);
      },
      error: (err) => {
        console.error('Erreur chargement statistiques:', err);
      }
    });

    // Charger l'historique des paiements
    this.paymentService.getPaymentHistory(userId, {
      page: 1,
      limit: 50,
    }).subscribe({
      next: (response) => {
        // Le service retourne soit un tableau, soit un objet avec 'data'
        const paymentsList = Array.isArray(response) ? response : (response.data || response);
        this.payments.set(paymentsList);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement paiements:', err);
        this.error.set('Impossible de charger vos paiements');
        this.loading.set(false);
      }
    });
  }

  /**
   * Filtrer les paiements par statut
   */
  filterByStatus(status: string | null) {
    this.filterStatus.set(status);
  }

  // ============================================
  // MÉTHODES DE FORMATAGE ET CONVERSION
  // ============================================

  /**
   * Obtenir la classe CSS du badge de statut
   */
  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      'CONFIRMED': 'status-badge completed',
      'APPROVED': 'status-badge completed',
      'PENDING': 'status-badge pending',
      'REJECTED': 'status-badge failed',
    };
    return classes[status] || 'status-badge';
  }

  /**
   * Obtenir l'icône du statut
   */
  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'CONFIRMED': 'bi bi-check-circle-fill',
      'APPROVED': 'bi bi-check-circle-fill',
      'PENDING': 'bi bi-hourglass-split',
      'REJECTED': 'bi bi-x-circle-fill',
    };
    return icons[status] || 'bi bi-question-circle';
  }

  /**
   * Obtenir le libellé du statut en français
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'CONFIRMED': 'Confirmé',
      'APPROVED': 'Approuvé',
      'PENDING': 'En attente',
      'REJECTED': 'Rejeté',
    };
    return labels[status] || status;
  }

  /**
   * Obtenir la classe CSS du type de paiement
   */
  getPaymentTypeClass(type: string): string {
    return type === 'MEMBERSHIP' ? 'payment-type-badge membership' : 'payment-type-badge event';
  }

  /**
   * Obtenir l'icône du type de paiement
   */
  getPaymentTypeIcon(type: string): string {
    return type === 'MEMBERSHIP' ? 'bi bi-people-fill' : 'bi bi-calendar-event-fill';
  }

  /**
   * Obtenir le libellé du type de paiement
   */
  getPaymentTypeLabel(type: string): string {
    return type === 'MEMBERSHIP' ? 'Cotisation' : 'Événement';
  }

  /**
   * Formater une date au format français
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  }

  /**
   * Formater un montant en dinars tunisiens
   */
  formatCurrency(amount: number | null | undefined): string {
    if (!amount) return '0.00 TND';

    try {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      return new Intl.NumberFormat('fr-TN', {
        style: 'currency',
        currency: 'TND',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numAmount);
    } catch (e) {
      return `${amount} TND`;
    }
  }

  // ============================================
  // ACTIONS UTILISATEUR
  // ============================================

  /**
   * Télécharger le reçu d'un paiement au format PDF
   */
  downloadReceipt(paymentId: number) {
    this.downloading.set(true);

    this.paymentService.downloadReceipt(paymentId).subscribe({
      next: (blob: Blob) => {
        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recu-paiement-${paymentId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.downloading.set(false);
      },
      error: (err: any) => {
        console.error('Erreur téléchargement reçu:', err);
        this.error.set('Erreur lors du téléchargement du reçu. Veuillez réessayer.');
        this.downloading.set(false);
      }
    });
  }

  /**
   * Voir les détails d'un événement
   */
  viewEvent(eventId: number) {
    this.router.navigate(['/events', eventId]);
  }
}
