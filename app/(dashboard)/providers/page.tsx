'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, 
  Search, 
  RotateCcw, 
  UserCheck,
  Calendar,
  Edit2,
  Trash2
} from 'lucide-react';
import { Provider } from '@/types/entities';
import { useAuthenticatedFetch } from '@/lib/auth-fetch';
import BulkActionToolbar from '@/components/ui/BulkActionToolbar';
import AdvancedFilters from '@/components/ui/AdvancedFilters';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PROVIDER_TYPES } from '@/lib/constants';

const filterOptions = [
  {
    key: 'provider_type',
    label: 'Provider Type',
    type: 'select' as const,
    options: PROVIDER_TYPES
  },
  {
    key: 'network_status',
    label: 'Network Status',
    type: 'select' as const,
    options: [
      { value: 'in_network', label: 'In Network' },
      { value: 'out_of_network', label: 'Out of Network' },
      { value: 'pending', label: 'Pending' }
    ]
  }
];

export default function ProvidersPage() {
  const fetch = useAuthenticatedFetch();
  const fetchRef = useRef(fetch);
  fetchRef.current = fetch;
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Provider[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const fetchProviders = useCallback(async (page = 1, search = '', filterParams = {}) => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...filterParams
      });

      const response = await fetchRef.current(`/api/data/providers?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }

      const data = await response.json();
      
      setProviders(data.results || []);
      setTotalCount(data.count || 0);
      setHasNext(!!data.next);
      setHasPrevious(!!data.previous);
      
      const itemsPerPage = 10;
      setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
    } catch (err: any) {
      setError('Failed to fetch providers: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders(currentPage, searchTerm, filters);
  }, [currentPage, searchTerm, filters]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getNetworkStatusBadge = (status: string) => {
    if (!status) return null;
    const statusColors = {
      in_network: 'bg-green-100 text-green-800',
      out_of_network: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems([...providers]);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (provider: Provider, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, provider]);
    } else {
      setSelectedItems(selectedItems.filter(item => item.id !== provider.id));
    }
  };

  const handleBulkDelete = async (items: Provider[]) => {
    if (!confirm(`Are you sure you want to delete ${items.length} provider(s)?`)) {
      return;
    }

    try {
      setLoading(true);
      
      const deletePromises = items.map(item =>
        fetchRef.current(`/api/data/providers/${item.id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      
      setSelectedItems([]);
      await fetchProviders(currentPage, searchTerm, filters);
    } catch (err: any) {
      setError('Failed to delete providers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...filters,
        format: 'csv'
      });

      const response = await fetchRef.current(`/api/data/providers?${params}`);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'providers.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Failed to export data: ' + err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Providers</h1>
              <p className="text-gray-600">Manage healthcare provider network</p>
            </div>
            <button
              className="btn-primary flex items-center"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Provider
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>
            <button
              onClick={() => fetchProviders(currentPage, searchTerm, filters)}
              className="btn-secondary flex items-center"
              disabled={loading}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>

          <AdvancedFilters
            filterOptions={filterOptions}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Bulk Actions */}
        <BulkActionToolbar
          selectedItems={selectedItems}
          onBulkDelete={handleBulkDelete}
          onExport={handleExport}
          entityName="provider"
        />

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="card overflow-hidden">
          {loading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          )}

          {!loading && providers.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No providers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding a new provider.
              </p>
            </div>
          ) : !loading && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === providers.length && providers.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Provider
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Specialty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NPI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Network Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {providers.map((provider) => (
                      <tr key={provider.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.some(item => item.id === provider.id)}
                            onChange={(e) => handleSelectItem(provider, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                <UserCheck className="h-4 w-4 text-primary-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {provider.first_name} {provider.last_name}
                              </div>
                              {provider.practice_name && (
                                <div className="text-sm text-gray-500">
                                  {provider.practice_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {PROVIDER_TYPES.find(t => t.value === provider.provider_type)?.label || provider.provider_type}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {provider.specialty || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {provider.npi_number || '—'}
                        </td>
                        <td className="px-6 py-4">
                          {getNetworkStatusBadge(provider.network_status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(provider.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-primary-600 hover:text-primary-900 transition-colors duration-150">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900 transition-colors duration-150">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}