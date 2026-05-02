export interface MatchProfile {
  company: string;
  country: string;
  sector: string;
  stage: string;
  revenue: string;
  desc?: string;
  notes?: string;
}

export interface RunMatchDto {
  profile: MatchProfile;
  intent: string[];
  geos: string[];
  priorities: string[];
}

export interface BookCallDto {
  sessionId: string;
  name: string;
  email: string;
  preferredTime: string;
}

export interface GeoDistributionItem {
  geo: string;
  label: string;
  flag: string;
  count: number;
  pct: number;
}

export interface TypeBreakdownItem {
  type: string;
  label: string;
  count: number;
  pct: number;
}

export interface MatchCard {
  type: string;
  role: string;
  mo: string;
  tags: string[];
  score: number;
  av: string;
}

export interface RunMatchResponse {
  sessionId: string;
  matchCount: number;
  aiRead: string;
  geoDistribution: GeoDistributionItem[];
  typeBreakdown: TypeBreakdownItem[];
  topMatches: MatchCard[];
}

export interface BookCallResponse {
  callId: string;
  status: string;
  message: string;
}
