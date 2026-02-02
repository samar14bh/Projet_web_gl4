import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-cash-payment-info',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './cash-payment-info.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashPaymentInfo {
    close = output<void>();
}
