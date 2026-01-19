import { signal, Signal, computed, inject } from '@angular/core';
import { ClubService } from '../../Core/services/club.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { forkJoin, of, map, catchError } from 'rxjs';

export function createClubStatusManager(userId: Signal<number | string | undefined>) {
  const clubService = inject(ClubService);
  const clubIds = signal<number[]>([]);

  const statusResource = rxResource({
    params: () => ({ uid: userId(), ids: clubIds() }), 
    stream: ({ params }) => {
      if (!params.uid || params.ids.length === 0) return of(new Map<number, string>());
      
      const uid = Number(params.uid);
      const requests = params.ids.map(id => 
        clubService.getUserClubMembershipStatus(id, uid).pipe(
          map(status => ({ id, status })),
          catchError(() => of({ id, status: 'Non membre' }))
        )
      );

      return forkJoin(requests).pipe(
        map(results => new Map(results.map(r => [r.id, r.status])))
      );
    }
  });

  const getStatus = (clubId: number) => statusResource.value()?.get(clubId) || 'Non membre';

  return {
    isLoading: statusResource.isLoading,
    refresh: (ids: number[]) => clubIds.set(ids),
    getMeta: (clubId: number) => {
      const status = getStatus(clubId).toLowerCase();
      const isMember = status.startsWith('membre');
      const isPending = status.includes('en attente');

      return {
        text: status === 'ancien membre' ? 'Renouveler' : 
              isMember ? status : 
              (isPending ? 'En attente' : 'Rejoindre'),
        variant: isMember ? 'primary' : (isPending ? 'ghost' : (status === 'ancien membre' ? 'secondary' : 'primary')) as any,
        disabled: isMember || isPending,
        status
      };
    }
  };
}