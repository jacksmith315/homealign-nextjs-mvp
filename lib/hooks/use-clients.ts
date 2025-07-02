'use client';

import { useCallback } from 'react';
import { Client } from '@/types';
import { clientService, ClientFilters } from '@/lib/services';
import { usePaginatedApi, useMutation } from './use-api';

export function useClients(initialFilters: ClientFilters = {}) {
  const fetchClients = useCallback(
    (page: number, filters: Record<string, any>) => {
      return clientService.getClients({ ...filters, page });
    },
    []
  );

  return usePaginatedApi(fetchClients, {
    initialFilters,
    autoFetch: true,
  });
}

export function useCreateClient() {
  return useMutation((data: Partial<Client>) => clientService.createClient(data));
}

export function useUpdateClient() {
  return useMutation(({ id, data }: { id: number; data: Partial<Client> }) =>
    clientService.updateClient(id, data)
  );
}

export function useDeleteClient() {
  return useMutation((id: number) => clientService.deleteClient(id));
}

export function useBulkDeleteClients() {
  return useMutation((ids: number[]) => clientService.bulkDeleteClients(ids));
}

export function useExportClients() {
  return useMutation((filters: ClientFilters) => 
    clientService.downloadClientsCSV(filters)
  );
}