import { Component, computed, effect, inject, input, resource, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClubService } from '../../Core/services/club.service';
import { EventService } from '../../Core/services/event.service';
import { Loader } from '../../shared/components/loader/loader';
import { Error as AppError } from '../../shared/components/error/error';
import { DefaultImagePipe } from "../../shared/pipes/default-image.pipe";
import { Router, RouterModule } from '@angular/router';
import { UserEventsCard } from '../../features/events/user-events-card/user-events-card';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../features/member/contact/contact';

@Component({
  selector: 'app-club-details',
  standalone: true,
  imports: [CommonModule, RouterModule, Loader, AppError, DefaultImagePipe, UserEventsCard, FormsModule, Contact],
  templateUrl: './club-details.html',
  styleUrl: './club-details.css',
})
export class ClubDetails {

  private readonly clubService = inject(ClubService);
  private readonly eventService = inject(EventService);
  private readonly router = inject(Router);
  private readonly USER_ID = 1;

  readonly showContactModal = signal(false);
  readonly clubId = input.required<number, string>({
    alias: 'clubId',
    transform: (value: string) => parseInt(value, 10)
  });

  readonly membershipResource = resource({
    params: () => ({
      userId: this.USER_ID,
      clubId: this.clubId()
    }),
    loader: async ({ params }) => {
      return (await this.clubService.getClubMembershipDetails(params.clubId, params.userId).toPromise());
    }
  });

  readonly clubEventsResource = resource({
    params: () => ({
      userId: this.USER_ID,
      clubId: this.clubId()
    }),
    loader: async ({ params }) => {
      const filters: any = {
        clubId: params.clubId,
        limit: 3,
        startDateFrom: new Date().toISOString()
      };

      return (await this.eventService.getEventsDiscovery(params.userId, filters).toPromise());
    }
  });

  onDiscoverEvents() {
    this.router.navigate(['/discover-events', this.clubId()]);
  }

  onLeaveClub() {
    if (confirm('Êtes-vous sûr de vouloir quitter ce club ?')) {
      this.clubService.leaveClub(this.clubId(), this.USER_ID).subscribe({
        next: () => {
          alert('Vous avez quitté le club avec succès.');
          this.router.navigate(['/my-clubs']);
        },
        error: () => {
          alert('Une erreur est survenue lors de votre désinscription.');
        }
      });
    }
  }

  onContactMember() {
    this.showContactModal.set(true);
  }

  onSendMessage(data: { subject: string; message: string }) {
    console.log('Message sent successfully:', data);
  }
}
