import { Component, OnInit, ChangeDetectionStrategy, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PaymentService } from '../../Core/services/payment.service';
import { AuthService } from '../../Core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

/**
 * PAGE 11: Checkout (standalone, optimized)
 * - Uses signals and async-friendly patterns
 * - Placeholder for Stripe integration (use stripe.js on client)
 */
@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    templateUrl: './checkout.html',
    styleUrl: './checkout.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent implements OnInit, OnDestroy {
    private readonly route = inject(ActivatedRoute);
    private readonly paymentService = inject(PaymentService);
    private readonly authService = inject(AuthService);
    private readonly fb = inject(FormBuilder);
    private destroy$ = new Subject<void>();

    // Signals
    processing = signal(false);
    error = signal<string | null>(null);
    type = signal<string>('');
    id = signal<string>('');

    // Form
    billingForm = this.fb.group({
        fullName: [''],
        email: [''],
        address: [''],
        postalCode: [''],
        city: [''],
        country: ['FR'],
        acceptTOS: [false],
    });

    // summary placeholder
    orderSummary = signal<any>(null);

    ngOnInit(): void {
        // Subscribe to route params changes
        this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
            const type = params.get('type') || '';
            const id = params.get('id') || '';

            console.log('Route params:', { type, id });

            this.type.set(type);
            this.id.set(id);

            // Load order summary when params change
            this.loadOrderSummary();
        });

        const user = this.authService.currentUser();
        if (user) {
            this.billingForm.patchValue({
                fullName: `${user.name || ''} ${user.lastName || ''}`.trim(),
                email: user.email || '',
            });
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadOrderSummary() {
        console.log('Loading order summary for:', { type: this.type(), id: this.id() });

        // For memberships/events we should call backend to get full details
        // Here we call paymentService or a dedicated endpoint (not implemented) and set a placeholder
        this.orderSummary.set({
            title: this.type() === 'membership' ? 'Adhésion' : 'Inscription événement',
            itemName: `Item ${this.id()}`,
            price: 29.99,
            tax: 0,
            total: 29.99,
            date: new Date().toISOString(),
        });

        console.log('Order summary set:', this.orderSummary());
    }

    async pay() {
        if (!this.billingForm.value.acceptTOS) {
            this.error.set('Vous devez accepter les conditions générales.');
            return;
        }

        this.processing.set(true);
        this.error.set(null);

        try {
            // Integrate with paymentService to create PaymentIntent or Checkout flow
            // Example for membership/event (backend integration required):
            if (this.type() === 'membership') {
                // call processMembershipPayment when backend supports Stripe elements
                this.paymentService.processMembershipPayment({
                    membershipId: parseInt(this.id(), 10) || 0,
                    clubId: parseInt(this.id(), 10) || 0,
                    userId: parseInt(this.authService.currentUser()?.id || '0', 10) || 0,
                }).subscribe({
                    next: () => {
                        this.processing.set(false);
                        // navigate to user clubs or success page
                    },
                    error: (err) => {
                        this.processing.set(false);
                        this.error.set(err?.message || 'Erreur lors du paiement');
                    }
                });
            } else {
                // event payment
                this.paymentService.processEventPayment({
                    eventId: parseInt(this.id(), 10) || 0,
                    userId: parseInt(this.authService.currentUser()?.id || '0', 10) || 0,
                }).subscribe({
                    next: () => {
                        this.processing.set(false);
                    },
                    error: (err) => {
                        this.processing.set(false);
                        this.error.set(err?.message || 'Erreur lors du paiement');
                    }
                });
            }
        } catch (e: any) {
            this.processing.set(false);
            this.error.set(e?.message || 'Erreur inattendue');
        }
    }
}

