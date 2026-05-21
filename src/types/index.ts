export interface GardenPosition {
  zoneId: string;
  row: number;
  col: number;
}

export interface Orchid {
  id: string;
  name: string;
  species: string;
  variety?: string;
  purchaseDate: string;
  location: string;
  quantity?: number;
  imageUrl?: string;
  notes?: string;
  healthStatus: 'healthy' | 'warning' | 'sick';
  createdAt?: number;
  price?: number;
  sold?: boolean;
  gardenPosition?: GardenPosition;
  // Lịch tự động (ngày)
  wateringInterval?: number;
  fertilizingInterval?: number;
  lastWatered?: string;
  lastFertilized?: string;
}

export interface CareTask {
  id: string;
  orchidId: string;
  type: 'watering' | 'fertilizing' | 'repotting' | 'pruning' | 'other';
  scheduledDate: string;
  completedDate?: string;
  notes?: string;
  isCompleted: boolean;
}

export interface Disease {
  id: string;
  name: string;
  nameVi: string;
  symptoms: string[];
  causes: string[];
  treatment: string[];
  prevention: string[];
}

export interface Pest {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
}

export interface CareLog {
  id: string;
  type: 'watering' | 'fertilizing' | 'repotting' | 'pruning' | 'blooming' | 'other';
  date: string;
  note?: string;
  createdAt: number;
}

export interface OrchidImage {
  id: string;
  url: string;
  note?: string;
  createdAt: number;
}
