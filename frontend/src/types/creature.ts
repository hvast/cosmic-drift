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
}

export interface CreatureCreationRequest {
  imageData: string;
  userCustomization?: {
    name?: string;
    story?: string;
  };
}
