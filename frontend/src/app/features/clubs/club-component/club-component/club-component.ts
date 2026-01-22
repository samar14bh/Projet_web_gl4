import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { Club } from '../../../../Core/models/club.model';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { Router } from '@angular/router';


@Component({
  selector: 'app-club-component',
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
  joinButtonVariant = input<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
  joinButtonDisabled = input<boolean>(false);
  isAuthenticated = input<boolean>(false);
  redirectAfterAction = input<boolean>(true);
  userClubStatus = input<string>('Non membre');
  
  viewDetails = output<Club>();
  join = output<Club>();

  onViewDetails() {
    this.viewDetails.emit(this.club());
    
    if (this.redirectAfterAction()) {
      this.router.navigate(['/my-clubs', this.club().id]);
    }
  }

  onJoin() {
    if (!this.isAuthenticated() && this.redirectAfterAction()) {
      this.router.navigate(['/login']);
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
  
    if (status.includes('non membre') || status.includes('rejetÃ©e')) {
      this.router.navigate(['/join-club', clubId]);
    } else if (status.includes('ancien membre')) {
      this.router.navigate(['/clubs', clubId, 'renew']);
    } else {
      this.router.navigate(['/my-clubs', clubId]);
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getMembershipLabel(feeAmount: number): string {
    return feeAmount === 0 ? 'Gratuit' : `${feeAmount} TND/an`;
  }
}