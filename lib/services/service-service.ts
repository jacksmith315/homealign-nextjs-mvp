import { BaseApiService } from './base-api';
import { Service, PaginatedResponse } from '@/types';

export interface ServiceFilters {
  search?: string;
  service_type?: string;
  authorization_required?: boolean;
  referral_required?: boolean;
  telehealth_eligible?: boolean;
  is_active?: boolean;
  page?: number;
}

export class ServiceService extends BaseApiService {
  private entity = 'services';

  async getServices(filters: ServiceFilters = {}): Promise<PaginatedResponse<Service>> {
    return this.getList<Service>(this.entity, filters);
  }

  async getService(id: number): Promise<Service> {
    return this.getItem<Service>(this.entity, id);
  }

  async createService(data: Partial<Service>): Promise<Service> {
    return this.createItem<Service>(this.entity, data);
  }

  async updateService(id: number, data: Partial<Service>): Promise<Service> {
    return this.updateItem<Service>(this.entity, id, data);
  }

  async deleteService(id: number): Promise<void> {
    return this.deleteItem(this.entity, id);
  }

  async bulkDeleteServices(ids: number[]): Promise<void> {
    return this.bulkDelete(this.entity, ids);
  }

  async exportServices(filters: ServiceFilters = {}): Promise<Blob> {
    return this.exportData(this.entity, filters);
  }

  async downloadServicesCSV(filters: ServiceFilters = {}, filename = 'services.csv'): Promise<void> {
    const blob = await this.exportServices(filters);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Service-specific methods
  async toggleServiceStatus(id: number): Promise<Service> {
    const service = await this.getService(id);
    return this.updateService(id, { is_active: !service.is_active });
  }

  async updateServicePricing(id: number, unitPrice: number): Promise<Service> {
    return this.updateService(id, { unit_price: unitPrice });
  }
}

export const serviceService = new ServiceService();