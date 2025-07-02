import { PaginatedResponse, ApiError } from '@/types';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
}

export class BaseApiService {
  protected baseUrl: string;

  constructor(baseUrl: string = '/api/data') {
    this.baseUrl = baseUrl;
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { method = 'GET', headers = {}, body, params } = options;

    // Build URL with query parameters
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials: 'include', // Include cookies for authentication
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = 'An error occurred';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.detail || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        const error: ApiError = {
          message: errorMessage,
          status: response.status,
        };
        throw error;
      }

      // Handle empty responses (like DELETE operations)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      // For non-JSON responses (like CSV exports)
      return response as any;
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error; // Re-throw API errors
      }
      
      // Network or other errors
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Network error occurred',
        status: 0,
      };
      throw apiError;
    }
  }

  // Generic CRUD operations
  async getList<T>(
    entity: string,
    params: Record<string, any> = {}
  ): Promise<PaginatedResponse<T>> {
    return this.makeRequest<PaginatedResponse<T>>(`/${entity}`, {
      method: 'GET',
      params,
    });
  }

  async getItem<T>(entity: string, id: number | string): Promise<T> {
    return this.makeRequest<T>(`/${entity}/${id}`);
  }

  async createItem<T>(entity: string, data: any): Promise<T> {
    return this.makeRequest<T>(`/${entity}`, {
      method: 'POST',
      body: data,
    });
  }

  async updateItem<T>(entity: string, id: number | string, data: any): Promise<T> {
    return this.makeRequest<T>(`/${entity}/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteItem(entity: string, id: number | string): Promise<void> {
    return this.makeRequest<void>(`/${entity}/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkDelete(entity: string, ids: (number | string)[]): Promise<void> {
    const promises = ids.map(id => this.deleteItem(entity, id));
    await Promise.all(promises);
  }

  async exportData(
    entity: string,
    params: Record<string, any> = {}
  ): Promise<Blob> {
    const exportParams = { ...params, format: 'csv' };
    const response = await this.makeRequest<Response>(`/${entity}`, {
      method: 'GET',
      params: exportParams,
    });
    
    return (response as Response).blob();
  }
}