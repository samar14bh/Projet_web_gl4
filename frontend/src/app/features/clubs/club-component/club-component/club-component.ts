import { ChangeDetectionStrategy, Component ,input, output} from '@angular/core';
import { Club } from '../../../../Core/models/club.model';
@Component({
  selector: 'app-club-component',
  imports: [],
  templateUrl: './club-component.html',
  styleUrl: './club-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClubComponent {
  club = input.required<Club>();
  viewDetails = output<Club>();
  join = output<Club>();

  onViewDetails() {
    this.viewDetails.emit(this.club());
  }
  onJoin() {
    this.join.emit(this.club());
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



