'use client';

import { useCallback } from 'react';
import { Service } from '@/types/entities';
import { serviceService, ServiceFilters } from '@/lib/services';
import { usePaginatedApi, useMutation } from './use-api';

export function useServices(initialFilters: ServiceFilters = {}) {
  const fetchServices = useCallback(
    (page: number, filters: Record<string, any>) => {
      return serviceService.getServices({ ...filters, page });
    },
    []
  );

  return usePaginatedApi(fetchServices, {
    initialFilters,
    autoFetch: true,
  });
}

export function useCreateService() {
  return useMutation((data: Partial<Service>) => serviceService.createService(data));
}

export function useUpdateService() {
  return useMutation(({ id, data }: { id: number; data: Partial<Service> }) =>
    serviceService.updateService(id, data)
  );
}

export function useDeleteService() {
  return useMutation((id: number) => serviceService.deleteService(id));
}

export function useBulkDeleteServices() {
  return useMutation((ids: number[]) => serviceService.bulkDeleteServices(ids));
}

export function useExportServices() {
  return useMutation((filters: ServiceFilters) => 
    serviceService.downloadServicesCSV(filters)
  );
}

// Service-specific hooks
export function useToggleServiceStatus() {
  return useMutation((id: number) => serviceService.toggleServiceStatus(id));
}

export function useUpdateServicePricing() {
  return useMutation(({ id, unitPrice }: { id: number; unitPrice: number }) =>
    serviceService.updateServicePricing(id, unitPrice)
  );
}