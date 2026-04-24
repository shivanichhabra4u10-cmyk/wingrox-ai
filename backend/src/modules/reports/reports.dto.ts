import { z } from 'zod';

export const ReportRangeSchema = z.object({
  range: z.enum(['7d', '30d', '90d']).default('30d'),
  country: z.string().trim().min(2).optional(),
  industry: z.string().trim().min(2).optional(),
  stage: z.string().trim().min(2).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(30),
});

export type ReportRangeDTO = z.infer<typeof ReportRangeSchema>;

export interface ReportPoint {
  date: string;
  pipeline: number;
  matches: number;
  conversionRate: number;
}

export interface ReportsSummaryResponse {
  range: '7d' | '30d' | '90d';
  filters: {
    country?: string;
    industry?: string;
    stage?: string;
  };
  pagination: {
    page: number;
    limit: number;
    totalPoints: number;
    hasMore: boolean;
  };
  totals: {
    pipelineEur: number;
    matches: number;
    avgConversionRate: number;
  };
  trend: ReportPoint[];
}

export interface SegmentItem {
  key: string;
  pipelineEur: number;
  matches: number;
  avgConversionRate: number;
}

export interface ReportsSegmentsResponse {
  byCountry: SegmentItem[];
  byIndustry: SegmentItem[];
  byStage: SegmentItem[];
}

export interface RealtimeEventPayload {
  type: 'heartbeat' | 'metric-update';
  ts: string;
  data: Record<string, unknown>;
}
