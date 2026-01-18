import { Signal, computed, signal } from '@angular/core';

export interface PaginationConfig<T> {
  items: Signal<T[]>;
  itemsPerPage?: number;
}

export interface PaginationControls {
  currentPage: Signal<number>;
  totalPages: Signal<number>;
  paginatedItems: Signal<any[]>;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  getPageNumbers: () => number[];
}

export function createPaginationClubs<T>(config: PaginationConfig<T>): PaginationControls {
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
    const total = totalPages();
    const current = currentPage();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    return [1, -1, current, -1, total];
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