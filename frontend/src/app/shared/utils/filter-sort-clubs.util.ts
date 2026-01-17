import { Signal, computed, signal, WritableSignal } from '@angular/core';

export interface SortConfigClubs<T extends string> {
  sortBy: WritableSignal<T>;
  sortOrder: WritableSignal<'asc' | 'desc'>;
}

export interface FilterConfigClubs {
  searchQuery: WritableSignal<string>;
  priceFilter?: WritableSignal<'all' | 'free' | 'paid'>;
  categoryFilter?: WritableSignal<number | 'all'>;
}

export function createSortControlsClubs<T extends string>(initialField: T): SortConfigClubs<T> {
  return {
    sortBy: signal(initialField),
    sortOrder: signal<'asc' | 'desc'>('asc')
  };
}

export function createFilterControlsClubs(options?: { 
  hasPrice?: boolean; 
  hasCategory?: boolean 
}): FilterConfigClubs {
  const config: FilterConfigClubs = {
    searchQuery: signal('')
  };

  if (options?.hasPrice) {
    config.priceFilter = signal<'all' | 'free' | 'paid'>('all');
  }

  if (options?.hasCategory) {
    config.categoryFilter = signal<number | 'all'>('all');
  }

  return config;
}

export function handleSortChangeClubs<T extends string>(
  config: SortConfigClubs<T>,
  field: T,
  onPageReset?: () => void
): void {
  if (config.sortBy() === field) {
    config.sortOrder.set(config.sortOrder() === 'asc' ? 'desc' : 'asc');
  } else {
    config.sortBy.set(field);
    config.sortOrder.set('asc');
  }
  onPageReset?.();
}

export function handleSearchClubs(
  searchSignal: WritableSignal<string>,
  event: Event | string,
  onPageReset?: () => void
): void {
  const value = typeof event === 'string' 
    ? event 
    : (event.target as HTMLInputElement).value;
  searchSignal.set(value);
  onPageReset?.();
}

export function sortItemsClubs<T>(
  items: T[],
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  comparators: Record<string, (a: T, b: T) => number>
): T[] {
  const comparator = comparators[sortBy];
  if (!comparator) return items;

  return [...items].sort((a, b) => {
    const comparison = comparator(a, b);
    return sortOrder === 'asc' ? comparison : -comparison;
  });
}