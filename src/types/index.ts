export interface Orchid {
  id: string;
  name: string;
  species: string;
  variety?: string;
  purchaseDate: string;
  location: string;
  area?: number;
  imageUrl?: string;
  notes?: string;
  healthStatus: 'healthy' | 'warning' | 'sick';
  createdAt?: number;
  // Lịch tự động (ngày)
  wateringInterval?: number;    // VD: 2 = tưới mỗi 2 ngày
  fertilizingInterval?: number; // VD: 14 = bón phân mỗi 14 ngày
  lastWatered?: string;         // ISO date YYYY-MM-DD
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
