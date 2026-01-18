import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../../Core/services/payment.service';
import { ClubService } from '../../../Core/services/club.service';
import { EventService } from '../../../Core/services/event.service';
import { AuthService } from '../../../Core/services/auth.service';
import { MemberService } from '../../../Core/services/member.service';

/**
 * PAGE 11: Payment Page
 * Handles payment for club memberships and events
 */
@Component({
    selector: 'app-payment-page',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './payment-page.html',
    styleUrl: './payment-page.css',
})
export class PaymentPageComponent implements OnInit {
    // Services
    private paymentService = inject(PaymentService);
    private clubService = inject(ClubService);
    private eventService = inject(EventService);
    private authService = inject(AuthService);
    private memberService = inject(MemberService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    // Payment context signals
    paymentType = signal<'membership' | 'event'>('membership');
    clubId = signal<number | null>(null);
    eventId = signal<number | null>(null);
    userId = computed(() => Number(this.authService.currentUser()?.id) || 0);
    selectedMethod = signal<'CARD' | 'CASH'>('CARD');

    // Data signals
    clubDetails = signal<any>(null);
    eventDetails = signal<any>(null);
    membershipDiscount = signal<number>(0);
    membershipId = signal<number | null>(null);

    // Form signals
    cardNumber = signal('');
    cardName = signal('');
    cardExpiry = signal('');
    cardCVV = signal('');

    // State signals
    loading = signal(false);
    processing = signal(false);
    error = signal<string | null>(null); // For fatal/loading errors
    formError = signal<string | null>(null); // For validation/payment errors

    // Computed values
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

    baseAmount = computed(() => {
        if (this.paymentType() === 'event' && this.eventDetails()) {
            return Number(this.eventDetails().subscriptionFees || 0);
        }
        return this.amount();
    });

    hasDiscount = computed(() => this.membershipDiscount() > 0);

    title = computed(() => {
        if (this.paymentType() === 'membership' && this.clubDetails()) {
            return `Cotisation - ${this.clubDetails().name}`;
        } else if (this.paymentType() === 'event' && this.eventDetails()) {
            return `Inscription - ${this.eventDetails().title}`;
        }
        return 'Paiement';
    });

    ngOnInit() {
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
            return;
        }

        // Get payment context from query parameters
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
                this.loading.set(false);
            }
        });
    }

    loadEventDetails() {
        const eventId = this.eventId();
        if (!eventId) return;

        this.loading.set(true);
        this.eventService.getEventById(eventId).subscribe({
            next: (event) => {
                this.eventDetails.set(event);
                // Check if user is a member of the club for discount
                this.checkMembershipDiscount(event.club.id);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set('Impossible de charger les détails de l\'événement');
                this.loading.set(false);
            }
        });
    }

    checkMembershipStatus(clubId: number) {
        const userId = this.userId();
        if (!userId) return;

        this.memberService.checkMembership(userId, clubId).subscribe({
            next: (result) => {
                if (result.exists && result.membership) {
                    this.membershipId.set(result.membership.id);
                    // If paying for membership but already a member, check status
                    if (this.paymentType() === 'membership' && result.membership.status === 'ACTIVE') {
                        // This is a validation/logic error, but can be considered fatal for the flow?
                        // Or show in form? 'Vous êtes déjà membre'.
                        // Let's use formatted form error or fatal?
                        // Since it prevents the page purpose, fatal is mostly apt, but formError keeps context.
                        this.formError.set('Vous êtes déjà membre actif de ce club');
                    }
                } else if (this.paymentType() === 'membership') {
                    // Logic to handle new membership
                }
            },
            error: () => {
                // Ignore error, just assume not member
            }
        });
    }

    checkMembershipDiscount(clubId: number) {
        const userId = this.userId();
        if (!userId) return;

        this.memberService.checkMembership(userId, clubId).subscribe({
            next: (result) => {
                if (result.exists && result.membership?.status === 'ACTIVE') {
                    // 20% discount for members
                    // TODO: Get real percentage from configuration
                    const basePrice = Number(this.eventDetails()?.subscriptionFees || 0);
                    this.membershipDiscount.set(basePrice * 0.2);
                }
            }
        });
    }

    processPayment() {
        this.formError.set(null); // Clear previous errors

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

    processMembershipPayment() {
        const clubId = this.clubId();
        const userId = this.userId();
        const membershipId = this.membershipId();

        if (!clubId) {
            this.error.set('Club non spécifié'); // Fatal
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
                // Redirect to success page
                this.router.navigate(['/payment/success'], {
                    queryParams: {
                        paymentId: payment.id,
                        type: 'membership'
                    }
                });
            },
            error: (err) => {
                this.processing.set(false);
                this.formError.set(err.error?.message || 'Erreur lors du paiement');
            }
        });
    }

    processEventPayment() {
        const eventId = this.eventId();
        const userId = this.userId();

        if (!eventId) {
            this.error.set('Événement non spécifié'); // Fatal
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
                // Redirect to success page
                this.router.navigate(['/payment/success'], {
                    queryParams: {
                        paymentId: result.payment.id,
                        type: 'event'
                    }
                });
            },
            error: (err) => {
                this.processing.set(false);
                this.formError.set(err.error?.message || 'Erreur lors du paiement');
            }
        });
    }

    validateForm(): boolean {
        // Basic validation
        if (!this.cardNumber() || this.cardNumber().replace(/\s/g, '').length !== 16) {
            this.formError.set('Numéro de carte invalide');
            return false;
        }
        if (!this.cardName()) {
            this.formError.set('Nom du titulaire requis');
            return false;
        }
        if (!this.cardExpiry() || !this.cardExpiry().match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
            this.formError.set('Date d\'expiration invalide (MM/YY)');
            return false;
        }
        if (!this.cardCVV() || this.cardCVV().length !== 3) {
            this.formError.set('CVV invalide');
            return false;
        }
        return true;
    }

    formatCardNumber(event: any) {
        let value = event.target.value.replace(/\D/g, '');
        value = value.substring(0, 16);
        // Add spaces every 4 digits
        const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
        this.cardNumber.set(formattedValue);
    }

    formatExpiry(event: any) {
        let value = event.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        this.cardExpiry.set(value);
    }

    formatCVV(event: any) {
        let value = event.target.value.replace(/\D/g, '');
        value = value.substring(0, 3);
        this.cardCVV.set(value);
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('fr-TN', {
            style: 'currency',
            currency: 'TND',
            minimumFractionDigits: 2
        }).format(amount);
    }

    cancel() {
        this.router.navigate(['/clubs']);
    }
}
