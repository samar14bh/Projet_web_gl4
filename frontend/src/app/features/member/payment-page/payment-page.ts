import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentService } from '../../../Core/services/payment.service';
import { ClubService } from '../../../Core/services/club.service';
import { EventService } from '../../../Core/services/event.service';
import { AuthService } from '../../../Core/services/auth.service';
import { MemberService } from '../../../Core/services/member.service';

/**
 * PAGE 11: Page de Paiement
 * Gère le paiement des adhésions de club et des inscriptions aux événements
 * Devise: Dinars Tunisiens (TND)
 */
@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './payment-page.html',
  styleUrl: './payment-page.css',
})
export class PaymentPageComponent implements OnInit {
  // ============================================
  // SERVICES
  // ============================================
  private paymentService = inject(PaymentService);
  private clubService = inject(ClubService);
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // ============================================
  // SIGNAUX - CONTEXTE DE PAIEMENT
  // ============================================
  /** Type de paiement: adhésion au club ou inscription à événement */
  paymentType = signal<'membership' | 'event'>('membership');

  /** ID du club (pour les paiements d'adhésion) */
  clubId = signal<number | null>(null);

  /** ID de l'événement (pour les paiements d'événement) */
  eventId = signal<number | null>(null);

  /** ID de l'utilisateur actuel */
  userId = computed(() => Number(this.authService.currentUser()?.id) || 0);

  /** Méthode de paiement sélectionnée */
  selectedMethod = signal<'CARD' | 'CASH'>('CARD');

  // ============================================
  // SIGNAUX - DONNÉES DU PAIEMENT
  // ============================================
  /** Détails du club */
  clubDetails = signal<any>(null);

  /** Détails de l'événement */
  eventDetails = signal<any>(null);

  /** Remise pour les adhésions actives */
  membershipDiscount = signal<number>(0);

  /** ID de l'adhésion */
  membershipId = signal<number | null>(null);

  // ============================================
  // SIGNAUX - FORMULAIRE DE PAIEMENT
  // ============================================
  /** Numéro de la carte bancaire */
  cardNumber = signal('');

  /** Nom du titulaire de la carte */
  cardName = signal('');

  /** Date d'expiration de la carte (MM/YY) */
  cardExpiry = signal('');

  /** Code de sécurité CVV */
  cardCVV = signal('');

  // ============================================
  // SIGNAUX - ÉTATS
  // ============================================
  /** En attente du chargement des données */
  loading = signal(false);

  /** En cours de traitement du paiement */
  processing = signal(false);

  /** Erreur fatale (données manquantes) */
  error = signal<string | null>(null);

  /** Erreur de validation du formulaire */
  formError = signal<string | null>(null);

  // ============================================
  // SIGNAUX CALCULÉS - MONTANTS
  // ============================================
  /** Montant total du paiement à effectuer */
  amount = computed(() => {
    if (this.paymentType() === 'membership' && this.clubDetails()) {
      return this.clubDetails().membershipFeeAmount || 0;
    } else if (this.paymentType() === 'event' && this.eventDetails()) {
      const basePrice = Number(this.eventDetails().subscriptionFees || 0);
      const discount = this.membershipDiscount();
      return basePrice - discount;
    }
    return 0;
  });

  /** Montant de base avant réduction */
  baseAmount = computed(() => {
    if (this.paymentType() === 'event' && this.eventDetails()) {
      return Number(this.eventDetails().subscriptionFees || 0);
    }
    return this.amount();
  });

  /** Vérifie s'il y a une réduction appliquée */
  hasDiscount = computed(() => this.membershipDiscount() > 0);

  /** Titre de la page de paiement */
  title = computed(() => {
    if (this.paymentType() === 'membership' && this.clubDetails()) {
      return `Adhésion - ${this.clubDetails().name}`;
    } else if (this.paymentType() === 'event' && this.eventDetails()) {
      return `Inscription - ${this.eventDetails().title}`;
    }
    return 'Paiement';
  });

