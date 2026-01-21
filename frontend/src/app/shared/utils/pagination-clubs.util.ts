import { Signal, computed, signal, WritableSignal } from '@angular/core';

export interface PaginationConfig<T> {
  items: Signal<T[]>;
  itemsPerPage?: number;
  initialPage?: number;
}

export interface PaginationControls<T> {
  currentPage: Signal<number>;
  totalPages: Signal<number>;
  paginatedItems: Signal<T[]>;
  totalItems: Signal<number>;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  getPageNumbers: () => number[];
  reset: () => void;
}

export function getPaginationSequence(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const sequence: number[] = [];
  const neighbors = 1;

  for (let i = 1; i <= total; i++) {
    const isFirst = i === 1;
    const isLast = i === total;
    const isNearCurrent = i >= current - neighbors && i <= current + neighbors;

    if (isFirst || isLast || isNearCurrent) {
      if (sequence.length > 0 && i - sequence[sequence.length - 1] > 1) {
        sequence.push(-1);
      }
      sequence.push(i);
    }
  }

  return sequence;
}

export function createPagination<T>(config: PaginationConfig<T>): PaginationControls<T> {
  const itemsPerPage = config.itemsPerPage ?? 9;
  const initialPage = config.initialPage ?? 1;
  const currentPage: WritableSignal<number> = signal(initialPage);

  const totalItems = computed(() => config.items().length);

  const totalPages = computed(() => 
    Math.max(1, Math.ceil(totalItems() / itemsPerPage))
  );

  const paginatedItems = computed(() => {
    const page = currentPage();
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return config.items().slice(start, end);
  });

  const goToPage = (page: number): void => {
    const total = totalPages();
    if (page >= 1 && page <= total && page !== -1) {
      currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextPage = (): void => {
    if (currentPage() < totalPages()) {
      currentPage.update(p => p + 1);
    }
  };

  const prevPage = (): void => {
    if (currentPage() > 1) {
      currentPage.update(p => p - 1);
    }
  };

  const getPageNumbers = (): number[] => {
    return getPaginationSequence(currentPage(), totalPages());
  };

  const reset = (): void => {
    currentPage.set(initialPage);
  };

  return {
    currentPage: currentPage.asReadonly(),
    totalPages,
    paginatedItems,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
    getPageNumbers,
    reset
  };
}