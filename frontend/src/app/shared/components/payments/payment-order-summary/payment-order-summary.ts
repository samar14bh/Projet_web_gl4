import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CurrencyTndPipe } from '../../../pipes/currency-tnd.pipe';

/**
 * Payment Order Summary - Dumb Component
 * Displays the order summary for checkout with pricing details
 */
@Component({
    selector: 'app-payment-order-summary',
    standalone: true,
    imports: [CommonModule, DatePipe, CurrencyTndPipe],
    templateUrl: './payment-order-summary.html',
    styleUrl: './payment-order-summary.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentOrderSummaryComponent {
    paymentType = input.required<'membership' | 'event'>();
    productName = input.required<string>();
    productDescription = input<string>();
    baseAmount = input.required<number>();
    finalAmount = input.required<number>();
    discount = input<number>(0);
    location = input<string>();
    startDate = input<string>();

    get hasDiscount(): boolean {
        return this.discount() > 0;
    }
}
