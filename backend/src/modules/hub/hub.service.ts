import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { HubArticle, HubFeedResponse, SaveArticleDto, SaveArticleResponse, HubSavesResponse } from './hub.dto';

const ARTICLES: HubArticle[] = [
  {
    slug: 'distribution-led-entry-germany',
    type: 'PLAYBOOK', typeLabel: 'PLAYBOOK', typeColor: 'var(--ink)', typeBg: 'var(--ink-08)', typeBorder: 'var(--ink-15)',
    topic: 'EXPANSION', topicLabel: 'GLOBAL EXPANSION', topicColor: 'var(--teal)', topicBg: 'var(--teal-pale)', topicBorder: 'var(--teal)',
    title: 'Distribution-led entry for industrial SaaS in Germany: the 90-day playbook',
    description: 'A structured framework covering partner identification, qualification, pilots, and contract structuring — built from 40+ successful entries in the DACH region. Includes a ready-to-use term sheet.',
    readTimeMin: 18, ageLabel: '2d ago', source: 'WinGroX Research',
    whatThisMeansForYou: 'You\'re within 2 weeks of being ready to execute steps 1–3 of this playbook. Your Distribution Fit score is above the threshold this framework assumes. Skip the pilot section on page 4; your unit economics already clear it.',
  },
  {
    slug: 'dach-industrial-automation-buyers-q1-2026',
    type: 'MARKET_INTEL', typeLabel: 'MARKET INTEL', typeColor: 'var(--slate)', typeBg: 'var(--slate-pale)', typeBorder: 'var(--slate)',
    topic: 'GTM', topicLabel: 'GO-TO-MARKET', topicColor: 'var(--ink)', topicBg: 'var(--ink-08)', topicBorder: 'var(--ink-15)',
    title: 'DACH industrial automation buyers — what moved in Q1 2026',
    description: 'Budget cycles, procurement shifts, and the 3 new regulatory triggers (EU AI Act enforcement, cybersecurity certifications, GDPR amendments) reshaping buyer behaviour this quarter.',
    readTimeMin: 8, ageLabel: '5d ago', source: 'WinGroX Research',
    whatThisMeansForYou: 'Your ICP overlaps strongly with the buyer profile in Section 2. The cybersecurity certification trigger is the single biggest near-term demand accelerator for your category — lean into this in your pitch deck.',
  },
  {
    slug: 'cac-ltv-seed-series-a',
    type: 'PLAYBOOK', typeLabel: 'PLAYBOOK', typeColor: 'var(--ink)', typeBg: 'var(--ink-08)', typeBorder: 'var(--ink-15)',
    topic: 'UNIT_ECONOMICS', topicLabel: 'UNIT ECONOMICS', topicColor: 'var(--sage)', topicBg: 'var(--sage-pale)', topicBorder: 'var(--sage)',
    title: 'The CAC:LTV conversation investors actually want at Seed→Series A',
    description: 'Why most founders over-simplify this metric and what Tier-1 European VCs actually probe. With slide-ready charts and a cohort analysis template.',
    readTimeMin: 12, ageLabel: '1w ago', source: 'WinGroX Research',
    whatThisMeansForYou: 'Your current CAC:LTV story is a simplified ratio. Apply the cohort-layered framing on page 3 — it\'s what your matched investors explicitly look for.',
  },
  {
    slug: 'fundraising-narrative-european-vcs',
    type: 'PLAYBOOK', typeLabel: 'PLAYBOOK', typeColor: 'var(--ink)', typeBg: 'var(--ink-08)', typeBorder: 'var(--ink-15)',
    topic: 'FUNDRAISING', topicLabel: 'FUNDRAISING', topicColor: 'var(--amber)', topicBg: 'rgba(217,119,6,.08)', topicBorder: 'var(--amber)',
    title: 'How European VCs evaluate B2B SaaS at Series A — the 7 non-negotiables',
    description: 'Inside the scoring frameworks used by 12 leading European VCs. What moves you from "interesting" to "term sheet" faster than any deck redesign.',
    readTimeMin: 15, ageLabel: '2w ago', source: 'WinGroX Research',
    whatThisMeansForYou: 'Based on your stage and sector, 3 of your 42 matched investors use this exact framework. Knowing their scoring weights before pitching is a significant edge.',
  },
  {
    slug: 'benelux-market-entry-2026',
    type: 'MARKET_INTEL', typeLabel: 'MARKET INTEL', typeColor: 'var(--slate)', typeBg: 'var(--slate-pale)', typeBorder: 'var(--slate)',
    topic: 'EXPANSION', topicLabel: 'GLOBAL EXPANSION', topicColor: 'var(--teal)', topicBg: 'var(--teal-pale)', topicBorder: 'var(--teal)',
    title: 'Benelux as a European beachhead: 2026 entry conditions',
    description: 'Why Benelux outperforms Germany as a first EU market for B2B SaaS — lower regulatory friction, English-first procurement, and the highest SME digitalisation rate in the EU.',
    readTimeMin: 10, ageLabel: '3w ago', source: 'WinGroX Research',
    whatThisMeansForYou: 'Your expansion score for Benelux is your #2 market fit. This intel directly supports the entry path your Digital Twin recommended.',
  },
  {
    slug: 'pricing-localisation-europe',
    type: 'BENCHMARK', typeLabel: 'BENCHMARK', typeColor: 'var(--rose)', typeBg: 'rgba(220,38,38,.08)', typeBorder: 'var(--rose)',
    topic: 'GTM', topicLabel: 'GO-TO-MARKET', topicColor: 'var(--ink)', topicBg: 'var(--ink-08)', topicBorder: 'var(--ink-15)',
    title: 'SaaS pricing localisation benchmarks for European markets — 2026 edition',
    description: 'How B2B SaaS companies are structuring EUR pricing, discount bands, and payment terms across DACH, Benelux, and Nordics. 180 company dataset.',
    readTimeMin: 9, ageLabel: '1mo ago', source: 'WinGroX Research',
    whatThisMeansForYou: 'Your current USD pricing converts to an above-median EUR price point for your segment. Section 3 shows the localisation approach that reduces churn by 18% in your category.',
  },
];

