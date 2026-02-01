import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UserEventDto } from '../../../Core/dtos/user-events/user-event.dto';
import { EventService } from '../../../Core/services/event.service';
import { PaymentService } from '../../../Core/services/payment.service';
import { Router } from '@angular/router';
import { PaymentModal } from '../../payment-modal/payment-modal';
import { ToastService } from '../../../Core/services/toast.service';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { AuthService } from '../../../Core/services/auth.service';

@Component({
  selector: 'app-user-events-card',
  standalone: true,
  imports: [CommonModule, DatePipe, PaymentModal, ConfirmModal],
  templateUrl: './user-events-card.html',
  styleUrls: ['./user-events-card.css'],
})
export class UserEventsCard {
  @Input() event!: UserEventDto;
  @Output() onCancelled = new EventEmitter<void>();
  showPaymentModal: boolean = false;
  showConfirmModal: boolean = false;

  private readonly authService = inject(AuthService);
  private readonly eventService = inject(EventService);
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly USER_ID = Number(this.authService.currentUser()?.id ?? 0);
  viewEventDetails() {
    this.router.navigate(['/user-event-details', this.USER_ID, this.event.id]);
  }

  cancelRegistration() {
    if (!this.event.canCancel) return;
    this.showConfirmModal = true;
  }

  onConfirmCancellation() {
    this.showConfirmModal = false;
    this.eventService.cancelRegistration(this.event.id, this.USER_ID).subscribe({
      next: () => {
        this.toastService.success('Inscription annulée avec succès');
        this.onCancelled.emit();
      },
      error: () => {
        this.toastService.error('Erreur lors de l’annulation');
      }
    });
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
  }

  viewReceipt() {
    if (!this.event.paymentId) return;

    this.paymentService.downloadReceipt(this.event.paymentId).subscribe({
      next: (blob: Blob) => {
        this.paymentService.handleBlobDownload(blob, `recu-event-${this.event.id}.pdf`);
      },
      error: (err: any) => {
        console.error('Erreur téléchargement reçu:', err);
        alert('Erreur lors du téléchargement du reçu.');
      }
    });
  }


  openPaymentModal() {
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
  }
}
