import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { Club } from '../../../../Core/models/club.model';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { Router } from '@angular/router';
import { CLUB_STATUS, CLUB_CONFIG, CLUB_ROUTES, ButtonVariant } from '../../../../shared/constants/club.constants';

@Component({
  selector: 'app-club-component',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './club-component.html',
  styleUrl: './club-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClubComponent {
  private router = inject(Router);
  
  club = input.required<Club>();
  showJoinButton = input<boolean>(true);
  joinButtonLabel = input<string>('Rejoindre');
  joinButtonVariant = input<ButtonVariant>(CLUB_CONFIG.DEFAULT_VARIANT);
  joinButtonDisabled = input<boolean>(false);
  isAuthenticated = input<boolean>(false);
  redirectAfterAction = input<boolean>(true);
  userClubStatus = input<string>(CLUB_STATUS.NON_MEMBER);
  
  viewDetails = output<Club>();
  join = output<Club>();

  onViewDetails(): void {
    this.viewDetails.emit(this.club());
    if (this.redirectAfterAction()) {
      this.router.navigate([CLUB_ROUTES.DETAILS, this.club().id]);
    }
  }

  onJoin(): void {
    if (!this.isAuthenticated() && this.redirectAfterAction()) {
      this.router.navigate([CLUB_ROUTES.LOGIN]);
      return;
    }

    this.join.emit(this.club());
    if (this.redirectAfterAction()) {
      this.handleJoinAction();
    }
  }

  private handleJoinAction(): void {
    const clubId = this.club().id;
    const status = this.userClubStatus().toLowerCase();
    if (status.includes(CLUB_STATUS.NON_MEMBER) || status.includes(CLUB_STATUS.REJECTED)) {
      this.router.navigate([CLUB_ROUTES.JOIN, clubId]);
    } else if (status.includes(CLUB_STATUS.OLD_MEMBER)) {
      this.router.navigate([CLUB_ROUTES.RENEW, clubId, 'renew']);
    } else {
      this.router.navigate([CLUB_ROUTES.DETAILS, clubId]);
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString(CLUB_CONFIG.LOCALE, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getMembershipLabel(feeAmount: number): string {
    return feeAmount === 0 
      ? CLUB_CONFIG.FREE_LABEL 
      : `${feeAmount} ${CLUB_CONFIG.CURRENCY_LABEL}`;
  }
}