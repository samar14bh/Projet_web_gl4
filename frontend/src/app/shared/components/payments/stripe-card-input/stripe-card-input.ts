import {
    Component,
    ChangeDetectionStrategy,
    input,
    output,
    AfterViewInit,
    OnDestroy,
    NgZone,
    inject,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Stripe Card Input - Smart Component
 * Wrapper for Stripe Elements card input fields
 */
@Component({
    selector: 'app-stripe-card-input',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './stripe-card-input.html',
    styleUrl: './stripe-card-input.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StripeCardInputComponent implements AfterViewInit, OnDestroy {
    private ngZone = inject(NgZone);

    stripe = input.required<any>();
    cardError = output<string | null>();
    elementsReady = output<{ ready: boolean; cardElement: any }>();

    private elements: any;
    private cardElement: any;
    private expiryElement: any;
    private cvcElement: any;

    cardErrorMessage = signal<string | null>(null);

    ngAfterViewInit() {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            this.initializeStripeElements();
        }, 100);
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

    private initializeStripeElements() {
        const stripeInstance = this.stripe();
        if (!stripeInstance) {
            this.cardError.emit('Stripe non initialisé');
            return;
        }

        try {
            this.elements = stripeInstance.elements();

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
                    this.addElementListeners();
                } catch {
                    this.ngZone.run(() => this.cardError.emit('Erreur lors du montage des éléments Stripe'));
                }
            });

            this.ngZone.run(() => {
                this.elementsReady.emit({ ready: true, cardElement: this.cardElement });
            });
        } catch {
            this.cardError.emit("Erreur lors de l'initialisation des champs de paiement");
        }
    }

    private addElementListeners() {
        if (!this.cardElement || !this.expiryElement || !this.cvcElement) return;

        this.cardElement.on('change', (event: any) => {
            this.ngZone.run(() => {
                const error = event.error ? event.error.message : null;
                this.cardErrorMessage.set(error);
                this.cardError.emit(error);
            });
        });

        this.expiryElement.on('change', (event: any) => {
            this.ngZone.run(() => {
                if (event.error) {
                    this.cardErrorMessage.set(event.error.message);
                    this.cardError.emit(event.error.message);
                }
            });
        });

        this.cvcElement.on('change', (event: any) => {
            this.ngZone.run(() => {
                if (event.error) {
                    this.cardErrorMessage.set(event.error.message);
                    this.cardError.emit(event.error.message);
                }
            });
        });
    }
}
