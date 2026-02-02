import { Component, inject, input, resource, signal, ChangeDetectionStrategy } from '@angular/core';
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
import { ConfirmModal } from '../../shared/components/confirm-modal/confirm-modal';
import { AuthService } from '../../Core/services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-club-details',
  standalone: true,
  imports: [CommonModule, RouterModule, Loader, AppError, DefaultImagePipe, UserEventsCard, FormsModule, Contact, ConfirmModal],
  templateUrl: './club-details.html',
  styleUrl: './club-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClubDetails {

  private readonly clubService = inject(ClubService);
  private readonly eventService = inject(EventService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  errorMessage = signal<string>('');



  readonly showContactModal = signal(false);
  readonly eventsVisible = signal(true);
  readonly clubId = input.required<number, string>({
    alias: 'clubId',
    transform: (value: string) => parseInt(value, 10)
  });

  readonly membershipResource = resource({
    params: () => ({
      userId: this.authService.currentUser()?.id ?? 0,
      clubId: this.clubId()
    }),
    loader: async ({ params }) => {
      return (await firstValueFrom(this.clubService.getClubMembershipDetails(params.clubId, Number(params.userId))));
    }
  });

  readonly clubEventsResource = resource({
    params: () => {
      const id = this.clubId();
      if (!this.eventsVisible() || !id) return null;
      return {
        userId: this.authService.currentUser()?.id ?? 0,
        clubId: id
      };
    },
    loader: async ({ params }) => {
      if (!params) return null;
      const filters: any = {
        clubId: params.clubId,
        limit: 3,
        startDateFrom: new Date().toISOString()
      };

      return (await firstValueFrom(this.eventService.getEventsDiscovery(Number(params.userId), filters)));
    }
  });

  readonly showLeaveModal = signal(false);

  onDiscoverEvents() {
    this.router.navigate(['/discover-events', this.clubId()]);
  }

  onLeaveClub() {
    this.showLeaveModal.set(true);
  }

  confirmLeaveClub() {
    this.showLeaveModal.set(false);
    this.clubService.leaveClub(this.clubId(), Number(this.authService.currentUser()?.id)).subscribe({
      next: () => {
        this.router.navigate(['/my-clubs']);
      },
      error: () => {
        this.errorMessage.set('Failed to leave the club. Please try again.');


      }
    });
  }

  onContactMember() {
    this.showContactModal.set(true);
  }
}
