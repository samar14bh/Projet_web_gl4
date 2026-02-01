import { Component, inject, input, numberAttribute, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventService } from '../../Core/services/event.service';
import { DefaultImagePipe } from '../../shared/pipes/default-image.pipe';
import { RegistrationStatus } from '../../Core/models/event.model';
import { PaymentService } from '../../Core/services/payment.service';
import { PaymentModal } from '../../features/payment-modal/payment-modal';
import { Loader } from '../../shared/components/loader/loader';
import { Error } from '../../shared/components/error/error';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, DefaultImagePipe, PaymentModal, Loader, Error],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {

  public readonly RegistrationStatus = RegistrationStatus;
  showPaymentModal = false;


  private eventService = inject(EventService);
  private paymentService = inject(PaymentService);
  private router = inject(Router);

  userId = input(0, { transform: numberAttribute });
  eventId = input(0, { transform: numberAttribute });


  eventResource = this.eventService.getEventDetails(this.userId, this.eventId);

  event = computed(() => this.eventResource.value());
  isLoading = computed(() => this.eventResource.isLoading());
  error = computed(() => this.eventResource.error());

  constructor() {
    effect(() => {
      console.log('the user id is ', this.userId, this.eventId);
      console.log('Event Resource Value:', this.eventResource.value());
    });

  }

  downloadReceipt() {
    const event = this.event();
    if (!event || !event.paymentId) return;

    this.paymentService.downloadReceipt(event.paymentId).subscribe({
      next: (blob: Blob) => {
        this.paymentService.handleBlobDownload(blob, `recu-event-${event.id}.pdf`);
      },
      error: (err: any) => {
        console.error('Erreur téléchargement reçu:', err);
        alert('Erreur lors du téléchargement du reçu.');
      }
    });
  }

  navigateToPayment() {
    const event = this.event();
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
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
  }


  cancel() {
    const e = this.event();
    if (e && e.canCancel) {
      this.eventService.cancelRegistration(e.id).subscribe(() => {
        this.eventResource.reload();
      });
    }
  }

}
