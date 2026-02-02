import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PaginatedResult } from '../../Core/models/paginated-result.model';
import { EventService } from '../../Core/services/event.service';
import { Loader } from '../../shared/components/loader/loader';
import { EventStatus, EventType } from '../../Core/models/event.model';
import { UserEventsCard } from '../../features/events/user-events-card/user-events-card';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { Error } from '../../shared/components/error/error';
import { AuthService } from '../../Core/services/auth.service';
import { UserEventDto } from '../../Core/dtos/user-events/user-event.dto';

type FilterType = 'all' | 'upcoming' | 'past';

interface FilterState {
  search: string;
  status: EventStatus | '';
  type: EventType | '';
  sortBy: 'date' | 'title' | 'registrations';
  order: 'asc' | 'desc';
}

@Component({
  selector: 'app-user-events',
  standalone: true,
  imports: [CommonModule, FormsModule, Loader, UserEventsCard, PaginationComponent, Error],
  templateUrl: './user-events.html',
  styleUrl: './user-events.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserEvents {
  private readonly eventService = inject(EventService);
  private readonly authService = inject(AuthService);
  private readonly USER_ID = Number(this.authService.currentUser()?.id ?? 0);
  readonly pageSize = 3;

  readonly clubId = input<string>();

  readonly currentPage = signal(1);
  readonly activeFilter = signal<FilterType>('all');
  readonly showFilters = signal(false);

  readonly filterState = signal<FilterState>({
    search: '',
    status: '',
    type: '',
    sortBy: 'date',
    order: 'asc',
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
      clubId: this.clubId() ? parseInt(this.clubId()!) : undefined,
      page: this.currentPage(),
      limit: this.pageSize,
      search: this.filterState().search || undefined,
      status: this.filterState().status || undefined,
      type: this.filterState().type || undefined,
      sortBy: this.filterState().sortBy,
      order: this.filterState().order,
    }),
    loader: async ({ params }) => {
      try {
        const { userId, ...filters } = params;

        const fetchMethod = params.clubId
          ? this.eventService.getEventsDiscovery(userId, filters as any)
          : this.eventService.getUserEvents(
            userId,
            params.page,
            params.limit,
            params.search,
            params.status,
            params.type,
            params.sortBy,
            params.order
          );

        return (await fetchMethod.toPromise()) ?? this.emptyResult();
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
      order: 'asc',
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




