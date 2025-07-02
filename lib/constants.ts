export const DATABASES = [
  { id: 'allyalign', name: 'Allyalign' },
  { id: 'core', name: 'Core' },
  { id: 'humana', name: 'Humana' },
  { id: 'bcbs_az', name: 'BCBS Arizona' },
  { id: 'centene', name: 'Centene' },
  { id: 'uhc', name: 'UHC' },
  { id: 'aarp', name: 'AARP' },
  { id: 'aetna', name: 'Aetna' },
];

export const CLIENT_TYPES = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'corporate', label: 'Corporate' },
];

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
];

export const PROVIDER_TYPES = [
  { value: 'individual', label: 'Individual Provider' },
  { value: 'organization', label: 'Organization' },
  { value: 'facility', label: 'Facility' },
];

export const REFERRAL_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

export const SERVICE_TYPES = [
  { value: 'medical', label: 'Medical Service' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'therapeutic', label: 'Therapeutic' },
  { value: 'preventive', label: 'Preventive Care' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'specialty', label: 'Specialty Care' },
];

export const MENU_ITEMS = [
  { id: 'patients', label: 'Members', icon: 'Users', href: '/patients' },
  { id: 'clients', label: 'Clients', icon: 'Building', href: '/clients' },
  { id: 'providers', label: 'Providers', icon: 'UserCheck', href: '/providers' },
  { id: 'referrals', label: 'Referrals', icon: 'FileText', href: '/referrals' },
  { id: 'services', label: 'Services', icon: 'Settings', href: '/services' },
];