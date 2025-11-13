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
}
