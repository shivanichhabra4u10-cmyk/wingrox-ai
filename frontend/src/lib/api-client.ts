import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

function normalizeApiBaseUrl(rawValue?: string): string {   
  
  const raw = (rawValue || '/api').trim();
  console.log('Raw API URL from environment:', raw);

  if (raw.startsWith('/')) {
    const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://localhost:3001';
    return `${backendOrigin}${raw}`.replace(/\/$/, '');
  }

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;

  try {
    const parsed = new URL(withProtocol);
    const cleanPath = parsed.pathname.replace(/\/$/, '');
    parsed.pathname = cleanPath === '' || cleanPath === '/' ? '/api' : cleanPath;
    console.log('Normalized API URL:', parsed.toString().replace(/\/$/, ''));
    return parsed.toString().replace(/\/$/, '');
  } catch {
    console.log('in catch');
    return 'http://localhost:3001';
  }
}

export const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);

console.log('API_BASE_URL:', API_BASE_URL);

export type TwinDynamicReport = {
  generatedAt: string;
  packageKey: string;
  company: {
    name: string;
    country: string;
    industry: string;
    stage: string;
  };
  overallScore: number;
  readinessBand: string;
  dimensions: Array<{ key: string; title: string; score: number }>;
  topConstraints: Array<{ question: string; value: number }>;
  recommendations: string[];
  strategicPriority: string;
  planningHorizon: string;
  notes: string;
};

/**
 * API Client
 * Handles all communication with the backend API
 */
class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      },
    );
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
    if (typeof document !== 'undefined') {
      document.cookie = `accessToken=${token}; path=/; max-age=86400; samesite=lax`;
    }
  }

  getAccessToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('accessToken');
    }
    return this.accessToken;
  }

  clearAuth() {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; path=/; max-age=0; samesite=lax';
    }
  }

  private handleUnauthorized() {
    this.clearAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    if (response.data.data?.accessToken) {
      this.setAccessToken(response.data.data.accessToken);
      if (response.data.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }
    }
    return response.data;
  }

  async signup(email: string, password: string, name: string) {
    const response = await this.client.post('/auth/signup', {
      email,
      password,
      name,
    });
    if (response.data.data?.accessToken) {
      this.setAccessToken(response.data.data.accessToken);
    }
    return response.data;
  }

  async refreshToken(token: string) {
    const response = await this.client.post('/auth/refresh', {
      refreshToken: token,
    });
    if (response.data.data?.accessToken) {
      this.setAccessToken(response.data.data.accessToken);
    }
    return response.data;
  }

  // User endpoints
  async getUserProfile() {
    const response = await this.client.get('/users/profile');
    return response.data;
  }

  async getUser(id: string) {
    const response = await this.client.get(`/users/${id}`);
    return response.data;
  }

  async listUsers() {
    const response = await this.client.get('/users');
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardOverview() {
    const response = await this.client.get('/dashboard/overview');
    return response.data;
  }

  async getReportsSummary(
    range: '7d' | '30d' | '90d' = '30d',
    filters?: {
      country?: string;
      industry?: string;
      stage?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const params = new URLSearchParams({ range });
    if (filters?.country) params.set('country', filters.country);
    if (filters?.industry) params.set('industry', filters.industry);
    if (filters?.stage) params.set('stage', filters.stage);
    if (typeof filters?.page === 'number') params.set('page', String(filters.page));
    if (typeof filters?.limit === 'number') params.set('limit', String(filters.limit));

    const response = await this.client.get(`/reports/summary?${params.toString()}`);
    return response.data;
  }

  async getReportSegments(
    range: '7d' | '30d' | '90d' = '30d',
    filters?: { country?: string; industry?: string; stage?: string },
  ) {
    const params = new URLSearchParams({ range });
    if (filters?.country) params.set('country', filters.country);
    if (filters?.industry) params.set('industry', filters.industry);
    if (filters?.stage) params.set('stage', filters.stage);
    const response = await this.client.get(`/reports/segments?${params.toString()}`);
    return response.data;
  }

  // Twin assessment endpoints
  async sendTwinOtp(payload: { email: string; packageKey: 'nucleus' | 'catalyst' | 'vanguard' | 'apex' }) {
    const response = await this.client.post('/twin-assessment/otp/send', payload);
    return response.data;
  }

  async verifyTwinOtp(payload: { email: string; code: string }) {
    const response = await this.client.post('/twin-assessment/otp/verify', payload);
    return response.data;
  }

  async saveTwinProgress(payload: {
    sessionToken: string;
    packageKey: 'nucleus' | 'catalyst' | 'vanguard' | 'apex';
    company?: Record<string, unknown>;
    canvas?: Record<string, unknown>;
    answers?: Record<string, unknown>;
    aiAnswers?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }) {
    const response = await this.client.post('/twin-assessment/progress', payload);
    return response.data;
  }

  async completeTwinAssessment(payload: {
    sessionToken: string;
    packageKey: 'nucleus' | 'catalyst' | 'vanguard' | 'apex';
    company?: Record<string, unknown>;
    canvas?: Record<string, unknown>;
    answers?: Record<string, unknown>;
    aiAnswers?: Record<string, unknown>;
    report?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }) {
    const response = await this.client.post<{
      success: boolean;
      data: {
        id: string;
        report?: TwinDynamicReport;
      };
      timestamp: string;
    }>('/twin-assessment/complete', payload);
    return response.data;
  }

  async createReportsStreamToken() {
    const response = await this.client.get('/reports/stream-token');
    return response.data;
  }

  // Accounts endpoints
  async listAccounts() {
    const response = await this.client.get('/accounts');
    return response.data;
  }

  async getAccount(id: string) {
    const response = await this.client.get(`/accounts/${id}`);
    return response.data;
  }

  async createAccount(payload: {
    name: string;
    legalName?: string;
    website?: string;
    country: string;
    industry: string;
    stage: string;
    annualRevenueUsd?: number;
    description?: string;
  }) {
    const response = await this.client.post('/accounts', payload);
    return response.data;
  }

  async updateAccount(
    id: string,
    payload: Partial<{
      name: string;
      legalName: string;
      website: string;
      country: string;
      industry: string;
      stage: string;
      annualRevenueUsd: number;
      description: string;
    }>,
  ) {
    const response = await this.client.patch(`/accounts/${id}`, payload);
    return response.data;
  }

  async deleteAccount(id: string) {
    const response = await this.client.delete(`/accounts/${id}`);
    return response.data;
  }

  // Generic request methods
  async get(url: string, config?: AxiosRequestConfig) {
    return this.client.get(url, config);
  }

  async post(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.post(url, data, config);
  }

  async put(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.put(url, data, config);
  }

  async delete(url: string, config?: AxiosRequestConfig) {
    return this.client.delete(url, config);
  }
}

export const apiClient = new ApiClient();
