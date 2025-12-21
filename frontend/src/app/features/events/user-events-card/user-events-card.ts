import { Component, Input, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UserEventDto } from '../../../Core/dtos/user-event.dto';
import { EventService } from '../../../Core/services/event.service';
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
      // Optionally emit an event to parent to reload the list
    } catch {
      alert('Erreur lors de l’annulation');
    }
  }

  async viewReceipt() {
    console.log("will be dev")
  }


  openPaymentModal() {
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
  }
}
