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

export interface ActionTile {
  icon: string;
  title: string;
  description: string;
  href: string;
}

export interface FeedItem {
  type: 'insight' | 'match' | 'milestone' | 'alert';
  title: string;
  description: string;
  time: string;
  source: string;
}

export interface DashboardOverviewResponse {
  greeting: string;
  stage: string;
  metrics: DashboardMetric[];
  readiness: ReadinessDimension[];
  actions: ActionTile[];
  feed: FeedItem[];
}
