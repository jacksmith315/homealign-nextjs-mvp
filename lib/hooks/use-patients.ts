'use client';

import { useCallback } from 'react';
import { Patient } from '@/types';
import { patientService, PatientFilters } from '@/lib/services';
import { usePaginatedApi, useMutation, UseApiResult } from './use-api';

// Hook for fetching patients with pagination and filters
export function usePatients(initialFilters: PatientFilters = {}) {
  const fetchPatients = useCallback(
    (page: number, filters: Record<string, any>) => {
      return patientService.getPatients({ ...filters, page });
    },
    []
  );

  return usePaginatedApi(fetchPatients, {
    initialFilters,
    autoFetch: true,
  });
}

// Hook for creating a patient
export function useCreatePatient() {
  return useMutation((data: Partial<Patient>) => patientService.createPatient(data));
}

// Hook for updating a patient
export function useUpdatePatient() {
  return useMutation(({ id, data }: { id: number; data: Partial<Patient> }) =>
    patientService.updatePatient(id, data)
  );
}

// Hook for deleting a patient
export function useDeletePatient() {
  return useMutation((id: number) => patientService.deletePatient(id));
}

// Hook for bulk deleting patients
export function useBulkDeletePatients() {
  return useMutation((ids: number[]) => patientService.bulkDeletePatients(ids));
}

// Hook for exporting patients
export function useExportPatients() {
  return useMutation((filters: PatientFilters) => 
    patientService.downloadPatientsCSV(filters)
  );
}