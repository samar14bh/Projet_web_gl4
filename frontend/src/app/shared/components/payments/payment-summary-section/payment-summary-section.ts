import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentOrderSummaryComponent } from '../payment-order-summary/payment-order-summary';

@Component({
    selector: 'app-payment-summary-section',
    standalone: true,
    imports: [CommonModule, PaymentOrderSummaryComponent],
    templateUrl: './payment-summary-section.html',
    styleUrl: './payment-summary-section.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentSummarySectionComponent {
    paymentType = input.required<'membership' | 'event'>();
    clubDetails = input<any>(null);
    eventDetails = input<any>(null);

    baseAmount = input.required<number>();
    finalAmount = input.required<number>();
    discount = input<number>(0);
}
