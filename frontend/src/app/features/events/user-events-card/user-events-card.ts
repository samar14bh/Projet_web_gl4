import { Component, Input, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UserEventDto } from '../../../Core/dtos/user-event.dto';
import { EventService } from '../../../Core/services/event.service';
import { PaymentService } from '../../../Core/services/payment.service';
import { Router } from '@angular/router';
import { PaymentModal } from '../../payment-modal/payment-modal';

@Component({
  selector: 'app-user-events-card',
  standalone: true,
  imports: [CommonModule, DatePipe, PaymentModal],
  templateUrl: './user-events-card.html',
  styleUrls: ['./user-events-card.css'],
})
export class UserEventsCard {
  @Input() event!: UserEventDto;
  showPaymentModal: boolean = false;

  private readonly eventService = inject(EventService);
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);

  viewEventDetails() {
    this.router.navigate(['/user-event-details', 1, this.event.id]);
  }

  async cancelRegistration() {
    if (!this.event.canCancel) return;
    if (!confirm(`Annuler l'inscription à "${this.event.title}" ?`)) return;

    try {
      await this.eventService.cancelRegistration(this.event.id).toPromise();
      alert('Inscription annulée avec succès');
    } catch {
      alert('Erreur lors de l’annulation');
    }
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
