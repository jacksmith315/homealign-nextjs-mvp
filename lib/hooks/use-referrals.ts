'use client';

import { useCallback } from 'react';
import { Referral } from '@/types/entities';
import { referralService, ReferralFilters } from '@/lib/services';
import { usePaginatedApi, useMutation } from './use-api';

export function useReferrals(initialFilters: ReferralFilters = {}) {
  const fetchReferrals = useCallback(
    (page: number, filters: Record<string, any>) => {
      return referralService.getReferrals({ ...filters, page });
    },
    []
  );

  return usePaginatedApi(fetchReferrals, {
    initialFilters,
    autoFetch: true,
  });
}

export function useCreateReferral() {
  return useMutation((data: Partial<Referral>) => referralService.createReferral(data));
}

export function useUpdateReferral() {
  return useMutation(({ id, data }: { id: number; data: Partial<Referral> }) =>
    referralService.updateReferral(id, data)
  );
}

export function useDeleteReferral() {
  return useMutation((id: number) => referralService.deleteReferral(id));
}

export function useBulkDeleteReferrals() {
  return useMutation((ids: number[]) => referralService.bulkDeleteReferrals(ids));
}

export function useExportReferrals() {
  return useMutation((filters: ReferralFilters) => 
    referralService.downloadReferralsCSV(filters)
  );
}

// Referral-specific hooks
export function useUpdateReferralStatus() {
  return useMutation(({ id, status }: { id: number; status: string }) =>
    referralService.updateReferralStatus(id, status)
  );
}

export function useUpdateReferralPriority() {
  return useMutation(({ id, priority }: { id: number; priority: string }) =>
    referralService.updateReferralPriority(id, priority)
  );
}