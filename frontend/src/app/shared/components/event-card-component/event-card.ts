import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UpcomingEvent } from '../../../Core/models/dashboard.model';
import { STATUS_CONFIG } from '../../constants/event-card.constants';
import { CURRENCY_CONFIG } from '../../constants/event-card.constants';


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
  userId = input.required<string | null>();

  private statusInfo = computed(() => {
    const status = this.event().paymentStatus?.toLowerCase() || '';
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.DEFAULT;
  });

  statusClass = computed(() => this.statusInfo().class);
  statusIcon = computed(() => this.statusInfo().icon);

  formattedPrice = computed(() => {
    if (this.event().isFree) return CURRENCY_CONFIG.LABEL_FREE;
    
    return new Intl.NumberFormat(CURRENCY_CONFIG.LOCALE, {
      style: 'currency',
      currency: CURRENCY_CONFIG.CODE,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(this.event().subscriptionFees);
  });
  
  detailsRoute = computed(() => 
    ['/user-event-details', this.userId(), this.event().id]
  );
}