export interface VisualFeatures {
  dominantColors: string[];
  style: string;
  complexity: number;
}

export interface SuggestedProfile {
  species: string;
  personality: string[];
  habitat: string;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface ContourData {
  points: Vector2[];
  version?: string;
}

export interface CreatureProfile {
  id: string;
  name: string;
  species: string;
  personality: string[];
  habitat: string;
  backstory: string;
  imageUrl: string;
  creatorId: string;
  adopterId?: string;
  status: 'drifting' | 'adopted';
  emotionValue: number;
  createdAt: string;
  adoptedAt?: string;
  contourData?: ContourData;
}

export interface CreatureCreationRequest {
  imageData: string;
  userCustomization?: {
    name?: string;
    species?: string;
    personality?: string[];
    habitat?: string;
    story?: string;
    emotionValue?: number;
  };
}
