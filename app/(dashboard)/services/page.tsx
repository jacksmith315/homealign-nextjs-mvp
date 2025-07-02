'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, 
  Search, 
  RotateCcw, 
  Settings,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  DollarSign
} from 'lucide-react';
import { Service } from '@/types/entities';
import { useAuthenticatedFetch } from '@/lib/auth-fetch';
import BulkActionToolbar from '@/components/ui/BulkActionToolbar';
import AdvancedFilters from '@/components/ui/AdvancedFilters';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SERVICE_TYPES } from '@/lib/constants';

const filterOptions = [
  {
    key: 'service_type',
    label: 'Service Type',
    type: 'select' as const,
    options: SERVICE_TYPES
  },
  {
    key: 'authorization_required',
    label: 'Authorization Required',
    type: 'select' as const,
    options: [
      { value: 'true', label: 'Required' },
      { value: 'false', label: 'Not Required' }
    ]
  },
  {
    key: 'telehealth_eligible',
    label: 'Telehealth Eligible',
    type: 'select' as const,
    options: [
      { value: 'true', label: 'Eligible' },
      { value: 'false', label: 'Not Eligible' }
    ]
  },
  {
    key: 'is_active',
    label: 'Status',
    type: 'select' as const,
    options: [
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'Inactive' }
    ]
  }
];

export default function ServicesPage() {
  const fetch = useAuthenticatedFetch();
  const fetchRef = useRef(fetch);
  fetchRef.current = fetch;
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Service[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const fetchServices = useCallback(async (page = 1, search = '', filterParams = {}) => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...filterParams
      });

      const response = await fetchRef.current(`/api/data/services?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      
      setServices(data.results || []);
      setTotalCount(data.count || 0);
      setHasNext(!!data.next);
      setHasPrevious(!!data.previous);
      
      const itemsPerPage = 10;
      setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
    } catch (err: any) {
      setError('Failed to fetch services: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices(currentPage, searchTerm, filters);
  }, [currentPage, searchTerm, filters]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getServiceTypeBadge = (type: string) => {
    const typeColors = {
      medical: 'bg-blue-100 text-blue-800',
      diagnostic: 'bg-purple-100 text-purple-800',
      therapeutic: 'bg-green-100 text-green-800',
      preventive: 'bg-yellow-100 text-yellow-800',
      emergency: 'bg-red-100 text-red-800',
      specialty: 'bg-indigo-100 text-indigo-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}`}>
        {SERVICE_TYPES.find(t => t.value === type)?.label || type}
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
      setSelectedItems([...services]);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (service: Service, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, service]);
    } else {
      setSelectedItems(selectedItems.filter(item => item.id !== service.id));
    }
  };

  const handleBulkDelete = async (items: Service[]) => {
    if (!confirm(`Are you sure you want to delete ${items.length} service(s)?`)) {
      return;
    }

    try {
      setLoading(true);
      
      const deletePromises = items.map(item =>
        fetchRef.current(`/api/data/services/${item.id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      
      setSelectedItems([]);
      await fetchServices(currentPage, searchTerm, filters);
    } catch (err: any) {
      setError('Failed to delete services: ' + err.message);
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

      const response = await fetchRef.current(`/api/data/services?${params}`);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'services.csv';
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
              <h1 className="text-2xl font-bold text-gray-900">Services</h1>
              <p className="text-gray-600">Manage healthcare service catalog and billing</p>
            </div>
            <button
              className="btn-primary flex items-center"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
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
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>
            <button
              onClick={() => fetchServices(currentPage, searchTerm, filters)}
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
          entityName="service"
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

          {!loading && services.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding a new service.
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
                          checked={selectedItems.length === services.length && services.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CPT Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requirements
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {services.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.some(item => item.id === service.id)}
                            onChange={(e) => handleSelectItem(service, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                <Settings className="h-4 w-4 text-primary-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {service.name}
                              </div>
                              {service.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {service.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getServiceTypeBadge(service.service_type)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {service.cpt_code || service.hcpcs_code || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <DollarSign className="h-3 w-3 text-gray-400 mr-1" />
                            {formatCurrency(service.unit_price)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-1">
                            {service.authorization_required && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Auth Required
                              </span>
                            )}
                            {service.referral_required && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Referral Required
                              </span>
                            )}
                            {service.telehealth_eligible && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Telehealth
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {service.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </span>
                          )}
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