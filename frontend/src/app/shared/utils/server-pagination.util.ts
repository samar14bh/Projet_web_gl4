import { signal, WritableSignal } from '@angular/core';
import { getPaginationSequence } from './pagination-clubs.util';


export interface ServerPaginationConfig {
  pageSize?: number;
  initialPage?: number;
}

export interface ServerPaginationControls {
  currentPage: WritableSignal<number>;
  pageSize: WritableSignal<number>;
  goToPage: (page: number, maxPages?: number) => void;
  nextPage: (totalPages: number) => void;
  prevPage: () => void;
  getPageNumbers: (totalPages: number) => number[];
  reset: () => void;
}
export function createServerPagination(
  config?: ServerPaginationConfig
): ServerPaginationControls {
  const pageSize = signal(config?.pageSize ?? 12);
  const initialPage = config?.initialPage ?? 1;
  const currentPage = signal(initialPage);

  const goToPage = (page: number, maxPages?: number): void => {
    const minPage = 1;
    const maxPage = maxPages ?? Number.MAX_SAFE_INTEGER;
    
    if (page >= minPage && page <= maxPage && page !== -1) {
      currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextPage = (totalPages: number): void => {
    if (currentPage() < totalPages) {
      currentPage.update(p => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = (): void => {
    if (currentPage() > 1) {
      currentPage.update(p => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = (totalPages: number): number[] => {
    return getPaginationSequence(currentPage(), totalPages);
  };

  const reset = (): void => {
    currentPage.set(initialPage);
  };

  return {
    currentPage,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    getPageNumbers,
    reset
  };
}