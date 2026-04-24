// Shared types and enums used across frontend and backend

// AUTH & USERS
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

// API RESPONSE FORMAT
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId?: string;
}

// ERRORS
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
}

// DASHBOARD & METRICS
export interface Metric {
  id: string;
  label: string;
  value: number | string;
  trend?: 'up' | 'down' | 'neutral';
  trendPercent?: number;
  variant?: 'gold' | 'sage' | 'rose' | 'slate';
}

export interface DashboardCard {
  id: string;
  title: string;
  description?: string;
  type: 'metric' | 'chart' | 'feed' | 'custom';
  data: any;
}

// PAGINATION
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// AUDIT LOG
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
}