@Injectable()
export class HubService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(assessmentId?: string, sessionId?: string): Promise<HubFeedResponse> {
    let assessment: any = null;
    if (assessmentId) {
      assessment = await this.prisma.expansionAssessment.findUnique({ where: { id: assessmentId } });
    }

    let savedSlugs = new Set<string>();
    if (sessionId) {
      const saves = await this.prisma.hubSave.findMany({ where: { sessionId }, select: { articleSlug: true } });
      savedSlugs = new Set(saves.map((s) => s.articleSlug));
    }

    const articles = ARTICLES.map((a) => {
      const personalised = { ...a, saved: savedSlugs.has(a.slug) };
      if (assessment) {
        personalised.whatThisMeansForYou = this.personalise(a, assessment);
      }
      return personalised;
    });

    return { articles, totalCount: articles.length, personalized: !!assessment };
  }

  async toggleSave(dto: SaveArticleDto): Promise<SaveArticleResponse> {
    const existing = await this.prisma.hubSave.findUnique({
      where: { articleSlug_sessionId: { articleSlug: dto.articleSlug, sessionId: dto.sessionId } },
    });

    if (existing) {
      await this.prisma.hubSave.delete({ where: { id: existing.id } });
      return { saved: false, articleSlug: dto.articleSlug };
    }

    await this.prisma.hubSave.create({
      data: { articleSlug: dto.articleSlug, sessionId: dto.sessionId, email: dto.email ?? null },
    });
    return { saved: true, articleSlug: dto.articleSlug };
  }

  async getSaves(sessionId: string): Promise<HubSavesResponse> {
    const saves = await this.prisma.hubSave.findMany({ where: { sessionId }, select: { articleSlug: true } });
    return { savedSlugs: saves.map((s) => s.articleSlug) };
  }

  private personalise(article: HubArticle, a: any): string {
    const cluster = a.cluster as string;
    const topCountries: any[] = (a.topCountries as any[]) ?? [];
    const topCountry = topCountries[0]?.name ?? 'Germany';
    const market = a.marketReady as number;
    const gtm = a.gtmReady as number;
    const financial = a.financialReady as number;

    switch (article.slug) {
      case 'distribution-led-entry-germany':
        return `At the ${cluster} stage, you're ${market >= 70 ? 'ready to execute' : 'within 2–4 weeks of being ready to start'} steps 1–3 of this playbook. Your top target market is ${topCountry} — this framework applies directly. ${market >= 75 ? 'Skip the pilot qualification section; your market readiness score clears the threshold.' : 'Focus on the partner qualification checklist in Section 2 first.'}`;
      case 'dach-industrial-automation-buyers-q1-2026':
        return `Your ICP overlaps strongly with the buyer profile in Section 2. ${gtm >= 65 ? 'Your GTM readiness score indicates you\'re ready to engage these buyers now.' : 'Shore up your GTM positioning (Section 1) before outreach — your GTM score is the current blocker.'} The cybersecurity trigger in Section 4 is the fastest demand accelerator for your category.`;
      case 'cac-ltv-seed-series-a':
        return `Your top matched investors include VCs who use the cohort-layered framework on page 3. Adopting it now — before pitching — removes one of the top 3 objections they raise at first meeting. Your financial readiness score of ${financial} means your unit economics are strong enough to support this framing.`;
      case 'fundraising-narrative-european-vcs':
        return `Based on your ${cluster} stage and sector, your 42 matched investors include funds using this exact 7-point framework. Mapping your narrative to their scoring weights is the single highest-leverage pitch improvement you can make in the next 2 weeks.`;
      case 'benelux-market-entry-2026':
        return topCountries.length > 1
          ? `${topCountries[1]?.name ?? 'Benelux'} is your #2 market fit (score: ${topCountries[1]?.score ?? 78}/100). This intel directly supports that recommendation — the entry conditions described here match your profile.`
          : `This market profile aligns with your expansion readiness. The entry conditions match companies at your ${cluster} stage with your revenue band.`;
      case 'pricing-localisation-europe':
        return `Your current pricing structure will need EUR localisation for ${topCountry}. Section 3 of this benchmark shows the approach that reduces first-year churn by 18% for companies in your category — apply it before your first EU pilot.`;
      default:
        return article.whatThisMeansForYou;
    }
  }
}
