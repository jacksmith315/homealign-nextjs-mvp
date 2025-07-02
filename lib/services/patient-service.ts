import { BaseApiService } from './base-api';
import { Patient, PaginatedResponse } from '@/types';

export interface PatientFilters {
  search?: string;
  gender?: string;
  created_after?: string;
  page?: number;
}

export class PatientService extends BaseApiService {
  private entity = 'patients';

  async getPatients(filters: PatientFilters = {}): Promise<PaginatedResponse<Patient>> {
    return this.getList<Patient>(this.entity, filters);
  }

  async getPatient(id: number): Promise<Patient> {
    return this.getItem<Patient>(this.entity, id);
  }

  async createPatient(data: Partial<Patient>): Promise<Patient> {
    return this.createItem<Patient>(this.entity, data);
  }

  async updatePatient(id: number, data: Partial<Patient>): Promise<Patient> {
    return this.updateItem<Patient>(this.entity, id, data);
  }

  async deletePatient(id: number): Promise<void> {
    return this.deleteItem(this.entity, id);
  }

  async bulkDeletePatients(ids: number[]): Promise<void> {
    return this.bulkDelete(this.entity, ids);
  }

  async exportPatients(filters: PatientFilters = {}): Promise<Blob> {
    return this.exportData(this.entity, filters);
  }

  // Utility method to download CSV export
  async downloadPatientsCSV(filters: PatientFilters = {}, filename = 'patients.csv'): Promise<void> {
    const blob = await this.exportPatients(filters);
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

// Export singleton instance
export const patientService = new PatientService();