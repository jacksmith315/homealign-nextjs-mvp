'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, 
  Search, 
  RotateCcw, 
  FileText,
  Calendar,
  Edit2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Referral } from '@/types/entities';
import { useAuthenticatedFetch } from '@/lib/auth-fetch';
import BulkActionToolbar from '@/components/ui/BulkActionToolbar';
import AdvancedFilters from '@/components/ui/AdvancedFilters';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { REFERRAL_STATUSES, PRIORITY_LEVELS } from '@/lib/constants';

const filterOptions = [
  {
    key: 'status',
    label: 'Status',
    type: 'select' as const,
    options: REFERRAL_STATUSES
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select' as const,
    options: PRIORITY_LEVELS.map(p => ({ value: p.value, label: p.label }))
  },
  {
    key: 'referral_date_after',
    label: 'Referral Date After',
    type: 'date' as const,
    placeholder: 'Select date'
  }
];

export default function ReferralsPage() {
  const fetch = useAuthenticatedFetch();
  const fetchRef = useRef(fetch);
  fetchRef.current = fetch;
  
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Referral[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const fetchReferrals = useCallback(async (page = 1, search = '', filterParams = {}) => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...filterParams
      });

      const response = await fetchRef.current(`/api/data/referrals?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch referrals');
      }

      const data = await response.json();
      
      setReferrals(data.results || []);
      setTotalCount(data.count || 0);
      setHasNext(!!data.next);
      setHasPrevious(!!data.previous);
      
      const itemsPerPage = 10;
      setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
    } catch (err: any) {
      setError('Failed to fetch referrals: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals(currentPage, searchTerm, filters);
  }, [currentPage, searchTerm, filters]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    if (!status) return null;
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      denied: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = PRIORITY_LEVELS.find(p => p.value === priority);
    if (!priorityConfig) return null;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig.color}`}>
        {priority === 'urgent' && <AlertCircle className="w-3 h-3 mr-1" />}
        {priorityConfig.label}
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
      setSelectedItems([...referrals]);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (referral: Referral, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, referral]);
    } else {
      setSelectedItems(selectedItems.filter(item => item.id !== referral.id));
    }
  };

  const handleBulkDelete = async (items: Referral[]) => {
    if (!confirm(`Are you sure you want to delete ${items.length} referral(s)?`)) {
      return;
    }

    try {
      setLoading(true);
      
      const deletePromises = items.map(item =>
        fetchRef.current(`/api/data/referrals/${item.id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      
      setSelectedItems([]);
      await fetchReferrals(currentPage, searchTerm, filters);
    } catch (err: any) {
      setError('Failed to delete referrals: ' + err.message);
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

      const response = await fetchRef.current(`/api/data/referrals?${params}`);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'referrals.csv';
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
              <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>
              <p className="text-gray-600">Manage healthcare referrals and authorizations</p>
            </div>
            <button
              className="btn-primary flex items-center"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Referral
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
                  placeholder="Search referrals..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>
            <button
              onClick={() => fetchReferrals(currentPage, searchTerm, filters)}
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
          entityName="referral"
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

          {!loading && referrals.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No referrals found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new referral.
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
                          checked={selectedItems.length === referrals.length && referrals.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referral ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referral Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {referrals.map((referral) => (
                      <tr key={referral.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.some(item => item.id === referral.id)}
                            onChange={(e) => handleSelectItem(referral, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                <FileText className="h-4 w-4 text-primary-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                REF-{referral.id}
                              </div>
                              {referral.authorization_required && (
                                <div className="text-xs text-orange-600">
                                  Auth Required
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          Patient ID: {referral.patient}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          Service ID: {referral.service}
                        </td>
                        <td className="px-6 py-4">
                          {getPriorityBadge(referral.priority)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(referral.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(referral.referral_date)}
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