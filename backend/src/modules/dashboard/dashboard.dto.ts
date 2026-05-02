export interface DashboardMetric {
  value: string;
  label: string;
  variant?: 'default' | 'good' | 'alert' | 'accent';
}

export interface ReadinessDimension {
  name: string;
  score: number;
  color: string;
}

export interface FeedItem {
  type: 'insight' | 'match' | 'milestone' | 'alert';
  title: string;
  description: string;
  time: string;
  source: string;
}

export interface DashboardSummaryResponse {
  overallScore: number;
  clusterStage: string;
  headline: string;
  summary: string;
  primaryGap: string;
  topLever: string;
  topCountry: string;
  weeklyInsight: string;
  metrics: DashboardMetric[];
  readiness: ReadinessDimension[];
  feed: FeedItem[];
}
