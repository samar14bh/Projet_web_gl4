import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashPaymentInfo } from './cash-payment-info/cash-payment-info';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, CashPaymentInfo],
  templateUrl: './payment-modal.html',
  styleUrl: './payment-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentModal {
  @Output() close = new EventEmitter<void>();
  @Output() payOnline = new EventEmitter<void>();

  showCashInfo = false;

  selectPaymentMethod(method: 'cash' | 'online') {
    if (method === 'cash') {
      this.showCashInfo = true;
    } else {
      this.payOnline.emit();
      this.closeModal();
    }
  }

  closeModal() {
    this.close.emit();
  }

}
