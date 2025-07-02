# Data Fetching Implementation

This document describes the comprehensive data fetching layer implemented for the HomeAlign Next.js MVP application.

## Architecture Overview

The data fetching layer follows a service-oriented architecture with the following components:

### 1. Base API Service (`lib/services/base-api.ts`)
- **Purpose**: Provides common HTTP operations and error handling
- **Features**:
  - Automatic authentication cookie handling
  - Standardized error handling with proper typing
  - Generic CRUD operations (create, read, update, delete)
  - Bulk operations support
  - CSV export functionality
  - Query parameter management

### 2. Entity-Specific Services
Each entity has its own service class that extends the base API service:

- **PatientService**: Manages patient data with healthcare-specific operations
- **ClientService**: Handles client/organization management
- **ProviderService**: Manages healthcare provider network
- **ReferralService**: Handles referral workflow with status/priority updates
- **ServiceService**: Manages healthcare service catalog with pricing
- **LookupService**: Provides reference data (statuses, types, etc.)
- **AuthService**: Handles authentication operations

### 3. React Hooks Layer (`lib/hooks/`)
Custom hooks provide easy integration with React components:

#### Core API Hooks:
- **useApi**: Generic hook for single API calls
- **usePaginatedApi**: Specialized hook for paginated data with filters
- **useMutation**: Hook for create/update/delete operations

#### Entity-Specific Hooks:
- **usePatients**: Paginated patient data with search/filters
- **useCreatePatient**: Patient creation with optimistic updates
- **useUpdatePatient**: Patient updates with error handling
- **useDeletePatient**: Single patient deletion
- **useBulkDeletePatients**: Multiple patient deletion
- **useExportPatients**: CSV export functionality

Similar hook patterns for clients, providers, referrals, and services.

## Key Features

### 1. Type Safety
- All services and hooks are fully typed with TypeScript
- Proper error handling with typed ApiError interface
- Type-safe filter and parameter interfaces

### 2. Error Handling
```typescript
// Standardized error handling across all services
try {
  const result = await patientService.getPatients();
} catch (error: ApiError) {
  console.error(error.message, error.status);
}
```

### 3. Pagination Support
```typescript
// Easy pagination with filters
const { data, loading, error, page, setPage, setFilters } = usePatients({
  search: searchTerm,
  gender: 'f'
});
```

### 4. Optimistic Updates
```typescript
// Mutations with automatic refetching
const createPatient = useCreatePatient();
await createPatient.mutate(patientData);
// Component automatically updates
```

### 5. CSV Export
```typescript
// One-line CSV export
await patientService.downloadPatientsCSV({ 
  search: 'john', 
  gender: 'm' 
});
```

### 6. Bulk Operations
```typescript
// Bulk delete with progress tracking
const bulkDelete = useBulkDeletePatients();
await bulkDelete.mutate([1, 2, 3, 4, 5]);
```

## Usage Examples

### Basic Data Fetching
```typescript
function PatientList() {
  const { data, loading, error } = usePatients();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {data?.results.map(patient => (
        <div key={patient.id}>{patient.first_name}</div>
      ))}
    </div>
  );
}
```

### Advanced Filtering and Search
```typescript
function PatientManagement() {
  const [filters, setFilters] = useState({ gender: 'f' });
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    data, 
    loading, 
    page, 
    setPage, 
    setFilters: updateFilters 
  } = usePatients({ 
    search: searchTerm,
    ...filters 
  });
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1); // Reset to first page
  };
  
  return (
    <SearchableFilterableTable 
      data={data}
      onSearch={handleSearch}
      onFilter={updateFilters}
      onPageChange={setPage}
    />
  );
}
```

### Form Integration
```typescript
function PatientForm({ patient }: { patient?: Patient }) {
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  
  const handleSubmit = async (formData: Partial<Patient>) => {
    if (patient) {
      await updatePatient.mutate({ id: patient.id, data: formData });
    } else {
      await createPatient.mutate(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button 
        type="submit" 
        disabled={createPatient.loading || updatePatient.loading}
      >
        {patient ? 'Update' : 'Create'} Patient
      </button>
    </form>
  );
}
```

## Benefits

### 1. Developer Experience
- **Consistent API**: Same patterns across all entities
- **Type Safety**: Catch errors at compile time
- **Auto-completion**: Full IntelliSense support
- **Error Handling**: Standardized error management

### 2. Performance
- **Debounced Search**: Automatic search optimization
- **Pagination**: Efficient data loading
- **Caching**: Built-in request deduplication
- **Optimistic Updates**: Instant UI feedback

### 3. Maintainability
- **Single Source of Truth**: Centralized API logic
- **Reusable Hooks**: DRY principle implementation
- **Separation of Concerns**: Clean architecture
- **Easy Testing**: Isolated service functions

### 4. User Experience
- **Loading States**: Proper loading indicators
- **Error Messages**: User-friendly error display
- **Instant Feedback**: Optimistic UI updates
- **Offline Support**: Built-in retry mechanisms

## Next Steps

The data fetching layer is production-ready and provides:

1. **Complete CRUD Operations** for all entities
2. **Advanced Search and Filtering** capabilities
3. **Bulk Operations** for efficiency
4. **Export Functionality** for data analysis
5. **Error Handling** with user feedback
6. **Type Safety** throughout the application

This implementation significantly improves upon the original React SPA by:
- Moving API calls to the server side for security
- Providing better error handling and loading states
- Implementing proper TypeScript typing
- Adding advanced features like bulk operations and CSV export
- Creating reusable hooks for consistent data management