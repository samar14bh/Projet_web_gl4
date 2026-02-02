import { Component, inject, input, numberAttribute, computed, effect, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventService } from '../../Core/services/event.service';
import { DefaultImagePipe } from '../../shared/pipes/default-image.pipe';
import { RegistrationStatus } from '../../Core/models/event.model';
import { PaymentService } from '../../Core/services/payment.service';
import { PaymentModal } from '../../features/payment-modal/payment-modal';
import { Loader } from '../../shared/components/loader/loader';
import { Error } from '../../shared/components/error/error';
import { ConfirmModal } from '../../shared/components/confirm-modal/confirm-modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, DefaultImagePipe, PaymentModal, Loader, Error, ConfirmModal],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventDetails {

  public readonly RegistrationStatus = RegistrationStatus;
  showPaymentModal = signal(false);
  showConfirmModal = signal(false);


  private eventService = inject(EventService);
  private paymentService = inject(PaymentService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  userId = input(0, { transform: numberAttribute });
  eventId = input(0, { transform: numberAttribute });


  eventResource = this.eventService.getEventDetails(this.userId, this.eventId);



  constructor() {
    effect(() => {
      console.log('the user id is ', this.userId, this.eventId);
      console.log('Event Resource Value:', this.eventResource.value());
    });

  }

  downloadReceipt() {
    const event = this.eventResource.value();
    if (!event || !event.paymentId) return;

    this.paymentService.downloadReceipt(event.paymentId).subscribe({
      next: (blob: Blob) => {
        this.paymentService.handleBlobDownload(blob, `recu-event-${event.id}.pdf`);
      },
      error: (err: any) => {
        console.error('Erreur téléchargement reçu:', err);
        this.toastr.error('Erreur', 'Erreur lors du téléchargement du reçu.');
      }
    });
  }

  navigateToPayment() {
    const event = this.eventResource.value();
    if (!event) return;

    this.router.navigate(['/payment'], {
      queryParams: {
        type: 'event',
        eventId: event.id,
        clubId: event.club?.id
      }
    });
    this.closePaymentModal();
  }
  openPaymentModal() {
    this.showPaymentModal.set(true);
  }

  closePaymentModal() {
    this.showPaymentModal.set(false);
  }


  cancel() {
    this.showConfirmModal.set(true);
  }

  onConfirmCancellation() {
    const e = this.eventResource.value();
    const uId = this.userId();
    if (e && e.canCancel && uId) {
      this.eventService.cancelRegistration(e.id, uId).subscribe({
        next: () => {
          this.eventResource.reload();
          this.showConfirmModal.set(false);
          this.toastr.success('Succès', 'Inscription annulée avec succès');
        },
        error: () => this.toastr.error('Erreur', "Echec de l'annulation")
      });
    }
  }

  closeConfirmModal() {
    this.showConfirmModal.set(false);
  }

}
