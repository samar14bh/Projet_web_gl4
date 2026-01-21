import { ChangeDetectionStrategy, Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UpcomingEvent } from '../../../Core/models/dashboard.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-card.html',
  styleUrls: ['./event-card.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCardComponent {
  event = input.required<UpcomingEvent>();
  viewDetails = output<number>();
  
  statusClass = computed(() => {
    const status = this.event().paymentStatus?.toLowerCase() || '';
    if (status === 'payé') return 'status-paid';
    if (status === 'gratuit') return 'status-free';
    return 'status-pending';
  });

  statusIcon = computed(() => {
    const status = this.event().paymentStatus?.toLowerCase() || '';
    if (status === 'payé') return 'fa-check-circle';
    if (status === 'gratuit') return 'fa-tag';
    return 'fa-clock';
  });

  formattedPrice = computed(() => {
    if (this.event().isFree) return 'Gratuit';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0
    }).format(this.event().subscriptionFees);
  });
}