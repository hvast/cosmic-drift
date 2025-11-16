export interface Vector2 {
  x: number;
  y: number;
}

export interface ContourData {
  points: Vector2[];
  boundingBox: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export interface Creature {
  id: string;
  name: string;
  species: string;
  personality: string[];
  habitat: string;
  backstory: string;
  imageUrl: string;
  creatorId: string | null;
  adopterId?: string | null;
  status: 'drifting' | 'adopted';
  emotionValue: number;
  contourData?: ContourData | null;
  createdAt: Date;
  adoptedAt?: Date;
}

export interface CreateCreatureData {
  name: string;
  species: string;
  personality: string[];
  habitat: string;
  backstory: string;
  imageUrl: string;
  creatorId: string | null;
  emotionValue?: number;
  contourData?: ContourData | null;
}
