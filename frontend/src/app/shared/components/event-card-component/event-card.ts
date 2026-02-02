import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UpcomingEvent } from '../../../Core/models/dashboard.model';
import { STATUS_CONFIG } from '../../constants/event-card.constants';
import { CurrencyTndPipe } from '../../pipes/currency-tnd.pipe';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyTndPipe],
  templateUrl: './event-card.html',
  styleUrls: ['./event-card.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCardComponent {
  event = input.required<UpcomingEvent>();
  userId = input.required<string | null>();

  statusInfo = computed(() => {
    const status = this.event().paymentStatus?.toLowerCase() || '';
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.DEFAULT;
  });

  statusClass = computed(() => this.statusInfo().class);
  statusIcon = computed(() => this.statusInfo().icon);
}