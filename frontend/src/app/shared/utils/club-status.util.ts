import { signal, Signal } from '@angular/core';
import { ClubService } from '../../Core/services/club.service';

export interface ClubStatusConfig {
  clubService: ClubService;
  userId: Signal<number | string | undefined>;
}

export function createClubStatusManager(config: ClubStatusConfig) {
  const userClubStatuses = signal<Map<number, string>>(new Map());
  const isLoadingStatuses = signal(false);

  const loadAllStatuses = async (clubIds: number[]): Promise<void> => {
    const userId = config.userId();
    if (!userId || clubIds.length === 0) return;

    const numericUserId = typeof userId === 'string' ? Number(userId) : userId;

    isLoadingStatuses.set(true);
    const currentMap = new Map<number, string>();

    const statusPromises = clubIds.map(clubId =>
      new Promise<void>((resolve) => {
        config.clubService.getUserClubStatus(clubId, numericUserId).subscribe({
          next: (response) => {
            currentMap.set(clubId, response);
            resolve();
          },
          error: () => {
            currentMap.set(clubId, 'Non membre');
            resolve();
          }
        });
      })
    );

    await Promise.all(statusPromises);
    userClubStatuses.set(new Map(currentMap));
    isLoadingStatuses.set(false);
  };

  const getStatus = (clubId: number): string => {
    return userClubStatuses().get(clubId) || 'Non membre';
  };

  const getButtonText = (clubId: number): string => {
    const status = getStatus(clubId);
    const statusLower = status.toLowerCase();

    if (statusLower.startsWith('membre')) {
      return statusLower === 'membre member' ? 'Membre' : status;
    }

    if (statusLower.includes('candidature')) {
      return status;
    }

    if (status === 'Ancien membre') {
      return 'Renouveler adhésion';
    }

    return 'Rejoindre';
  };

  const getButtonVariant = (clubId: number): 'primary' | 'secondary' | 'danger' | 'ghost' => {
    const statusLower = getStatus(clubId).toLowerCase();

    if (statusLower.startsWith('membre')) return 'primary';
    if (statusLower.includes('candidature')) return 'ghost';
    if (statusLower === 'ancien membre') return 'secondary';

    return 'primary';
  };

  const isButtonDisabled = (clubId: number): boolean => {
    const statusLower = getStatus(clubId).toLowerCase();
    return statusLower.startsWith('membre') || statusLower.includes('candidature en attente');
  };

  const reset = (): void => {
    userClubStatuses.set(new Map());
  };

  return {
    userClubStatuses: userClubStatuses.asReadonly(),
    isLoadingStatuses: isLoadingStatuses.asReadonly(),
    loadAllStatuses,
    getStatus,
    getButtonText,
    getButtonVariant,
    isButtonDisabled,
    reset
  };
}