  ngOnInit() {
    // Vérifier que l'utilisateur est authentifié
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    // Récupérer les paramètres de requête
    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.paymentType.set(params['type']);
      }
      if (params['clubId']) {
        this.clubId.set(+params['clubId']);
        this.loadClubDetails();
      }
      if (params['eventId']) {
        this.eventId.set(+params['eventId']);
        this.loadEventDetails();
      }
    });
  }

  /**
   * Charger les détails du club
   */
  loadClubDetails() {
    const clubId = this.clubId();
    if (!clubId) return;

    this.loading.set(true);
    this.clubService.getClubById(clubId).subscribe({
      next: (club) => {
        this.clubDetails.set(club);
        this.checkMembershipStatus(clubId);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Impossible de charger les détails du club');
        console.error('Erreur chargement club:', err);
        this.loading.set(false);
      }
    });
  }

  /**
   * Charger les détails de l'événement
   */
  loadEventDetails() {
    const eventId = this.eventId();
    if (!eventId) return;

    this.loading.set(true);
    this.eventService.getEventById(eventId).subscribe({
      next: (event) => {
        this.eventDetails.set(event);
        this.checkMembershipDiscount(event.club.id);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Impossible de charger les détails de l\'événement');
        console.error('Erreur chargement événement:', err);
        this.loading.set(false);
      }
    });
  }

  /**
   * Vérifier le statut d'adhésion au club
   */
  checkMembershipStatus(clubId: number) {
    const userId = this.userId();
    if (!userId) return;

    this.memberService.checkMembership(userId, clubId).subscribe({
      next: (result) => {
        if (result.exists && result.membership) {
          this.membershipId.set(result.membership.id);
          // Vérifier si l'utilisateur est déjà membre actif
          if (this.paymentType() === 'membership' && result.membership.status === 'ACTIVE') {
            this.formError.set('Vous êtes déjà membre actif de ce club');
          }
        }
      },
      error: (err) => {
        console.error('Erreur vérification adhésion:', err);
      }
    });
  }

  /**
   * Vérifier si l'utilisateur a une remise (adhésion active)
   */
  checkMembershipDiscount(clubId: number) {
    const userId = this.userId();
    if (!userId) return;

    this.memberService.checkMembership(userId, clubId).subscribe({
      next: (result) => {
        if (result.exists && result.membership?.status === 'ACTIVE') {
          // Appliquer 20% de remise pour les membres actifs
          const basePrice = Number(this.eventDetails()?.subscriptionFees || 0);
          this.membershipDiscount.set(basePrice * 0.2);
        }
      },
      error: (err) => {
        console.error('Erreur vérification remise:', err);
      }
    });
  }

  /**
   * Traiter le paiement selon le type
   */
  processPayment() {
    this.formError.set(null);

    // Valider le formulaire si paiement par carte
    if (this.selectedMethod() === 'CARD' && !this.validateForm()) {
      return;
    }

    this.processing.set(true);

    if (this.paymentType() === 'membership') {
      this.processMembershipPayment();
    } else {
      this.processEventPayment();
    }
  }

  /**
   * Traiter le paiement d'adhésion au club
   */
  processMembershipPayment() {
    const clubId = this.clubId();
    const userId = this.userId();
    const membershipId = this.membershipId();

    if (!clubId) {
      this.error.set('Club non spécifié');
      this.processing.set(false);
      return;
    }

    if (!membershipId) {
      this.formError.set('Adhésion introuvable. Veuillez rejoindre le club avant de payer.');
      this.processing.set(false);
      return;
    }

    this.paymentService.processMembershipPayment({
      membershipId,
      clubId,
      userId,
      method: this.selectedMethod()
    }).subscribe({
      next: (payment) => {
        this.processing.set(false);
        // Rediriger vers la page de succès
        this.router.navigate(['/payment/success'], {
          queryParams: {
            paymentId: payment.id,
            type: 'membership'
          }
        });
      },
      error: (err) => {
        this.processing.set(false);
        this.formError.set(err.error?.message || 'Erreur lors du paiement. Veuillez réessayer.');
        console.error('Erreur paiement adhésion:', err);
      }
    });
  }

  /**
   * Traiter le paiement d'inscription à un événement
   */
  processEventPayment() {
    const eventId = this.eventId();
    const userId = this.userId();

    if (!eventId) {
      this.error.set('Événement non spécifié');
      this.processing.set(false);
      return;
    }

    this.paymentService.processEventPayment({
      eventId,
      userId,
      method: this.selectedMethod()
    }).subscribe({
      next: (result) => {
        this.processing.set(false);
        // Rediriger vers la page de succès
        this.router.navigate(['/payment/success'], {
          queryParams: {
            paymentId: result.payment.id,
            type: 'event'
          }
        });
      },
      error: (err) => {
        this.processing.set(false);
        this.formError.set(err.error?.message || 'Erreur lors du paiement. Veuillez réessayer.');
        console.error('Erreur paiement événement:', err);
      }
    });
  }

  /**
   * Valider le formulaire de paiement par carte
   */
  validateForm(): boolean {
    // Vérifier le numéro de carte (16 chiffres)
    if (!this.cardNumber() || this.cardNumber().replace(/\s/g, '').length !== 16) {
      this.formError.set('Numéro de carte invalide (16 chiffres requis)');
      return false;
    }

    // Vérifier le nom du titulaire
    if (!this.cardName() || this.cardName().trim().length < 3) {
      this.formError.set('Nom du titulaire invalide');
      return false;
    }

    // Vérifier la date d'expiration (MM/YY)
    if (!this.cardExpiry() || !this.cardExpiry().match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      this.formError.set('Date d\'expiration invalide (format: MM/YY)');
      return false;
    }

    // Vérifier le CVV (3 chiffres)
    if (!this.cardCVV() || this.cardCVV().length !== 3 || isNaN(Number(this.cardCVV()))) {
      this.formError.set('CVV invalide (3 chiffres requis)');
      return false;
    }

    return true;
  }

  /**
   * Formater le numéro de carte avec des espaces
   */
  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    // Ajouter des espaces tous les 4 chiffres
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    this.cardNumber.set(formattedValue);
  }

  /**
   * Formater la date d'expiration (MM/YY)
   */
  formatExpiry(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.cardExpiry.set(value);
  }

  /**
   * Formater le CVV (3 chiffres uniquement)
   */
  formatCVV(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    value = value.substring(0, 3);
    this.cardCVV.set(value);
  }

  /**
   * Formater le montant en dinars tunisiens
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
   * Annuler le paiement et retourner aux clubs
   */
  cancel() {
    if (confirm('Êtes-vous sûr de vouloir annuler le paiement ?')) {
      this.router.navigate(['/clubs']);
    }
  }
}
