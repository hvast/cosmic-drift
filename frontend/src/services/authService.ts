import { apiClient } from './api';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  TokenPair,
  User,
} from '../types/auth';

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    this.saveTokens(response.tokens);
    return response;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    this.saveTokens(response.tokens);
    return response;
  }

  async refreshToken(): Promise<TokenPair> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{ tokens: TokenPair }>(
      '/api/auth/refresh',
      { refreshToken }
    );
    this.saveTokens(response.tokens);
    return response.tokens;
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ user: User }>('/api/auth/me', true);
    return response.user;
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  saveTokens(tokens: TokenPair): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
