export interface Client {
  id: number;
  name: string;
  type: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  contact_person?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: number;
  first_name: string;
  last_name: string;
  provider_type: string;
  specialty?: string;
  npi_number?: string;
  license_number?: string;
  dea_number?: string;
  email?: string;
  phone?: string;
  practice_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  network_status: string;
  contract_start_date?: string;
  contract_end_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: number;
  patient: number;
  client: number;
  provider: number;
  service: number;
  referral_date: string;
  appointment_date?: string;
  status: string;
  priority: string;
  diagnosis_code?: string;
  clinical_summary?: string;
  authorization_required: boolean;
  authorization_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  service_type: string;
  cpt_code?: string;
  hcpcs_code?: string;
  billing_code?: string;
  revenue_code?: string;
  unit_price?: number;
  units_of_measure?: string;
  authorization_required: boolean;
  referral_required: boolean;
  telehealth_eligible: boolean;
  age_restrictions?: string;
  gender_restrictions?: string;
  contraindications?: string;
  prerequisites?: string;
  provider_instructions?: string;
  patient_instructions?: string;
  frequency_limit?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}