import { Component, inject, input, numberAttribute, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../Core/services/event.service';
import { DefaultImagePipe } from '../../../shared/pipes/default-image.pipe';
import { RegistrationStatus } from '../../../Core/models/event.model';
import { PaymentModal } from '../../../features/payment-modal/payment-modal';
import { Loader } from '../../../shared/components/loader/loader';
import { Error } from '../../../shared/components/error/error';

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

  userId = input.required({ transform: numberAttribute });
  eventId = input.required({ transform: numberAttribute });


  eventResource = this.eventService.getEventDetails(this.userId, this.eventId);

  event = computed(() => this.eventResource.value()
  );
  isLoading = computed(() => this.eventResource.isLoading());
  error = computed(() => this.eventResource.error());

  constructor() {
    effect(() => {
      console.log('Event Resource Value:', this.eventResource.value());
    });

  }

  downloadReceipt() {
    console.log("download receipt")
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
