export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  role: 'creator' | 'explorer' | 'adopter';
  createdAt: Date;
  lastActiveAt: Date;
  stats: UserStats;
}

export interface UserStats {
  creaturesCreated: number;
  conversationsStarted: number;
  adoptedCreatures: string[];
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  role?: 'creator' | 'explorer' | 'adopter';
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
  avatar?: string;
  lastActiveAt?: Date;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  createdAt: Date;
  lastActiveAt: Date;
  stats: UserStats;
}
