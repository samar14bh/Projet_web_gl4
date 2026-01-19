import { Signal, computed, signal } from '@angular/core';

export interface PaginationConfig<T> {
  items: Signal<T[]>;
  itemsPerPage?: number;
}

export interface PaginationControls<T> {
  currentPage: Signal<number>;
  totalPages: Signal<number>;
  paginatedItems: Signal<T[]>;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  getPageNumbers: () => number[];
}

export function getPaginationSequence(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const sequence: number[] = [];
  const neighbors = 1;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - neighbors && i <= current + neighbors)) {
      if (sequence.length > 0 && i - sequence[sequence.length - 1] > 1) {
        sequence.push(-1); 
      }
      sequence.push(i);
    }
  }
  return sequence;
}

export function createPaginationClubs<T>(config: PaginationConfig<T>): PaginationControls<T> {
  const itemsPerPage = config.itemsPerPage || 9;
  const currentPage = signal(1);

  const totalPages = computed(() => 
    Math.ceil(config.items().length / itemsPerPage)
  );

  const paginatedItems = computed(() => {
    const start = (currentPage() - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return config.items().slice(start, end);
  });

  const goToPage = (page: number): void => {
    if (page >= 1 && page <= totalPages()) {
      currentPage.set(page);
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

  return {
    currentPage: currentPage.asReadonly(),
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    getPageNumbers
  };
}