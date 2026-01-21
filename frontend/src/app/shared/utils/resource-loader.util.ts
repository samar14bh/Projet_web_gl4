import { computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

export interface ResourceConfig<T, P = void> {
  loader: (params: P) => Observable<T>;
  params?: () => P;
}

export function createResource<T>(config: { loader: () => Observable<T> }) {
  const resource = rxResource({
    stream: () => config.loader()
  });

  return {
    resource,
    data: computed(() => resource.value()),
    isLoading: resource.isLoading,
    error: resource.error,
    reload: () => resource.reload()
  };
}

export function createParameterizedResource<T, P>(config: ResourceConfig<T, P>) {
  if (!config.params) {
    throw new Error('La fonction params est requise pour les ressources paramétrées');
  }

  const resource = rxResource({
    params: config.params,
    stream: ({ params }) => config.loader(params)
  });

  return {
    resource,
    data: computed(() => resource.value()),
    isLoading: resource.isLoading,
    error: resource.error,
    reload: () => resource.reload()
  };
}