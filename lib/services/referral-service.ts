import { BaseApiService } from './base-api';
import { Referral, PaginatedResponse } from '@/types';

export interface ReferralFilters {
  search?: string;
  status?: string;
  priority?: string;
  referral_date_after?: string;
  patient?: number;
  provider?: number;
  page?: number;
}

export class ReferralService extends BaseApiService {
  private entity = 'referrals';

  async getReferrals(filters: ReferralFilters = {}): Promise<PaginatedResponse<Referral>> {
    return this.getList<Referral>(this.entity, filters);
  }

  async getReferral(id: number): Promise<Referral> {
    return this.getItem<Referral>(this.entity, id);
  }

  async createReferral(data: Partial<Referral>): Promise<Referral> {
    return this.createItem<Referral>(this.entity, data);
  }

  async updateReferral(id: number, data: Partial<Referral>): Promise<Referral> {
    return this.updateItem<Referral>(this.entity, id, data);
  }

  async deleteReferral(id: number): Promise<void> {
    return this.deleteItem(this.entity, id);
  }

  async bulkDeleteReferrals(ids: number[]): Promise<void> {
    return this.bulkDelete(this.entity, ids);
  }

  async exportReferrals(filters: ReferralFilters = {}): Promise<Blob> {
    return this.exportData(this.entity, filters);
  }

  async downloadReferralsCSV(filters: ReferralFilters = {}, filename = 'referrals.csv'): Promise<void> {
    const blob = await this.exportReferrals(filters);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Referral-specific methods
  async updateReferralStatus(id: number, status: string): Promise<Referral> {
    return this.updateReferral(id, { status });
  }

  async updateReferralPriority(id: number, priority: string): Promise<Referral> {
    return this.updateReferral(id, { priority });
  }
}

export const referralService = new ReferralService();