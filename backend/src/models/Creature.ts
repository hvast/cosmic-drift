export interface Creature {
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
  creatorId: string;
  emotionValue?: number;
}
