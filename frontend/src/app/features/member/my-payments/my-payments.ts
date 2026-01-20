import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PaymentService } from '../../../Core/services/payment.service';
import { AuthService } from '../../../Core/services/auth.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { TabNavigationComponent } from '../../../shared/components/tab-navigation/tab-navigation';
import { TabItem } from '../../../shared/interfaces/components.interface';

/**
 * PAGE 10: Mes Paiements
 * Affiche l'historique des paiements, les statistiques et les moyens de paiement
 * Devise: Dinars Tunisiens (TND)
 */
@Component({
  selector: 'app-my-payments',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent, TabNavigationComponent],
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
  /** Onglet actif (historique ou moyens de paiement) */
  activeTab = signal<string>('history');

  /** ID de l'utilisateur actuel */
  currentUserId = computed(() => Number(this.authService.currentUser()?.id) || 0);

  // ============================================
  // CONFIGURATION DES ONGLETS
  // ============================================
  tabs = signal<TabItem[]>([
    { id: 'history', label: 'Historique des paiements', icon: 'clock-history' },
    { id: 'methods', label: 'Moyens de paiement', icon: 'credit-card' },
  ]);

  // ============================================
  // SIGNAUX CALCULÉS - DONNÉES
  // ============================================
  /** Liste de tous les paiements */
  payments = computed(() => this.paymentService.payments());

  /** Statistiques des paiements */
  paymentStats = computed(() => this.paymentService.stats());

  // Alias pour compatibilité avec le template
  stats = computed(() => this.paymentStats());

  /** Dépenses du mois en cours */
  totalSpentThisMonth = computed(() => this.paymentStats()?.totalSpentThisMonth || 0);

  /** Dépenses de l'année en cours */
  totalSpentThisYear = computed(() => this.paymentStats()?.totalSpentThisYear || 0);

  /** En attente du chargement des données */
  loading = computed(() => this.paymentService.loading());

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
  constructor() { }

  // ============================================
  // CYCLE DE VIE
  // ============================================
  ngOnInit() {
    // Vérifier que l'utilisateur est authentifié
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

    // Charger les statistiques
    this.paymentService.getPaymentStats(userId).subscribe();

    // Charger l'historique des paiements
    this.paymentService.getPaymentHistory(userId, {
      page: 1,
      limit: 20,
    }).subscribe();
  }

  /**
   * Changer d'onglet actif
   */
  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
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
      'PENDING': 'status-badge pending',
      'REJECTED': 'status-badge failed',
      'APPROVED': 'status-badge completed',
    };
    return classes[status] || 'status-badge';
  }

  /**
   * Obtenir le libellé du statut en français
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'CONFIRMED': 'Confirmé',
      'PENDING': 'En attente',
      'REJECTED': 'Rejeté',
      'APPROVED': 'Approuvé',
    };
    return labels[status] || status;
  }

  /**
   * Obtenir le libellé du type de paiement
   */
  getPaymentTypeLabel(type: string): string {
    return type === 'membership' ? 'Cotisation' : 'Événement';
  }

  /**
   * Formater une date au format français
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

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

  // ============================================
  // ACTIONS UTILISATEUR
  // ============================================

  /**
   * Télécharger le reçu d'un paiement au format PDF
   */
  downloadReceipt(paymentId: number) {
    this.paymentService.downloadReceipt(paymentId).subscribe({
      next: (blob: Blob) => {
        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recu-paiement-${paymentId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error('Erreur téléchargement reçu:', err);
        alert('Erreur lors du téléchargement du reçu. Veuillez réessayer.');
      }
    });
  }

  /**
   * Naviguer vers la page de paiement pour un club ou événement
   */
  navigateToPayment(clubId: number, eventId?: number) {
    if (clubId && !eventId) {
      this.router.navigate(['/payment'], {
        queryParams: { type: 'membership', clubId }
      });
    } else if (eventId) {
      this.router.navigate(['/payment'], {
        queryParams: { type: 'event', eventId }
      });
    }
  }
}
