import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UserEventDto } from '../../../Core/dtos/user-event.dto';
import { EventService } from '../../../Core/services/event.service';
import { Router } from '@angular/router';
import {PaymentModal} from '../../payment-modal/payment-modal';

@Component({
  selector: 'app-user-events-card',
  standalone: true,
  imports: [CommonModule, DatePipe, PaymentModal],
  templateUrl: './user-events-card.html',
  styleUrls: ['./user-events-card.css'],
})
export class UserEventsCard {
  @Input() event!: UserEventDto;
   showPaymentModal: boolean=false;

  constructor(
    private readonly eventService: EventService,
    private readonly router: Router
  ) { }

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
    try {
      const blob = await this.eventService.downloadReceipt(this.event.id).toPromise();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu-${this.event.title.replace(/\s+/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Erreur lors du téléchargement du reçu');
    }
  }


  openPaymentModal() {
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
  }
}
