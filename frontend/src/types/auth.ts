export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  createdAt: string;
  lastActiveAt: string;
  stats: {
    creaturesCreated: number;
    conversationsStarted: number;
    adoptedCreatures: string[];
  };
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: TokenPair;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: 'creator' | 'explorer' | 'adopter';
}
