import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
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
  userId = input.required<number | null>(); 
  statusClass = computed(() => {
    const status = this.event().paymentStatus?.toLowerCase() || '';
    switch (status) {
      case 'payé': return 'status-paid';
      case 'gratuit': return 'status-free';
      default: return 'status-pending';
    }
  });

  statusIcon = computed(() => {
    const status = this.event().paymentStatus?.toLowerCase() || '';
    switch (status) {
      case 'payé': return 'fa-check-circle';
      case 'gratuit': return 'fa-tag';
      default: return 'fa-clock';
    }
  });

  formattedPrice = computed(() => {
    if (this.event().isFree) return 'Gratuit';
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(this.event().subscriptionFees);
  });
  
  detailsRoute = computed(() => 
    ['/user-event-details', this.userId(), this.event().id]
  );
}