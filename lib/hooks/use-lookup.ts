'use client';

import { lookupService } from '@/lib/services';
import { useApi } from './use-api';

export function useReferralTypes() {
  return useApi(() => lookupService.getReferralTypes(), {
    autoFetch: true,
  });
}

export function useReferralStatuses() {
  return useApi(() => lookupService.getReferralStatuses(), {
    autoFetch: true,
  });
}

export function useReferralSources() {
  return useApi(() => lookupService.getReferralSources(), {
    autoFetch: true,
  });
}

export function useTenants() {
  return useApi(() => lookupService.getTenants(), {
    autoFetch: true,
  });
}

export function useLookupData(type: string) {
  return useApi(() => lookupService.getLookupData(type), {
    autoFetch: true,
    dependencies: [type],
  });
}