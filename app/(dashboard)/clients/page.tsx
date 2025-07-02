'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  RotateCcw, 
  Mail, 
  Phone, 
  Edit2, 
  Trash2,
  Building,
  Calendar
} from 'lucide-react';
import { Client } from '@/types';
import { useClients, useDeleteClient, useBulkDeleteClients, useExportClients } from '@/lib/hooks';
import { formatDate, formatPhoneNumber, debounce, getStatusColor } from '@/lib/utils';
import BulkActionToolbar from '@/components/ui/BulkActionToolbar';
import AdvancedFilters from '@/components/ui/AdvancedFilters';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import { CLIENT_TYPES, STATUS_OPTIONS } from '@/lib/constants';

const filterOptions = [
  {
    key: 'type',
    label: 'Client Type',
    type: 'select' as const,
    options: CLIENT_TYPES
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select' as const,
    options: STATUS_OPTIONS
  }
];

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedItems, setSelectedItems] = useState<Client[]>([]);

  // Use the clients hook with search and filters
  const { 
    data: clientsData, 
    loading, 
    error, 
    refetch,
    page,
    filters,
    setPage,
    setFilters
  } = useClients({ 
    search: debouncedSearch,
  });

  // Mutation hooks
  const deleteClient = useDeleteClient();
  const bulkDeleteClients = useBulkDeleteClients();
  const exportClients = useExportClients();

  const clients = clientsData?.results || [];
  const totalCount = clientsData?.count || 0;
  const totalPages = Math.ceil(totalCount / 10);
  const hasNext = !!clientsData?.next;
  const hasPrevious = !!clientsData?.previous;

  // Debounced search effect
  useEffect(() => {
    const debouncedUpdate = debounce((term: string) => {
      setDebouncedSearch(term);
      setPage(1); // Reset to first page when searching
    }, 500);

    debouncedUpdate(searchTerm);
  }, [searchTerm, setPage]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems([...clients]);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (client: Client, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, client]);
    } else {
      setSelectedItems(selectedItems.filter(item => item.id !== client.id));
    }
  };

  const handleBulkDelete = async (items: Client[]) => {
    if (!confirm(`Are you sure you want to delete ${items.length} client(s)?`)) {
      return;
    }

    try {
      const ids = items.map(item => item.id);
      await bulkDeleteClients.mutate(ids);
      
      setSelectedItems([]);
      refetch();
    } catch (err: any) {
      console.error('Failed to delete clients:', err);
    }
  };

  const handleExport = async () => {
    try {
      await exportClients.mutate({ 
        search: debouncedSearch, 
        ...filters 
      });
    } catch (err: any) {
      console.error('Failed to export data:', err);
    }
  };

  const handleCreateClient = () => {
    setEditingClient(null);
    setShowCreateModal(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowCreateModal(true);
  };

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Are you sure you want to delete ${client.name}?`)) {
      return;
    }

    try {
      await deleteClient.mutate(client.id);
      refetch();
    } catch (err: any) {
      console.error('Failed to delete client:', err);
    }
  };

  const handleFormSubmit = async () => {
    setShowCreateModal(false);
    refetch();
  };

  const getStatusBadge = (status: string) => {
    if (!status) return null;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
              <p className="text-gray-600">Manage healthcare clients and organizations</p>
            </div>
            <button
              onClick={handleCreateClient}
              className="btn-primary flex items-center"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Client
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
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>
            <button
              onClick={refetch}
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
          entityName="client"
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

          {!loading && clients.length === 0 ? (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new client.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreateClient}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </button>
              </div>
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
                          checked={selectedItems.length === clients.length && clients.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
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
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.some(item => item.id === client.id)}
                            onChange={(e) => handleSelectItem(client, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                <Building className="h-4 w-4 text-primary-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {client.name}
                              </div>
                              {client.contact_person && (
                                <div className="text-sm text-gray-500">
                                  Contact: {client.contact_person}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {CLIENT_TYPES.find(t => t.value === client.type)?.label || client.type}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {client.email && (
                              <div className="flex items-center mb-1">
                                <Mail className="h-3 w-3 text-gray-400 mr-1" />
                                {client.email}
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 text-gray-400 mr-1" />
                                {formatPhoneNumber(client.phone)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(client.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(client.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => handleEditClient(client)}
                              className="text-primary-600 hover:text-primary-900 transition-colors duration-150"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClient(client)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-150"
                            >
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
                currentPage={page}
                totalPages={totalPages}
                totalCount={totalCount}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                onPageChange={setPage}
              />
            </>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <Modal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            title={editingClient ? 'Edit Client' : 'Add New Client'}
            maxWidth="2xl"
          >
            <div className="p-4">
              <p className="text-gray-600">Client form will be implemented here.</p>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFormSubmit}
                  className="btn-primary"
                >
                  {editingClient ? 'Update Client' : 'Create Client'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}