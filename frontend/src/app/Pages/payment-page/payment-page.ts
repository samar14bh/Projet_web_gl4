import {
  Component,
  signal,
  computed,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  NgZone,
  Renderer2,
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
import { PaymentService } from '../../Core/services/payment.service';
import { ClubService } from '../../Core/services/club.service';
import { EventService } from '../../Core/services/event.service';
import { AuthService } from '../../Core/services/auth.service';
import { MemberService } from '../../Core/services/member.service';
import { PaymentHeaderComponent } from '../../shared/components/payments/payment-header/payment-header';
import { PaymentSummarySectionComponent } from '../../shared/components/payments/payment-summary-section/payment-summary-section';
import { PaymentFormComponent } from '../../shared/components/payments/payment-form/payment-form';
import { Error as ErrorComponent } from '../../shared/components/error/error';
import { Loader as LoaderComponent } from '../../shared/components/loader/loader';
import { PaymentPageState } from '../../shared/interfaces/payment.state';



@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    PaymentHeaderComponent,
    PaymentSummarySectionComponent,
    PaymentFormComponent,
    ErrorComponent,
    LoaderComponent,
  ],
  templateUrl: './payment-page.html',
  styleUrls: ['./payment-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentPageComponent implements OnInit, OnDestroy {
  private paymentService = inject(PaymentService);
  private clubService = inject(ClubService);
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private fb = inject(FormBuilder);
  private renderer = inject(Renderer2);


  state = signal<PaymentPageState>({
    paymentType: 'membership',
    clubId: null,
    eventId: null,
    membershipId: null,
    clubDetails: null,
    eventDetails: null,
    membershipDiscount: 0,
    loading: false,
    error: null,
    stripe: null,
  });

  // Subscriptions
  private queryParamsSub?: Subscription;

  // Computed - User
  userId = computed(() => Number(this.authService.currentUser()?.id) || 0);

  // Form
  paymentForm: FormGroup;

  // Computed amounts
  baseAmount = computed(() => {
    const s = this.state();
    if (s.paymentType === 'event' && s.eventDetails) {
      return Number(s.eventDetails.subscriptionFees || 0);
    }
    if (s.paymentType === 'membership' && s.clubDetails) {
      return s.clubDetails.membershipFeeAmount || 0;
    }
    return 0;
  });

  amount = computed(() => {
    const base = this.baseAmount();
    const discount = this.state().membershipDiscount;
    return Math.max(0, base - discount);
  });

  constructor() {
    this.paymentForm = this.fb.group({
      cardName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      saveCard: [false],
    });
  }

  async ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    await this.loadStripeScript();
    await this.loadStripePublishableKey();

    this.queryParamsSub = this.route.queryParams.subscribe((params) => {
      this.state.update(s => ({
        ...s,
        paymentType: params['type'] || s.paymentType,
        clubId: params['clubId'] ? +params['clubId'] : s.clubId,
        eventId: params['eventId'] ? +params['eventId'] : s.eventId
      }));

      const s = this.state();
      if (s.clubId) this.loadClubDetails(s.clubId);
      if (s.eventId) this.loadEventDetails();

      // Fallback
      if (!s.clubId && !s.eventId && s.paymentType === 'membership') {
        this.loadClubDetails(1);
      }
    });
  }

  ngOnDestroy() {
    this.queryParamsSub?.unsubscribe();
  }

  private async loadStripeScript(): Promise<void> {
    if ((window as any).Stripe) return;

    // Renderer2 doesn't have a direct equivalent for getElementById on document,
    // so we can use document.head.querySelector or similar via renderer
    const head = document.head;
    const existing = head.querySelector('#stripe-script');

    if (existing) {
      await new Promise<void>(resolve => {
        this.ngZone.runOutsideAngular(() => {
          const check = setInterval(() => {
            if ((window as any).Stripe) {
              clearInterval(check);
              this.ngZone.run(() => resolve());
            }
          }, 100);
        });
      });
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const script = this.renderer.createElement('script');
      this.renderer.setAttribute(script, 'id', 'stripe-script');
      this.renderer.setAttribute(script, 'src', 'https://js.stripe.com/v3/');
      this.renderer.setAttribute(script, 'async', 'true');

      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Stripe'));

      this.renderer.appendChild(head, script);
    });
  }


  private async loadStripePublishableKey() {
    try {
      const response = await firstValueFrom(this.paymentService.getStripePublishableKey());
      if (response?.publishableKey) {
        this.ngZone.runOutsideAngular(() => {
          const stripeInstance = (window as any).Stripe(response.publishableKey);
          this.ngZone.run(() => {
            this.state.update(s => ({ ...s, stripe: stripeInstance }));
          });
        });
      } else {
        this.state.update(s => ({ ...s, error: 'Impossible de charger la configuration Stripe' }));
      }
    } catch {
      this.state.update(s => ({ ...s, error: 'Erreur de configuration du paiement' }));
    }
  }

  private loadClubDetails(clubId: number) {
    this.state.update(s => ({ ...s, loading: true }));
    this.clubService.getClubById(clubId).subscribe({
      next: (club) => {
        this.state.update(s => ({ ...s, clubDetails: club, clubId: clubId, loading: false })); // Ensure clubId is set? It was handled by params, but redundancy is safe
        this.checkMembershipStatus(clubId);
      },
      error: () => {
        this.state.update(s => ({ ...s, error: 'Impossible de charger les détails du club', loading: false }));
      },
    });
  }

  private loadEventDetails() {
    const eventId = this.state().eventId;
    if (!eventId) return;

    this.state.update(s => ({ ...s, loading: true }));
    this.eventService.getEventById(eventId).subscribe({
      next: (event) => {
        this.state.update(s => ({ ...s, eventDetails: event, loading: false }));
        if (event?.club?.id) this.checkMembershipDiscount(event.club.id);
      },
      error: () => {
        this.state.update(s => ({ ...s, error: 'Impossible de charger les détails de l\'événement', loading: false }));
      },
    });
  }

  private checkMembershipStatus(clubId: number) {
    const userId = this.userId();
    if (!userId) return;

    this.memberService.checkMembership(userId, clubId).subscribe({
      next: (result) => {
        if (result.exists && result.membership) {
          this.state.update(s => ({ ...s, membershipId: result.membership.id }));
        } else {
          this.state.update(s => ({ ...s, membershipId: 0 }));
        }
      },
      error: () => { /* silent */ },
    });
  }

  private checkMembershipDiscount(clubId: number) {
    const userId = this.userId();
    if (!userId) return;

    this.memberService.checkMembership(userId, clubId).subscribe({
      next: (result) => {
        if (result.exists && result.membership?.status === 'ACTIVE') {
          const basePrice = Number(this.state().eventDetails?.subscriptionFees || 0);
          this.state.update(s => ({ ...s, membershipDiscount: basePrice * 0.2 }));
        }
      },
      error: () => { /* silent */ },
    });
  }
}
