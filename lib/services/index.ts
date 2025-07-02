// Service exports
export { BaseApiService } from './base-api';
export { PatientService, patientService } from './patient-service';
export { ClientService, clientService } from './client-service';
export { ProviderService, providerService } from './provider-service';
export { ReferralService, referralService } from './referral-service';
export { ServiceService, serviceService } from './service-service';
export { LookupService, lookupService } from './lookup-service';
export { AuthService, authService } from './auth-service';

// Type exports
export type { PatientFilters } from './patient-service';
export type { ClientFilters } from './client-service';
export type { ProviderFilters } from './provider-service';
export type { ReferralFilters } from './referral-service';
export type { ServiceFilters } from './service-service';
export type { LookupItem, SessionInfo } from './lookup-service';

// Import the services to create centralized instances
import { patientService } from './patient-service';
import { clientService } from './client-service';
import { providerService } from './provider-service';
import { referralService } from './referral-service';
import { serviceService } from './service-service';
import { lookupService } from './lookup-service';
import { authService } from './auth-service';

// Centralized service instances
export const services = {
  patient: patientService,
  client: clientService,
  provider: providerService,
  referral: referralService,
  service: serviceService,
  lookup: lookupService,
  auth: authService,
} as const;