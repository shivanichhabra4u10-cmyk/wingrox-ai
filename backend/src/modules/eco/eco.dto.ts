export interface ApplyDto {
  name: string;
  email: string;
  company: string;
  website?: string;
  role: string;
  partnerType: string;
  sector: string;
  stage?: string;
  reason?: string;
}

export interface ApplyResponse {
  applicationId: string;
  status: string;
  message: string;
}

export interface EcoStatusResponse {
  found: boolean;
  applicationId?: string;
  status?: string;
  partnerType?: string;
  submittedAt?: string;
}

export interface EcoStatsResponse {
  investors: number;
  distributors: number;
  experts: number;
  total: number;
}
