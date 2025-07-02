import { BaseApiService } from './base-api';

export interface LookupItem {
  id: number;
  name: string;
  value?: string;
  label?: string;
}

export interface SessionInfo {
  isAuthenticated: boolean;
  selectedDb: string;
  hasTokens: {
    access: boolean;
    refresh: boolean;
  };
}

export class LookupService extends BaseApiService {
  async getLookupData(type: string): Promise<LookupItem[]> {
    return this.makeRequest<LookupItem[]>('/lookup', {
      method: 'GET',
      params: { type },
    });
  }

  async getReferralTypes(): Promise<LookupItem[]> {
    return this.getLookupData('referral-types');
  }

  async getReferralStatuses(): Promise<LookupItem[]> {
    return this.getLookupData('referral-status');
  }

  async getReferralSources(): Promise<LookupItem[]> {
    return this.getLookupData('referral-source');
  }

  async getTenants(): Promise<LookupItem[]> {
    return this.getLookupData('tenants');
  }
}

export const lookupService = new LookupService();