'use client';

import { useCallback } from 'react';
import { Provider } from '@/types/entities';
import { providerService, ProviderFilters } from '@/lib/services';
import { usePaginatedApi, useMutation } from './use-api';

export function useProviders(initialFilters: ProviderFilters = {}) {
  const fetchProviders = useCallback(
    (page: number, filters: Record<string, any>) => {
      return providerService.getProviders({ ...filters, page });
    },
    []
  );

  return usePaginatedApi(fetchProviders, {
    initialFilters,
    autoFetch: true,
  });
}

export function useCreateProvider() {
  return useMutation((data: Partial<Provider>) => providerService.createProvider(data));
}

export function useUpdateProvider() {
  return useMutation(({ id, data }: { id: number; data: Partial<Provider> }) =>
    providerService.updateProvider(id, data)
  );
}

export function useDeleteProvider() {
  return useMutation((id: number) => providerService.deleteProvider(id));
}

export function useBulkDeleteProviders() {
  return useMutation((ids: number[]) => providerService.bulkDeleteProviders(ids));
}

export function useExportProviders() {
  return useMutation((filters: ProviderFilters) => 
    providerService.downloadProvidersCSV(filters)
  );
}