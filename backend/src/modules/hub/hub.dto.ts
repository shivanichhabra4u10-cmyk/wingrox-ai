export interface HubArticle {
  slug: string;
  type: string;          // PLAYBOOK | MARKET_INTEL | BENCHMARK | CASE_STUDY
  typeLabel: string;
  typeColor: string;     // CSS var
  typeBg: string;
  typeBorder: string;
  topic: string;         // GTM | EXPANSION | FUNDRAISING | UNIT_ECONOMICS | LEADERSHIP | REGULATION
  topicLabel: string;
  topicColor: string;
  topicBg: string;
  topicBorder: string;
  title: string;
  description: string;
  readTimeMin: number;
  ageLabel: string;
  source: string;
  whatThisMeansForYou: string;
  saved?: boolean;
}

export interface HubFeedResponse {
  articles: HubArticle[];
  totalCount: number;
  personalized: boolean;
}

export interface SaveArticleDto {
  articleSlug: string;
  sessionId: string;
  email?: string;
}

export interface SaveArticleResponse {
  saved: boolean;
  articleSlug: string;
}

export interface HubSavesResponse {
  savedSlugs: string[];
}
