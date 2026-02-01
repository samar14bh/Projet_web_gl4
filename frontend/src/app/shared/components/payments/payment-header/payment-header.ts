import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-payment-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payment-header.html',
    styleUrl: './payment-header.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentHeaderComponent {
    title = input<string>('Paiement Sécurisé');
    subtitle = input<string>('Effectuez votre paiement via Stripe');
    icon = input<string>('bi bi-lock-fill');
}
