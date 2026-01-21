import {  signal, WritableSignal } from '@angular/core';

export interface SortConfig<T extends string> {
  sortBy: WritableSignal<T>;
  sortOrder: WritableSignal<'asc' | 'desc'>;
}

export interface FilterConfig {
  searchQuery: WritableSignal<string>;
  priceFilter?: WritableSignal<'all' | 'free' | 'paid'>;
  categoryFilter?: WritableSignal<number | 'all'>;
}

export interface FilterSortState<T extends string> {
  sort: SortConfig<T>;
  filters: FilterConfig;
  reset: () => void;
}

export function createSortControls<T extends string>(initialField: T): SortConfig<T> {
  return {
    sortBy: signal(initialField),
    sortOrder: signal<'asc' | 'desc'>('asc')
  };
}

export function createFilterControls(options?: { 
  hasPrice?: boolean; 
  hasCategory?: boolean;
}): FilterConfig {
  const config: FilterConfig = {
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

export function createFilterSortState<T extends string>(
  initialSortField: T,
  filterOptions?: { hasPrice?: boolean; hasCategory?: boolean }
): FilterSortState<T> {
  const sort = createSortControls(initialSortField);
  const filters = createFilterControls(filterOptions);

  const reset = () => {
    filters.searchQuery.set('');
    if (filters.priceFilter) filters.priceFilter.set('all');
    if (filters.categoryFilter) filters.categoryFilter.set('all');
    sort.sortBy.set(initialSortField);
    sort.sortOrder.set('asc');
  };

  return { sort, filters, reset };
}

export function handleSortChange<T extends string>(
  config: SortConfig<T>,
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

export function handleSearch(
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

export function sortItems<T>(
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
export function filterBySearch<T>(
  items: T[],
  searchQuery: string,
  searchFields: ((item: T) => string)[]
): T[] {
  if (!searchQuery) return items;
  
  const query = searchQuery.toLowerCase();
  return items.filter(item => 
    searchFields.some(getField => 
      getField(item).toLowerCase().includes(query)
    )
  );
}

export function filterByPrice<T>(
  items: T[],
  priceMode: 'all' | 'free' | 'paid',
  getPriceField: (item: T) => number
): T[] {
  if (priceMode === 'all') return items;
  
  return items.filter(item => {
    const price = getPriceField(item);
    return priceMode === 'free' ? price === 0 : price > 0;
  });
}