import {
  Component,
  signal,
  computed,
  OnInit,
  AfterViewInit,
  OnDestroy,
  inject,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { PaymentService } from '../../../Core/services/payment.service';
import { ClubService } from '../../../Core/services/club.service';
import { EventService } from '../../../Core/services/event.service';
import { AuthService } from '../../../Core/services/auth.service';
import { MemberService } from '../../../Core/services/member.service';

declare var Stripe: any;

/**
 * Payment Page - Stripe Integration (version corrigée)
 */
@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './payment-page.html',
  styleUrls: ['./payment-page.css'],
})
export class PaymentPageComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  // Services via inject()
  private paymentService = inject(PaymentService);
  private clubService = inject(ClubService);
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  // Stripe objects
  private stripe: any;
  private elements: any;
  private cardElement: any;
  private expiryElement: any;
  private cvcElement: any;

  // Subscriptions
  private queryParamsSub?: Subscription;

  // Signals
  paymentType = signal<'membership' | 'event'>('membership');
  clubId = signal<number | null>(null);
  eventId = signal<number | null>(null);
  membershipId = signal<number | null>(null);
  userId = computed(() => Number(this.authService.currentUser()?.id) || 0);

  clubDetails = signal<any>(null);
  eventDetails = signal<any>(null);
  membershipDiscount = signal<number>(0);

  loading = signal(false);
  processing = signal(false);
  error = signal<string | null>(null);
  formError = signal<string | null>(null);
  cardError = signal<string | null>(null);
  elementsReady = signal(false);

  // Form
  paymentForm: FormGroup;

  // Computed amounts
  baseAmount = computed(() => {
    if (this.paymentType() === 'event' && this.eventDetails()) {
      return Number(this.eventDetails().subscriptionFees || 0);
    }
    if (this.paymentType() === 'membership' && this.clubDetails()) {
      return this.clubDetails().membershipFeeAmount || 0;
    }
    return 0;
  });

  amount = computed(() => {
    const base = this.baseAmount();
    const discount = this.membershipDiscount();
    return Math.max(0, base - discount);
  });

  hasDiscount = computed(() => this.membershipDiscount() > 0);

  constructor() {
    this.paymentForm = this.fb.group({
      cardName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      saveCard: [false],
    });
  }

  async ngOnInit() {
    // Vérifier authentification
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    // Charger le script Stripe
    await this.loadStripeScript();

    // Charger la clé publishable depuis le backend
    await this.loadStripePublishableKey();

    // Souscrire aux query params
    this.queryParamsSub = this.route.queryParams.subscribe((params) => {
      if (params['type']) this.paymentType.set(params['type']);
      if (params['clubId']) {
        this.clubId.set(+params['clubId']);
        this.loadClubDetails(+params['clubId']);
      }
      if (params['eventId']) {
        this.eventId.set(+params['eventId']);
        this.loadEventDetails();
      }

      // Default fallback si nécessaire
      if (!params['clubId'] && !params['eventId']) {
        if (this.paymentType() === 'membership') {
          this.loadClubDetails(1);
        }
      }
    });
  }

  async ngAfterViewInit() {
    // Petit délai pour s'assurer que le DOM est rendu
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Forcer détection
    this.cdr.detectChanges();

    // Vérifier la présence des conteneurs Stripe et initialiser si nécessaire
    const cardDiv = document.getElementById('card-number-element');
    const expiryDiv = document.getElementById('expiry-element');
    const cvcDiv = document.getElementById('cvc-element');

    if (!cardDiv || !expiryDiv || !cvcDiv) {
      this.error.set('Erreur: Les champs de paiement ne sont pas disponibles');
      return;
    }

    if (this.stripe && !this.elementsReady()) {
      this.initializeStripeElements();
    }
  }

  ngOnDestroy() {
    // Destruction des éléments Stripe
    try {
      this.cardElement?.destroy?.();
      this.expiryElement?.destroy?.();
      this.cvcElement?.destroy?.();
    } catch {
      // ignore
    }

    // Unsubscribe
    this.queryParamsSub?.unsubscribe();
  }

  /** Charge dynamiquement le script Stripe si besoin */
  private async loadStripeScript(): Promise<void> {
    if ((window as any).Stripe) {
      return;
    }

    const existingScript = document.getElementById('stripe-script');
    if (existingScript) {
      // attendre l'arrivée de l'objet Stripe
      await new Promise<void>((resolve) => {
        const check = setInterval(() => {
          if ((window as any).Stripe) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      });
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.id = 'stripe-script';
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Stripe script'));
      document.head.appendChild(script);
    });
  }

  /** Récupère la clé publishable depuis le backend et initialise Stripe */
  private async loadStripePublishableKey() {
    try {
      const response = await firstValueFrom(
        this.paymentService.getStripePublishableKey()
      );
      if (response?.publishableKey) {
        this.stripe = (window as any).Stripe(response.publishableKey);
      } else {
        this.error.set('Impossible de charger la configuration Stripe');
      }
    } catch {
      this.error.set('Erreur de configuration du paiement');
    }
  }

  /** Initialise Stripe Elements et les monte */
  private initializeStripeElements() {
    if (!this.stripe) {
      this.error.set('Stripe non initialisé');
      return;
    }

    try {
      this.elements = this.stripe.elements();

      const baseStyle = {
        base: {
          fontSize: '16px',
          color: '#0f172a',
          fontFamily: '"Inter", system-ui, sans-serif',
          '::placeholder': {
            color: '#9ca3af',
          },
        },
        invalid: {
          color: '#ef4444',
        },
      };

      this.cardElement = this.elements.create('cardNumber', {
        style: baseStyle,
        placeholder: 'Numéro de carte',
      });

      this.expiryElement = this.elements.create('cardExpiry', {
        style: baseStyle,
        placeholder: 'MM/YY',
      });

      this.cvcElement = this.elements.create('cardCvc', {
        style: baseStyle,
        placeholder: 'CVC',
      });

      this.ngZone.runOutsideAngular(() => {
        try {
          this.cardElement.mount('#card-number-element');
          this.expiryElement.mount('#expiry-element');
          this.cvcElement.mount('#cvc-element');

          // Ajouter listeners après montage
          this.addElementListeners();
        } catch {
          this.ngZone.run(() =>
            this.error.set('Erreur lors du montage des éléments Stripe')
          );
        }
      });

      this.ngZone.run(() => {
        this.elementsReady.set(true);
        this.cdr.detectChanges();
      });
    } catch {
      this.error.set("Erreur lors de l'initialisation des champs de paiement");
    }
  }

  /** Ajoute listeners aux éléments Stripe */
  private addElementListeners() {
    if (!this.cardElement || !this.expiryElement || !this.cvcElement) return;

    this.cardElement.on('change', (event: any) => {
      this.ngZone.run(() => {
        this.cardError.set(event.error ? event.error.message : null);
      });
    });

    this.expiryElement.on('change', (event: any) => {
      this.ngZone.run(() => {
        if (event.error) this.cardError.set(event.error.message);
      });
    });

    this.cvcElement.on('change', (event: any) => {
      this.ngZone.run(() => {
        if (event.error) this.cardError.set(event.error.message);
      });
    });
  }

  /** Charger infos du club */
  private loadClubDetails(clubId?: number) {
    const id = clubId || this.clubId();
    if (!id) return;

    this.loading.set(true);
    this.clubService.getClubById(id).subscribe({
      next: (club) => {
        this.clubDetails.set(club);
        this.checkMembershipStatus(id);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les détails du club');
        this.loading.set(false);
      },
    });
  }

  /** Charger infos de l'événement */
  private loadEventDetails() {
    const eventId = this.eventId();
    if (!eventId) return;

    this.loading.set(true);
    this.eventService.getEventById(eventId).subscribe({
      next: (event) => {
        this.eventDetails.set(event);
        if (event?.club?.id) this.checkMembershipDiscount(event.club.id);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Impossible de charger les détails de l'événement");
        this.loading.set(false);
      },
    });
  }

  /** Vérifier adhésion utilisateur */
  private checkMembershipStatus(clubId: number) {
    const userId = this.userId();
    if (!userId) return;

    this.memberService.checkMembership(userId, clubId).subscribe({
      next: (result) => {
        if (result.exists && result.membership) {
          this.membershipId.set(result.membership.id);
          if (
            this.paymentType() === 'membership' &&
            result.membership.status === 'ACTIVE'
          ) {
            this.formError.set('Vous êtes déjà membre actif de ce club');
          }
        } else {
          this.membershipId.set(0);
        }
      },
      error: () => {
        // silent
      },
    });
  }

  /** Vérifier réduction */
  private checkMembershipDiscount(clubId: number) {
    const userId = this.userId();
    if (!userId) return;

    this.memberService.checkMembership(userId, clubId).subscribe({
      next: (result) => {
        if (result.exists && result.membership?.status === 'ACTIVE') {
          const basePrice = Number(this.eventDetails()?.subscriptionFees || 0);
          const discount = basePrice * 0.2;
          this.membershipDiscount.set(discount);
        }
      },
      error: () => {
        // silent
      },
    });
  }

  /** Formatage de la monnaie (utilise PaymentService) */
  formatCurrency(amountInTnd: number): string {
    return this.paymentService.formatCurrencyForDisplay(amountInTnd);
  }

  /** Lancement du processus de paiement (submit) */
  async processPayment() {
    this.formError.set(null);

    if (!this.paymentForm.valid) {
      this.formError.set('Veuillez remplir tous les champs correctement');
      return;
    }

    if (!this.elementsReady()) {
      this.formError.set('Les champs de paiement ne sont pas prêts');
      return;
    }

    this.processing.set(true);

    try {
      if (this.paymentType() === 'membership') {
        await this.processMembershipPayment();
      } else {
        await this.processEventPayment();
      }
    } catch (error: any) {
      const errorMessage =
        error?.error?.message || error?.message || 'Erreur lors du paiement';
      this.formError.set(errorMessage);
      this.processing.set(false);
    }
  }

  /** Traitement paiement adhésion */
  private async processMembershipPayment() {
    const userId = this.userId();
    const clubId = this.clubId();
    const membershipId = this.membershipId();

    if (!userId || !clubId) {
      throw new Error('Données manquantes pour le paiement');
    }

    const response = await firstValueFrom(
      this.paymentService.initiateMembershipPayment(userId, membershipId || clubId)
    );

    if (!response?.clientSecret) {
      throw new Error('Erreur initialisation paiement');
    }

    const pmResult = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.cardElement,
      billing_details: {
        name: this.paymentForm.get('cardName')?.value,
        email: this.paymentForm.get('email')?.value,
      },
    });

    if (pmResult.error) {
      throw new Error(pmResult.error.message);
    }

    const confirmResult = await this.stripe.confirmCardPayment(response.clientSecret, {
      payment_method: pmResult.paymentMethod.id,
    });

    if (confirmResult.error) {
      throw new Error(confirmResult.error.message);
    }

    if (confirmResult.paymentIntent?.status === 'succeeded') {
      await firstValueFrom(
        this.paymentService.confirmMembershipPayment(
          response.paymentId,
          confirmResult.paymentIntent.id
        )
      );

      this.router.navigate(['/payment/success'], {
        queryParams: { paymentId: response.paymentId, type: 'membership' },
      });
    }
  }

  /** Traitement paiement événement */
  private async processEventPayment() {
    const eventId = this.eventId();
    const userId = this.userId();

    if (!eventId || !userId) {
      throw new Error('Données manquantes pour le paiement');
    }

    const response = await firstValueFrom(
      this.paymentService.initiateEventPayment(userId, eventId)
    );

    if (!response?.clientSecret) {
      throw new Error('Erreur initialisation paiement');
    }

    const pmResult = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.cardElement,
      billing_details: {
        name: this.paymentForm.get('cardName')?.value,
        email: this.paymentForm.get('email')?.value,
      },
    });

    if (pmResult.error) {
      throw new Error(pmResult.error.message);
    }

    const confirmResult = await this.stripe.confirmCardPayment(response.clientSecret, {
      payment_method: pmResult.paymentMethod.id,
    });

    if (confirmResult.error) {
      throw new Error(confirmResult.error.message);
    }

    if (confirmResult.paymentIntent?.status === 'succeeded') {
      await firstValueFrom(
        this.paymentService.confirmEventPayment(response.paymentId, confirmResult.paymentIntent.id)
      );

      this.router.navigate(['/payment/success'], {
        queryParams: { paymentId: response.paymentId, type: 'event' },
      });
    }
  }

  /** Annuler */
  cancel() {
    if (confirm('Êtes-vous sûr de vouloir annuler le paiement ?')) {
      this.router.navigate(['/clubs']);
    }
  }
}
