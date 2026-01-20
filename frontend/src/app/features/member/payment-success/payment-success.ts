import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentService } from '../../../Core/services/payment.service';

/**
 * Page de Confirmation de Paiement
 * Affiche la confirmation après un paiement réussi
 *
 * Route: /payment/success
 * Query Params: paymentId, type (membership|event)
 */
@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.css',
})
export class PaymentSuccessComponent implements OnInit {
  // ============================================
  // SERVICES
  // ============================================
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentService = inject(PaymentService);

  // ============================================
  // SIGNAUX - DONNÉES DU PAIEMENT
  // ============================================
  /** ID du paiement complété */
  paymentId = signal<number | null>(null);

  /** Type de paiement: adhésion ou événement */
  paymentType = signal<'membership' | 'event'>('membership');

  /** Détails complets du paiement */
  paymentDetails = signal<any>(null);

  /** En attente du chargement des données */
  loading = signal(true);

  /** Date actuelle pour affichage */
  currentDate = new Date();

  // ============================================
  // SIGNAUX CALCULÉS - MESSAGE
  // ============================================
  /** Message et icône selon le type de paiement */
  message = computed(() => {
    if (this.paymentType() === 'membership') {
      return {
        title: 'Paiement de cotisation confirmé !',
        description: 'Votre adhésion au club est maintenant active',
        icon: 'bi-check-circle-fill',
      };
    } else {
      return {
        title: 'Inscription confirmée !',
        description: 'Vous êtes maintenant inscrit à cet événement',
        icon: 'bi-calendar-check-fill',
      };
    }
  });

  // ============================================
  // CYCLE DE VIE
  // ============================================
  ngOnInit() {
    // Récupérer les paramètres de la page
    this.route.queryParams.subscribe(params => {
      if (params['paymentId']) {
        this.paymentId.set(+params['paymentId']);
        this.loadPaymentDetails(+params['paymentId']);
      }
      if (params['type']) {
        this.paymentType.set(params['type']);
      }
      this.loading.set(false);
    });
  }

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================

  /**
   * Charger les détails du paiement
   * Note: Si getPaymentDetails n'existe pas, on récupère les stats
   */
  loadPaymentDetails(paymentId: number) {
    // Essayer de charger les détails complets du paiement
    // Si la méthode n'existe pas dans PaymentService, c'est ok
    // On affichera quand même la page de confirmation

    try {
      // Vérifier si la méthode existe
      if ('getPaymentDetails' in this.paymentService) {
        (this.paymentService as any).getPaymentDetails(paymentId).subscribe({
          next: (details: any) => {
            this.paymentDetails.set(details);
          },
          error: (err: any) => {
            console.error('Erreur lors du chargement des détails du paiement:', err);
            // Ne pas bloquer sur l'erreur
          }
        });
      } else {
        console.log('Méthode getPaymentDetails non disponible');
        // Charger les stats à la place pour afficher quelque chose
        this.paymentService.getPaymentStats(+localStorage.getItem('userId')! || 0).subscribe({
          next: (stats: any) => {
            this.paymentDetails.set({ id: paymentId, stats });
          },
          error: (err: any) => {
            console.error('Erreur chargement stats:', err);
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    }
  }

  // ============================================
  // ACTIONS UTILISATEUR
  // ============================================

  /**
   * Télécharger le reçu du paiement au format PDF
   */
  downloadReceipt() {
    const paymentId = this.paymentId();
    if (!paymentId) {
      alert('ID de paiement manquant');
      return;
    }

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
   * Naviguer vers l'historique des paiements
   */
  goToPayments() {
    this.router.navigate(['/my-payments']);
  }

  /**
   * Naviguer vers le tableau de bord du club (si adhésion)
   * ou vers l'événement (si inscription)
   */
  goToClubDashboard() {
    if (this.paymentType() === 'membership' && this.paymentDetails()?.membership?.club?.id) {
      // Rediriger vers le dashboard du club
      this.router.navigate([`/club-manager/${this.paymentDetails().membership.club.id}/dashboard`]);
    } else {
      // Rediriger vers l'accueil
      this.router.navigate(['/']);
    }
  }

  /**
   * Naviguer vers la page d'accueil
   */
  goToHome() {
    this.router.navigate(['/']);
  }
}
