import {
    Component,
    ChangeDetectionStrategy,
    input,
    output,
    inject,
    OnInit,
    AfterViewInit,
    OnDestroy,
    NgZone,
    ChangeDetectorRef,
    signal,
    computed,
    effect,
    ViewChild,
    ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PaymentService } from '../../../../Core/services/payment.service';
import { PaymentFormState } from '../../../../shared/interfaces/payment.state';
import { ClubService } from '../../../../Core/services/club.service';
import { NotificationService } from '../../../../Core/services/notification.service';

declare var Stripe: any;


@Component({
    selector: 'app-payment-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './payment-form.html',
    styleUrl: './payment-form.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentFormComponent implements AfterViewInit, OnDestroy {
    // Services
    private paymentService = inject(PaymentService);
    private clubService = inject(ClubService);
    private notificationService = inject(NotificationService);
    private router = inject(Router);
    private ngZone = inject(NgZone);
    private cdr = inject(ChangeDetectorRef);

    // Inputs
    paymentForm = input.required<FormGroup>();
    amount = input.required<number>();
    paymentType = input.required<'membership' | 'event'>();
    stripe = input.required<any>();

    // Identifiers for payment processing
    userId = input.required<number>();
    clubId = input<number | null>(null);
    eventId = input<number | null>(null);
    membershipId = input<number | null>(null);

    // Stripe Element Containers
    @ViewChild('cardNumberElement') cardNumberContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('cardExpiryElement') cardExpiryContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('cardCvcElement') cardCvcContainer!: ElementRef<HTMLDivElement>;

    // Internal state
    state = signal<PaymentFormState>({
        processing: false,
        elementsReady: false,
        formError: null,
        cardError: null
    });

    // Stripe Elements
    private elements: any;
    private cardElement: any;
    private expiryElement: any;
    private cvcElement: any;

    // Saved Cards State
    savedCards = signal<any[]>([]);
    selectedCardId = signal<string | null>(null);

    constructor() {
        effect(() => {
            const stripe = this.stripe();
            // Check if Elements not ready and we have stripe
            // Note: ViewChild might not be ready yet if effect runs very early,
            // but usually AfterViewInit covers the initial mount.
            if (stripe && !this.state().elementsReady) {
                this.ngZone.runOutsideAngular(() => {
                    this.initializeStripeElements();
                });
            }
        });

        // Load saved cards when userId is available
        effect(() => {
            const uid = this.userId();
            if (uid) {
                this.paymentService.getSavedPaymentMethods(uid).subscribe({
                    next: (cards) => this.savedCards.set(cards),
                    error: (err) => console.error('Error fetching saved cards', err)
                });
            }
        }, { allowSignalWrites: true });
    }

    async ngAfterViewInit() {
        if (this.stripe() && !this.state().elementsReady) {
            this.initializeStripeElements();
        }
    }

    ngOnDestroy() {
        try {
            this.cardElement?.destroy?.();
            this.expiryElement?.destroy?.();
            this.cvcElement?.destroy?.();
        } catch {
            // ignore
        }
    }

    /** Initialize Stripe Elements */
    private initializeStripeElements() {
        try {
            if (this.state().elementsReady) return;

            this.elements = this.stripe().elements();

            const baseStyle = {
                base: {
                    fontSize: '16px',
                    color: '#0f172a',
                    fontFamily: '"Inter", system-ui, sans-serif',
                    '::placeholder': { color: '#9ca3af' },
                },
                invalid: { color: '#ef4444' },
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

            if (!this.cardNumberContainer || !this.cardExpiryContainer || !this.cardCvcContainer) {
                console.warn('Payment containers not found in view');
                return;
            }

            this.cardElement.mount(this.cardNumberContainer.nativeElement);
            this.expiryElement.mount(this.cardExpiryContainer.nativeElement);
            this.cvcElement.mount(this.cardCvcContainer.nativeElement);

            this.addElementListeners();

            this.ngZone.run(() => {
                this.state.update(s => ({ ...s, elementsReady: true }));
                this.cdr.detectChanges();
            });
        } catch (err) {
            console.error('Error initializing Stripe elements', err);
            this.ngZone.run(() => {
                this.state.update(s => ({ ...s, formError: 'Erreur chargement Stripe' }));
            });
        }
    }

    private addElementListeners() {
        const handleError = (event: any) => {
            this.ngZone.run(() => {
                this.state.update(s => ({ ...s, cardError: event.error ? event.error.message : null }));
            });
        };

        this.cardElement.on('change', handleError);
        this.expiryElement.on('change', handleError);
        this.cvcElement.on('change', handleError);
    }

    /** Process Payment */
    async onSubmit() {
        this.state.update(s => ({ ...s, formError: null }));
        const form = this.paymentForm();

        // If using a saved card, we don't need the Stripe Elements to be populated/valid
        // But we still need the form (email, name) to be valid?
        // Actually name/email might be auto-filled or not needed for saved card?
        // Let's assume we still want the contact info.
        if (!form.valid) {
            this.state.update(s => ({ ...s, formError: 'Veuillez remplir correctement tous les champs' }));
            return;
        }

        // If NEW card selected (selectedCardId is null), check elements
        if (!this.selectedCardId() && !this.state().elementsReady) {
            this.state.update(s => ({ ...s, formError: 'Les champs de paiement ne sont pas prêts' }));
            return;
        }

        this.state.update(s => ({ ...s, processing: true }));

        try {
            if (this.paymentType() === 'membership') {
                await this.processMembershipPayment();
            } else {
                await this.processEventPayment();
            }
        } catch (error: any) {
            const msg = error?.error?.message || error?.message || 'Erreur lors du paiement';
            this.state.update(s => ({ ...s, formError: msg, processing: false }));
        }
    }

    private async processMembershipPayment() {
        const userId = this.userId();
        const clubId = this.clubId();
        const membershipId = this.membershipId();
        const saveCard = this.paymentForm().get('saveCard')?.value;

        if (!userId || !clubId) throw new Error('Données manquantes');

        const options: any = { saveCard };
        if (this.selectedCardId()) {
            options.paymentMethodId = this.selectedCardId();
        }

        const response = (await firstValueFrom(
            this.paymentService.initiateMembershipPayment(userId, membershipId || clubId!, options)
        )) as any;

        await this.confirmPayment(response.clientSecret, response.paymentId, 'membership');
    }

    private async processEventPayment() {
        const userId = this.userId();
        const eventId = this.eventId();
        const saveCard = this.paymentForm().get('saveCard')?.value;

        if (!userId || !eventId) throw new Error('Données manquantes');

        const options: any = { saveCard };
        if (this.selectedCardId()) {
            options.paymentMethodId = this.selectedCardId();
        }

        const response = (await firstValueFrom(
            this.paymentService.initiateEventPayment(userId, eventId, options)
        )) as any;

        await this.confirmPayment(response.clientSecret, response.paymentId, 'event');
    }

    private async confirmPayment(clientSecret: string, paymentId: number, type: 'membership' | 'event') {
        const form = this.paymentForm();
        const cardName = form.get('cardName')?.value;
        const email = form.get('email')?.value;
        const savedCardId = this.selectedCardId();

        // Run Stripe operations outside Angular to avoid change detection on internal events
        await this.ngZone.runOutsideAngular(async () => {
            try {
                let paymentMethodId: string;

                if (savedCardId) {
                    // Use saved card
                    paymentMethodId = savedCardId;
                } else {
                    // Create new payment method
                    const pmResult = await this.stripe().createPaymentMethod({
                        type: 'card',
                        card: this.cardElement,
                        billing_details: {
                            name: cardName,
                            email: email,
                        },
                    });

                    if (pmResult.error) {
                        this.ngZone.run(() => {
                            throw new Error(pmResult.error.message);
                        });
                        return;
                    }
                    paymentMethodId = pmResult.paymentMethod.id;
                }

                const confirmResult = await this.stripe().confirmCardPayment(clientSecret, {
                    payment_method: paymentMethodId,
                });

                if (confirmResult.error) {
                    this.ngZone.run(() => {
                        throw new Error(confirmResult.error.message);
                    });
                    return;
                }

                if (confirmResult.paymentIntent?.status === 'succeeded') {
                    // ... success handling matches existing code ...
                    this.handlePaymentSuccess(paymentId, type, confirmResult.paymentIntent.id);
                }
            } catch (error: any) {
                this.ngZone.run(() => {
                    // Re-throw to be caught by onSubmit
                    throw error;
                });
            }
        });
    }

    private async handlePaymentSuccess(paymentId: number, type: 'membership' | 'event', paymentIntentId: string) {
        let confirmation$ = (type === 'membership')
            ? this.paymentService.confirmMembershipPayment(paymentId, paymentIntentId)
            : this.paymentService.confirmEventPayment(paymentId, paymentIntentId);

        await firstValueFrom(confirmation$);

        this.ngZone.run(() => {
            this.router.navigate(['/payment/success'], {
                queryParams: { paymentId, type },
            });
        });
    }

    onCancel() {
        if (confirm('Annuler le paiement ?')) {
            this.router.navigate(['/clubs']);
        }
    }

    formatCurrency(amount: number): string {
        if (!amount && amount !== 0) return '0.00 TND';
        try {
            return new Intl.NumberFormat('fr-TN', {
                style: 'currency',
                currency: 'TND',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        } catch {
            return `${amount} TND`;
        }
    }
}
