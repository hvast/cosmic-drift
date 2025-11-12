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

export interface AIAnalysisResult {
  visualFeatures: VisualFeatures;
  suggestedProfile: SuggestedProfile;
}

export interface CreatureProfile {
  id: string;
  name: string;
  species: string;
  personality: string[];
  habitat: string;
  imageUrl: string;
  creatorId: string;
  createdAt: Date;
  status: 'drifting' | 'adopted';
  emotionValue: number;
}

export interface CreatureCreationRequest {
  imageData: string;
  userCustomization?: {
    name?: string;
    story?: string;
  };
}
