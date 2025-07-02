'use client';

import { useState, useEffect, useCallback } from 'react';
import { PaginatedResponse, ApiError } from '@/types';

export interface UseApiOptions<T> {
  initialData?: T;
  autoFetch?: boolean;
  dependencies?: any[];
}

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: (data: T | null) => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const { initialData = null, autoFetch = true, dependencies = [] } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'An error occurred');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData,
  };
}

// Specialized hook for paginated data
export interface UsePaginatedApiOptions<T> extends UseApiOptions<PaginatedResponse<T>> {
  initialPage?: number;
  initialFilters?: Record<string, any>;
}

export interface UsePaginatedApiResult<T> extends UseApiResult<PaginatedResponse<T>> {
  page: number;
  filters: Record<string, any>;
  setPage: (page: number) => void;
  setFilters: (filters: Record<string, any>) => void;
  refetchWithParams: (newPage?: number, newFilters?: Record<string, any>) => Promise<void>;
}

export function usePaginatedApi<T>(
  apiCall: (page: number, filters: Record<string, any>) => Promise<PaginatedResponse<T>>,
  options: UsePaginatedApiOptions<T> = {}
): UsePaginatedApiResult<T> {
  const { initialPage = 1, initialFilters = {}, ...apiOptions } = options;

  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState(initialFilters);

  const wrappedApiCall = useCallback(() => {
    return apiCall(page, filters);
  }, [apiCall, page, filters]);

  const apiResult = useApi(wrappedApiCall, {
    ...apiOptions,
    dependencies: [page, filters],
  });

  const refetchWithParams = useCallback(
    async (newPage?: number, newFilters?: Record<string, any>) => {
      if (newPage !== undefined) setPage(newPage);
      if (newFilters !== undefined) setFilters(newFilters);
      // The useEffect in useApi will handle the refetch
    },
    []
  );

  return {
    ...apiResult,
    page,
    filters,
    setPage,
    setFilters,
    refetchWithParams,
  };
}

// Hook for mutations (create, update, delete)
export interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

export interface UseMutationResult<T, P> {
  mutate: (params: P) => Promise<T | null>;
  loading: boolean;
  error: string | null;
  data: T | null;
}

export function useMutation<T, P = any>(
  mutationFn: (params: P) => Promise<T>,
  options: UseMutationOptions<T> = {}
): UseMutationResult<T, P> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = useCallback(
    async (params: P): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        const result = await mutationFn(params);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const apiError = err as ApiError;
        const errorMessage = apiError.message || 'An error occurred';
        setError(errorMessage);
        options.onError?.(apiError);
        console.error('Mutation Error:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn, options]
  );

  return {
    mutate,
    loading,
    error,
    data,
  };
}