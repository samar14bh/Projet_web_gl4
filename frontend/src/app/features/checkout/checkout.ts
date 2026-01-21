import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentService } from '../../Core/services/payment.service';
import { AuthService } from '../../Core/services/auth.service';
import { ClubService } from '../../Core/services/club.service';
import { EventService } from '../../Core/services/event.service';
import { MemberService } from '../../Core/services/member.service';
import { Subject, takeUntil } from 'rxjs';

declare var Stripe: any;

/**
 * CHECKOUT COMPONENT - Stripe Integration
 * Handles membership and event payment processing
 */
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent implements OnInit, OnDestroy, AfterViewInit {
  // Services
  private readonly route = inject(ActivatedRoute);
  private readonly paymentService = inject(PaymentService);
  private readonly authService = inject(AuthService);
  private readonly clubService = inject(ClubService);
  private readonly eventService = inject(EventService);
  private readonly memberService = inject(MemberService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  // Stripe
  private stripe: any;
  private elements: any;
  private cardElement: any;

  // Signals - Payment Type
  type = signal<'membership' | 'event'>('membership');
  id = signal<number>(1);
  userId = signal<number>(17);

  // Signals - Details
  clubDetails = signal<any>(null);
  eventDetails = signal<any>(null);
  membershipDiscount = signal<number>(0);

  // Signals - State
  processing = signal(false);
  error = signal<string | null>(null);
  loading = signal(true);

  // Form
  billingForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    address: [''],
    postalCode: [''],
    city: [''],
    country: ['TN'],
    acceptTOS: [false, Validators.required],
  });

  // Computed order summary
  orderSummary = signal<any>(null);

  ngOnInit(): void {
    // Load Stripe publishable key
    this.loadStripePublishableKey();

    // Get current user
    const user = this.authService.currentUser();
    if (user?.id) {
      this.userId.set(Number(user.id));
      this.billingForm.patchValue({
        fullName: `${user.name || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
      });
    }

    // Subscribe to route params
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const type = params['type'] || 'membership' ;
        const id = params['id'] || 1;

        this.type.set(type);
        this.id.set(Number(id));

        this.loading.set(true);

        if (type === 'membership') {
          this.loadMembershipDetails(Number(id));
        } else if (type === 'event') {
          this.loadEventDetails(Number(id));
        }
      });
  }

  ngAfterViewInit(): void {
    // Initialize Stripe elements if Stripe loaded
    if (this.stripe) {
      this.initializeStripeElements();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.cardElement) {
      this.cardElement.destroy();
    }
  }

  /**
   * Load Stripe publishable key and initialize
   */
  private loadStripePublishableKey(): void {
    this.paymentService
      .getStripePublishableKey()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response?.publishableKey) {
            this.stripe = Stripe(response.publishableKey);
          } else {
            this.error.set('Erreur: Configuration Stripe manquante');
          }
        },
        error: (err: any) => {
          console.error('Erreur chargement clé Stripe:', err);
          this.error.set('Erreur de configuration du paiement');
        },
      });
  }

  /**
   * Initialize Stripe card element
   */
  private initializeStripeElements(): void {
    if (!this.stripe) return;

    this.elements = this.stripe.elements();
    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '15px',
          color: '#0f172a',
          fontFamily: '"Inter", system-ui, sans-serif',
          '::placeholder': {
            color: '#cbd5e1',
          },
        },
        invalid: {
          color: '#ef4444',
        },
      },
    });

    const cardElementDiv = document.getElementById('card-element');
    if (cardElementDiv) {
      this.cardElement.mount(cardElementDiv);
    }
  }

  /**
   * Load membership details
   */
  private loadMembershipDetails(membershipId: number): void {
    // In a real app, you'd fetch from backend
    // For now, we'll use a placeholder
    this.clubDetails.set({
      id: membershipId,
      name: `Membership ${membershipId}`,
      description: 'Annual club membership',
      membershipFeeAmount: 25,
    });

    // Check for member discount
    this.checkMembershipDiscount(membershipId);
    this.updateOrderSummary();
    this.loading.set(false);
  }

  /**
   * Load event details
   */
  private loadEventDetails(eventId: number): void {
    this.eventService
      .getEventById(eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event: any) => {
          this.eventDetails.set(event);
          this.checkEventMemberDiscount(event.club.id);
          this.updateOrderSummary();
          this.loading.set(false);
        },
        error: (err: any) => {
          console.error('Erreur chargement événement:', err);
          this.error.set('Impossible de charger les détails de l\'événement');
          this.loading.set(false);
        },
      });
  }

  /**
   * Check membership status for discount
   */
  private checkMembershipDiscount(clubId: number): void {
    const userId = this.userId();
    if (!userId) return;

    this.memberService
      .checkMembership(userId, clubId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: any) => {
          if (result.exists && result.membership?.status === 'ACTIVE') {
            const baseAmount = this.clubDetails()?.membershipFeeAmount || 0;
            this.membershipDiscount.set(baseAmount * 0.2);
          }
        },
        error: (err: any) => {
          console.error('Erreur vérification adhésion:', err);
        },
      });
  }

  /**
   * Check if user is member for event discount
   */
  private checkEventMemberDiscount(clubId: number): void {
    const userId = this.userId();
    if (!userId) return;

    this.memberService
      .checkMembership(userId, clubId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: any) => {
          if (result.exists && result.membership?.status === 'ACTIVE') {
            const baseAmount = this.eventDetails()?.subscriptionFees || 0;
            this.membershipDiscount.set(baseAmount * 0.2);
          }
        },
        error: (err: any) => {
          console.error('Erreur vérification remise:', err);
        },
      });
  }

  /**
   * Update order summary
   */
  private updateOrderSummary(): void {
    let summary: any = {};

    if (this.type() === 'membership') {
      const club = this.clubDetails();
      if (club) {
        const basePrice = club.membershipFeeAmount;
        const discount = this.membershipDiscount();
        const total = basePrice - discount;

        summary = {
          title: 'Adhésion Club',
          itemName: club.name,
          price: basePrice.toFixed(2),
          discount: discount > 0 ? discount.toFixed(2) : 0,
          total: total.toFixed(2),
          currency: 'TND',
        };
      }
    } else if (this.type() === 'event') {
      const event = this.eventDetails();
      if (event) {
        const basePrice = Number(event.subscriptionFees);
        const discount = this.membershipDiscount();
        const total = basePrice - discount;

        summary = {
          title: 'Inscription Événement',
          itemName: event.title,
          price: basePrice.toFixed(2),
          discount: discount > 0 ? discount.toFixed(2) : 0,
          total: total.toFixed(2),
          currency: 'TND',
        };
      }
    }

    this.orderSummary.set(summary);
  }

  /**
   * Process payment
   */
  async pay(): Promise<void> {
    if (!this.billingForm.valid) {
      this.error.set('Veuillez remplir tous les champs requis');
      return;
    }

    if (!this.billingForm.get('acceptTOS')?.value) {
      this.error.set('Vous devez accepter les conditions générales');
      return;
    }

    this.processing.set(true);
    this.error.set(null);

    try {
      if (this.type() === 'membership') {
        await this.processMembershipPayment();
      } else if (this.type() === 'event') {
        await this.processEventPayment();
      }
    } catch (e: any) {
      this.processing.set(false);
      this.error.set(e?.message || 'Erreur inattendue lors du paiement');
    }
  }

  /**
   * Process membership payment with Stripe
   */
  private async processMembershipPayment(): Promise<void> {
    const userId = this.userId();
    const id = this.id();

    if (!userId || !id) {
      this.error.set('Données manquantes pour le paiement');
      this.processing.set(false);
      return;
    }

    try {
      // Step 1: Initiate payment
      const response: any = await this.paymentService
        .initiateMembershipPayment(userId, id)
        .toPromise();

      if (!response?.clientSecret) {
        throw new Error('Erreur initialisation paiement');
      }

      // Step 2: Confirm with Stripe
      const result = await this.stripe.confirmCardPayment(
        response.clientSecret,
        {
          payment_method: {
            card: this.cardElement,
            billing_details: {
              name: this.billingForm.get('fullName')?.value,
              email: this.billingForm.get('email')?.value,
            },
          },
        }
      );

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent.status === 'succeeded') {
        // Step 3: Confirm on backend
        await this.paymentService
          .confirmMembershipPayment(
            response.paymentId,
            result.paymentIntent.id
          )
          .toPromise();

        // Redirect to success
        this.router.navigate(['/payment/success'], {
          queryParams: {
            paymentId: response.paymentId,
            type: 'membership',
          },
        });
      }
    } catch (error: any) {
      this.processing.set(false);
      this.error.set(error.message || 'Erreur lors du paiement');
      console.error('Erreur paiement adhésion:', error);
    }
  }

  /**
   * Process event payment with Stripe
   */
  private async processEventPayment(): Promise<void> {
    const userId = this.userId();
    const id = this.id();

    if (!userId || !id) {
      this.error.set('Données manquantes pour le paiement');
      this.processing.set(false);
      return;
    }

    try {
      // Step 1: Initiate payment
      const response: any = await this.paymentService
        .initiateEventPayment(userId, id)
        .toPromise();

      if (!response?.clientSecret) {
        throw new Error('Erreur initialisation paiement');
      }

      // Step 2: Confirm with Stripe
      const result = await this.stripe.confirmCardPayment(
        response.clientSecret,
        {
          payment_method: {
            card: this.cardElement,
            billing_details: {
              name: this.billingForm.get('fullName')?.value,
              email: this.billingForm.get('email')?.value,
            },
          },
        }
      );

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent.status === 'succeeded') {
        // Step 3: Confirm on backend
        await this.paymentService
          .confirmEventPayment(
            response.paymentId,
            result.paymentIntent.id
          )
          .toPromise();

        // Redirect to success
        this.router.navigate(['/payment/success'], {
          queryParams: {
            paymentId: response.paymentId,
            type: 'event',
          },
        });
      }
    } catch (error: any) {
      this.processing.set(false);
      this.error.set(error.message || 'Erreur lors du paiement');
      console.error('Erreur paiement événement:', error);
    }
  }
}
