import { computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

export interface ResourceConfig<T, P = void> {
  loader: (params?: P) => Observable<T>;
  params?: () => P;
}

export function createResource<T>(config: ResourceConfig<T, void>) {
  const resource = rxResource({
    stream: () => config.loader()
  });

  return {
    resource,
    data: computed(() => resource.value()),
    isLoading: computed(() => resource.isLoading()),
    hasError: computed(() => resource.error() != null),
    error: computed(() => resource.error()),
    reload: () => resource.reload()
  };
}

export function createParameterizedResource<T, P>(config: ResourceConfig<T, P>) {
  if (!config.params) {
    throw new Error('params function is required for parameterized resources');
  }

  const resource = rxResource({
    params: config.params,
    stream: ({ params }) => config.loader(params)
  });

  return {
    resource,
    data: computed(() => resource.value()),
    isLoading: computed(() => resource.isLoading()),
    hasError: computed(() => resource.error() != null),
    error: computed(() => resource.error()),
    reload: () => resource.reload()
  };
}