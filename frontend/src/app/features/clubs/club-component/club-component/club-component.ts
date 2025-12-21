import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Club } from '../../../../Core/models/club.model';
import { ButtonComponent } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-club-component',
  imports: [ButtonComponent],
  templateUrl: './club-component.html',
  styleUrl: './club-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClubComponent {
  club = input.required<Club>();
  
  showJoinButton = input<boolean>(true);
  joinButtonLabel = input<string>('Rejoindre');
  joinButtonVariant = input<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
  joinButtonDisabled = input<boolean>(false);
  isAuthenticated = input<boolean>(false);
  viewDetails = output<Club>();
  join = output<Club>();
  loginRequired = output<void>();

  onViewDetails() {
    this.viewDetails.emit(this.club());
  }

  onJoin() {
    if (!this.isAuthenticated()) {
      this.loginRequired.emit();
    } else {
      this.join.emit(this.club());
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