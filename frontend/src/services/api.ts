const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = false
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(includeAuth);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw data.error || { code: 'UNKNOWN_ERROR', message: 'An error occurred' };
      }

      return data;
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to server',
        timestamp: new Date(),
      };
    }
  }

  async get<T>(endpoint: string, includeAuth: boolean = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, includeAuth);
  }

  async post<T>(
    endpoint: string,
    body: any,
    includeAuth: boolean = false
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      includeAuth
    );
  }

  async put<T>(
    endpoint: string,
    body: any,
    includeAuth: boolean = false
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      },
      includeAuth
    );
  }

  async delete<T>(endpoint: string, includeAuth: boolean = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, includeAuth);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
