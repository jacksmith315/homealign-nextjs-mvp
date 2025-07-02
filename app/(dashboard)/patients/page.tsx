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
  User,
  Calendar
} from 'lucide-react';
import { Patient } from '@/types';
import { usePatients, useDeletePatient, useBulkDeletePatients, useExportPatients } from '@/lib/hooks';
import { formatDate, formatPhoneNumber, debounce } from '@/lib/utils';
import BulkActionToolbar from '@/components/ui/BulkActionToolbar';
import AdvancedFilters from '@/components/ui/AdvancedFilters';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import PatientForm from '@/components/forms/PatientForm';

const filterOptions = [
  {
    key: 'gender',
    label: 'Gender',
    type: 'select' as const,
    options: [
      { value: 'm', label: 'Male' },
      { value: 'f', label: 'Female' },
      { value: 's', label: 'Other' },
    ]
  },
  {
    key: 'created_after',
    label: 'Created After',
    type: 'date' as const,
    placeholder: 'Select date'
  }
];

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedItems, setSelectedItems] = useState<Patient[]>([]);

  // Use the patients hook with search and filters
  const { 
    data: patientsData, 
    loading, 
    error, 
    refetch,
    page,
    filters,
    setPage,
    setFilters
  } = usePatients({ 
    search: debouncedSearch,
  });

  // Mutation hooks
  const deletePatient = useDeletePatient();
  const bulkDeletePatients = useBulkDeletePatients();
  const exportPatients = useExportPatients();

  const patients = patientsData?.results || [];
  const totalCount = patientsData?.count || 0;
  const totalPages = Math.ceil(totalCount / 10);
  const hasNext = !!patientsData?.next;
  const hasPrevious = !!patientsData?.previous;

  // Debounced search effect
  useEffect(() => {
    const debouncedUpdate = debounce((term: string) => {
      setDebouncedSearch(term);
      setPage(1); // Reset to first page when searching
    }, 500);

    debouncedUpdate(searchTerm);
  }, [searchTerm, setPage]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone || typeof phone !== 'string') return '';
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const handleBulkDelete = async (items: Patient[]) => {
    if (!confirm(`Are you sure you want to delete ${items.length} patient(s)?`)) {
      return;
    }

    try {
      const ids = items.map(item => item.id);
      await bulkDeletePatients.mutate(ids);
      
      setSelectedItems([]);
      refetch();
    } catch (err: any) {
      console.error('Failed to delete patients:', err);
    }
  };

  const handleExport = async () => {
    try {
      await exportPatients.mutate({ 
        search: debouncedSearch, 
        ...filters 
      });
    } catch (err: any) {
      console.error('Failed to export data:', err);
    }
  };

  const handleDeletePatient = async (patient: Patient) => {
    if (!confirm(`Are you sure you want to delete ${patient.firstname} ${patient.lastname}?`)) {
      return;
    }

    try {
      await deletePatient.mutate(patient.id);
      refetch();
    } catch (err: any) {
      console.error('Failed to delete patient:', err);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems([...patients]);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (patient: Patient, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, patient]);
    } else {
      setSelectedItems(selectedItems.filter(item => item.id !== patient.id));
    }
  };

  const handleCreatePatient = () => {
    setEditingPatient(null);
    setShowCreateModal(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowCreateModal(true);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Members</h1>
              <p className="text-gray-600">Manage patient records and healthcare information</p>
            </div>
            <button
              onClick={handleCreatePatient}
              className="btn-primary flex items-center"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Member
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
                  placeholder="Search members by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
            onFiltersChange={setFilters}
            onReset={() => setFilters({})}
          />
        </div>

        {/* Bulk Actions */}
        <BulkActionToolbar
          selectedItems={selectedItems}
          onBulkDelete={handleBulkDelete}
          onExport={handleExport}
          entityName="member"
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

          {!loading && patients.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new member.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreatePatient}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
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
                          checked={selectedItems.length === patients.length && patients.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DOB
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Insurance ID
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
                    {patients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.some(item => item.id === patient.id)}
                            onChange={(e) => handleSelectItem(patient, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {patient.firstname} {patient.lastname}
                              </div>
                              {patient.medical_record_number && (
                                <div className="text-sm text-gray-500">
                                  MRN: {patient.medical_record_number}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {patient.emailaddress && (
                              <div className="flex items-center mb-1">
                                <Mail className="h-3 w-3 text-gray-400 mr-1" />
                                {patient.emailaddress}
                              </div>
                            )}
                            {patient.phonenumber && (
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 text-gray-400 mr-1" />
                                {formatPhoneNumber(patient.phonenumber)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {patient.dob ? formatDate(patient.dob) : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {patient.insurance_id || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(patient.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditPatient(patient)}
                              className="text-primary-600 hover:text-primary-900 transition-colors duration-150"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePatient(patient)}
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
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title={editingPatient ? 'Edit Member' : 'Add New Member'}
          maxWidth="2xl"
        >
          <PatientForm
            patient={editingPatient}
            onSubmit={() => {
              setShowCreateModal(false);
              refetch();
            }}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>
      </div>
    </div>
  );
}