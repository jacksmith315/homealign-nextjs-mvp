import { BaseApiService } from './base-api';
import { Client, PaginatedResponse } from '@/types';

export interface ClientFilters {
  search?: string;
  type?: string;
  status?: string;
  page?: number;
}

export class ClientService extends BaseApiService {
  private entity = 'clients';

  async getClients(filters: ClientFilters = {}): Promise<PaginatedResponse<Client>> {
    return this.getList<Client>(this.entity, filters);
  }

  async getClient(id: number): Promise<Client> {
    return this.getItem<Client>(this.entity, id);
  }

  async createClient(data: Partial<Client>): Promise<Client> {
    return this.createItem<Client>(this.entity, data);
  }

  async updateClient(id: number, data: Partial<Client>): Promise<Client> {
    return this.updateItem<Client>(this.entity, id, data);
  }

  async deleteClient(id: number): Promise<void> {
    return this.deleteItem(this.entity, id);
  }

  async bulkDeleteClients(ids: number[]): Promise<void> {
    return this.bulkDelete(this.entity, ids);
  }

  async exportClients(filters: ClientFilters = {}): Promise<Blob> {
    return this.exportData(this.entity, filters);
  }

  async downloadClientsCSV(filters: ClientFilters = {}, filename = 'clients.csv'): Promise<void> {
    const blob = await this.exportClients(filters);
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

export const clientService = new ClientService();