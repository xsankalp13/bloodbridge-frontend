export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UrgencyLevel = 'critical' | 'urgent' | 'routine';

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface BloodRequest {
  id: string;
  referenceCode: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  hospital: {
    name: string;
    area: string;
    city: string;
    province: string;
    coordinates: GeoCoordinates;
  };
  urgency: UrgencyLevel;
  requiredBy: string;
  timeRemaining: string;
  condition: string;
  contactPerson: string;
  contactPhone: string;
  verified: boolean;
  notes?: string;
  distanceKm?: number;
}

export const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Hyderabad',
  'Gujranwala',
  'Sialkot',
  'Abbottabad',
  'Sukkur',
] as const;

export type PakistaniCity = typeof PAKISTAN_CITIES[number];
