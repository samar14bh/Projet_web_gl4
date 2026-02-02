import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UserEventDto } from '../../../Core/dtos/user-events/user-event.dto';
import { EventService } from '../../../Core/services/event.service';
import { PaymentService } from '../../../Core/services/payment.service';
import { Router } from '@angular/router';
import { PaymentModal } from '../../payment-modal/payment-modal';
import { ToastService } from '../../../Core/services/toast.service';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { AuthService } from '../../../Core/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-events-card',
  standalone: true,
  imports: [CommonModule, DatePipe, PaymentModal, ConfirmModal],
  templateUrl: './user-events-card.html',
  styleUrls: ['./user-events-card.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserEventsCard {
  event = input.required<UserEventDto>();
  onCancelled = output<void>();

  showPaymentModal = signal(false);
  showConfirmModal = signal(false);

  private readonly authService = inject(AuthService);
  private readonly eventService = inject(EventService);
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);


  private readonly USER_ID = Number(this.authService.currentUser()?.id ?? 0);

  viewEventDetails() {
    this.router.navigate(['/user-event-details', this.USER_ID, this.event().id]);
  }

  cancelRegistration() {
    if (!this.event().canCancel) return;
    this.showConfirmModal.set(true);
  }

  onConfirmCancellation() {
    this.showConfirmModal.set(false);
    this.eventService.cancelRegistration(this.event().id, this.USER_ID)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.toastService.success('Inscription annulée avec succès');
          this.onCancelled.emit();
        },
        error: () => {
          this.toastService.error('Erreur lors de l\'annulation');
        }
      });
  }

  closeConfirmModal() {
    this.showConfirmModal.set(false);
  }

  viewReceipt() {
    const paymentId = this.event().paymentId;
    if (!paymentId) return;

    this.paymentService.downloadReceipt(paymentId)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (blob: Blob) => {
          this.paymentService.handleBlobDownload(blob, `recu-event-${this.event().id}.pdf`);
        },
        error: (err: any) => {
          console.error('Erreur téléchargement reçu:', err);
          alert('Erreur lors du téléchargement du reçu.');
        }
      });
  }

  openPaymentModal() {
    this.showPaymentModal.set(true);
  }

  closePaymentModal() {
    this.showPaymentModal.set(false);
  }

  redirectToPayment() {
    this.showPaymentModal = false;
    this.router.navigate(['/payment'], {
      queryParams: {
        type: 'event',
        eventId: this.event.id
      }
    });
  }
}
