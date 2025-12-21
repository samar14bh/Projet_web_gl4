import {
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PaginatedResult } from '../../../Core/models/paginated-result.model';
import { UserEventDto } from '../../../Core/dtos/user-event.dto';
import { EventService } from '../../../Core/services/event.service';
import { Loader } from '../../../shared/components/loader/loader';
import { EventStatus, EventType } from '../../../Core/models/event.model';
import { UserEventsCard } from '../../../features/events/user-events-card/user-events-card';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { Error as AppError } from '../../../shared/components/error/error';

type FilterType = 'all' | 'upcoming' | 'past';

interface FilterState {
  search: string;
  status: EventStatus | '';
  type: EventType | '';
  sortBy: 'date' | 'title' | 'registrations';
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: 'app-user-events',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, Loader, UserEventsCard, PaginationComponent, AppError],
  templateUrl: './user-events.html',
  styleUrl: './user-events.css',
})
export class UserEvents {
  private readonly eventService = inject(EventService);
  private readonly USER_ID = 1;
  readonly pageSize = 6;

  readonly currentPage = signal(1);
  readonly activeFilter = signal<FilterType>('all');
  readonly showFilters = signal(false);

  readonly filterState = signal<FilterState>({
    search: '',
    status: '',
    type: '',
    sortBy: 'date',
    sortOrder: 'asc',
  });


  readonly filters = [
    { id: 'all', label: 'Tous' },
    { id: 'upcoming', label: 'À venir' },
    { id: 'past', label: 'Passés' },
  ] as const;

  readonly EventStatus = EventStatus;
  readonly EventType = EventType;


  readonly eventsResource = resource({
    params: () => ({
      userId: this.USER_ID,
      page: this.currentPage(),
      limit: this.pageSize,
      search: this.filterState().search || undefined,
      status: this.filterState().status || undefined,
      type: this.filterState().type || undefined,
      sortBy: this.filterState().sortBy,
      sortOrder: this.filterState().sortOrder,
    }),
    loader: async ({ params, abortSignal }) => {
      try {
        return (
          (await this.eventService
            .getUserEvents(
              params.userId,
              params.page,
              params.limit,
              params.search,
              params.status,
              params.type,
              params.sortBy,
              params.sortOrder
            )
            .toPromise()) ?? this.emptyResult()
        );
      } catch {
        return this.emptyResult();
      }
    },
  });


  readonly visibleEvents = computed(() => {
    const events = this.eventsResource.value()?.data ?? [];
    if (this.activeFilter() === 'all') return events;

    const now = new Date();
    return events.filter(event =>
      this.activeFilter() === 'upcoming'
        ? new Date(event.startDate) >= now
        : new Date(event.endDate) < now
    );
  });

  readonly totalPages = computed(() =>
    Math.ceil((this.eventsResource.value()?.total ?? 0) / this.pageSize)
  );

  readonly hasActiveFilters = computed(() => {
    const f = this.filterState();
    return !!f.search || !!f.status || !!f.type;
  });


  updateFilters(patch: Partial<FilterState>) {
    this.filterState.update(f => ({ ...f, ...patch }));
    this.currentPage.set(1);
  }

  toggleFilters() {
    this.showFilters.update(v => !v);
  }

  clearAllFilters() {
    this.filterState.set({
      search: '',
      status: '',
      type: '',
      sortBy: 'date',
      sortOrder: 'asc',
    });
    this.activeFilter.set('all');
    this.currentPage.set(1);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  trackByEventId(_: number, event: UserEventDto) {
    return event.id;
  }


  private emptyResult(): PaginatedResult<UserEventDto> {
    return {
      data: [],
      total: 0,
      page: this.currentPage(),
      limit: this.pageSize,
    };
  }



}




