import { BaseApiService } from './base-api';
import { Provider, PaginatedResponse } from '@/types';

export interface ProviderFilters {
  search?: string;
  provider_type?: string;
  specialty?: string;
  network_status?: string;
  page?: number;
}

export class ProviderService extends BaseApiService {
  private entity = 'providers';

  async getProviders(filters: ProviderFilters = {}): Promise<PaginatedResponse<Provider>> {
    return this.getList<Provider>(this.entity, filters);
  }

  async getProvider(id: number): Promise<Provider> {
    return this.getItem<Provider>(this.entity, id);
  }

  async createProvider(data: Partial<Provider>): Promise<Provider> {
    return this.createItem<Provider>(this.entity, data);
  }

  async updateProvider(id: number, data: Partial<Provider>): Promise<Provider> {
    return this.updateItem<Provider>(this.entity, id, data);
  }

  async deleteProvider(id: number): Promise<void> {
    return this.deleteItem(this.entity, id);
  }

  async bulkDeleteProviders(ids: number[]): Promise<void> {
    return this.bulkDelete(this.entity, ids);
  }

  async exportProviders(filters: ProviderFilters = {}): Promise<Blob> {
    return this.exportData(this.entity, filters);
  }

  async downloadProvidersCSV(filters: ProviderFilters = {}, filename = 'providers.csv'): Promise<void> {
    const blob = await this.exportProviders(filters);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const providerService = new ProviderService();