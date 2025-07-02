export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_staff: boolean;
  role?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  database: string;
  email: string;
  password: string;
}

export interface ApiError {
  message: string;
  detail?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Patient {
  // Primary identifiers
  pkpatientid: number;
  id: number;
  
  // Name fields
  firstname: string;
  lastname: string;
  middlename?: string;
  
  // Contact information
  emailaddress?: string;
  phonenumber?: string;
  mobilenumber?: string;
  othernumber?: string;
  primaryphone?: string;
  
  // Address information
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  zip4?: string;
  
  // Demographics
  dob?: string;
  gender?: string;
  
  // Account and insurance
  accountnumber?: string;
  payorinformation?: string;
  
  // Preferences and settings
  preferredcontactmethod?: string;
  receivemonthlyreminderemail?: boolean;
  
  // Additional data
  servicecategories?: string;
  additionaldata?: string;
  
  // Status and relationships
  active?: boolean;
  caregiver?: boolean;
  
  // Foreign keys
  fkcounty?: number;
  fkmembereligibilityid?: number;
  fkpreferredlanguageid?: number;
  member_ids?: string;
  
  // Metadata
  datecreated?: string;
  createdby?: number;
  datemodified?: string;
  modifiedby?: number;
  created_at: string;
  updated_at: string;
  
  // Legacy fields (keeping for backward compatibility)
  insurance_id?: string;
  medical_record_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}

// Re-export from entities
export * from './entities';