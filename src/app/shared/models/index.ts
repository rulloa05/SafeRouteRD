export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  stateCity: string;
  vehicleType: 'sedan' | 'suv' | null;
  avatarUrl?: string;
}

export interface RouteOption {
  id: string;
  name: string;
  estimatedMinutes: number;
  distanceKm: number;
  safetyLevel: 'alto' | 'medio' | 'bajo';
  roadCondition: 'bueno' | 'regular' | 'malo';
  vehicleCompatibility: string;
  isRecommended: boolean;
}

export interface RouteDetail extends RouteOption {
  startPoint: string;
  dropLocation: string;
  emergencyNumber: string;
  gasolinePricePerDistance: number;
  alternatives: RouteAlternative[];
}

export interface RouteAlternative {
  name: string;
  estimatedMinutes: number;
}

export interface Booking {
  id: string;
  routeName: string;
  date: string;
  time: string;
  vehicleName: string;
  cost: number;
  rating: number;
  status: 'past' | 'current';
}

export interface Incident {
  id: string;
  type: 'road_damage' | 'crime' | 'weather' | 'other';
  description: string;
  imageUrl?: string;
  lat: number;
  lng: number;
  createdAt: string;
}

export interface RouteComment {
  id: string;
  userName: string;
  vehicleType: string;
  vehicleName: string;
  vehicleYear: number;
  rating: number;
  comment: string;
  routeName: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface GasCalculation {
  totalDistance: number;
  rideTimeMinutes: number;
  totalAmount: number;
  currency: string;
}

export interface TripHistory {
  id: string;
  origin: string;
  destination: string;
  vehicleType: string;
  vehicleLabel: string;
  distanceKm: number;
  durationMinutes: number;
  date: string;        // ISO string
  routeName: string;
}

export interface UserIncident {
  id: string;
  icon: string;
  label: string;
  lat: number;
  lng: number;
  createdAt: string;   // ISO string
  address?: string;
}
