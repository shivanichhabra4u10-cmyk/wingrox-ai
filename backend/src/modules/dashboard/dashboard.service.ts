import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { DashboardSummaryResponse, ReadinessDimension, FeedItem } from './dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(assessmentId?: string): Promise<DashboardSummaryResponse> {
    if (assessmentId) {
      const assessment = await this.prisma.expansionAssessment.findUnique({
        where: { id: assessmentId },
      });
      if (assessment) return this.buildFromAssessment(assessment);
    }
    return this.defaultSummary();
  }

  private buildFromAssessment(a: any): DashboardSummaryResponse {
    const market = a.marketReady as number;
    const financial = a.financialReady as number;
    const gtm = a.gtmReady as number;
    const overall = a.readinessScore as number;

    const dims: ReadinessDimension[] = [
      { name: 'Demand',      score: market,                             color: this.dimColor(market) },
      { name: 'Strategy',    score: gtm,                                color: this.dimColor(gtm) },
      { name: 'Competition', score: Math.round(market * 0.9),           color: this.dimColor(Math.round(market * 0.9)) },
      { name: 'Economics',   score: financial,                          color: this.dimColor(financial) },
      { name: 'Customer',    score: Math.round((market + gtm) / 2),     color: this.dimColor(Math.round((market + gtm) / 2)) },
      { name: 'Execution',   score: Math.round((gtm + financial) / 2),  color: this.dimColor(Math.round((gtm + financial) / 2)) },
    ];

    const lowestDim = dims.reduce((x, y) => (x.score < y.score ? x : y));
    const highestGapDim = dims.reduce((x, y) => (100 - x.score > 100 - y.score ? x : y));

    const topCountries: any[] = (a.topCountries as any[]) ?? [];
    const topCountry = topCountries[0]?.name ?? 'Germany';

    const revenueBase = Number(a.revenueBaseUsdM ?? 0);
    const pipelineDisplay =
      revenueBase < 1 ? `€${Math.round(revenueBase * 1000)}K` : `€${revenueBase.toFixed(1)}M`;

    const cluster = a.cluster as string;
    const headline = `You're at the <em style="color:var(--gold);font-style:italic">${cluster}</em> stage.`;
    const summary = `Your growth profile shows strongest potential in ${topCountry}. Focus on ${lowestDim.name.toLowerCase()} to unlock your next stage — addressing this single gap moves you to the next readiness cluster.`;

    const risks: any[] = (a.risks as any[]) ?? [];
    const moves: any[] = (a.moves as any[]) ?? [];

    const feed: FeedItem[] = [
      moves[0]
        ? { type: 'insight', title: moves[0].title, description: moves[0].desc, time: moves[0].when, source: 'AI Advisor' }
        : null,
      topCountries[1]
        ? {
            type: 'milestone',
            title: `You're expansion-ready for ${topCountries[1].name}`,
            description: `${topCountries[1].name} is your #2 market fit (score: ${topCountries[1].score}/100). Entry via ${a.entryModel ?? 'distributor'} is recommended.`,
            time: 'Just now',
            source: 'Expansion Engine',
          }
        : null,
      risks[0]
        ? { type: 'alert', title: `Risk: ${risks[0].tag}`, description: risks[0].text, time: 'Latest assessment', source: 'Risk Radar' }
        : null,
      {
        type: 'match',
        title: '42 partner matches ready for review',
        description: `Tier-1 investors and distribution partners aligned to your profile in ${topCountry} and neighbouring markets.`,
        time: 'Updated today',
        source: 'Match Engine',
      },
    ].filter(Boolean) as FeedItem[];

    const weeklyInsight = `Your ${lowestDim.name.toLowerCase()} score of ${lowestDim.score} is your #1 growth constraint. Closing this gap by 10 points could lift your overall readiness from ${overall} to ${Math.min(overall + 7, 100)} and unlock ${topCountry} entry within the next 90 days.`;

    return {
      overallScore: overall,
      clusterStage: cluster,
      headline,
      summary,
      primaryGap: lowestDim.name,
      topLever: `${highestGapDim.name} Improvement`,
      topCountry,
      weeklyInsight,
      metrics: [
        { value: String(overall),  label: 'Twin Score',         variant: 'accent' },
        { value: cluster,          label: 'Cluster Stage',      variant: 'accent' },
        { value: '42',             label: 'Matches',            variant: 'good' },
        { value: pipelineDisplay,  label: 'Pipeline Est.' },
        { value: lowestDim.name,   label: 'Primary Constraint', variant: 'alert' },
      ],
      readiness: dims,
      feed,
    };
  }

  private dimColor(score: number): string {
    if (score < 60) return 'var(--rose)';
    if (score < 70) return 'var(--amber)';
    if (score < 80) return 'var(--gold)';
    return 'var(--sage)';
  }

  private defaultSummary(): DashboardSummaryResponse {
    return {
      overallScore: 64,
      clusterStage: 'Experimenter',
      headline: 'You\'re at the <em style="color:var(--gold);font-style:italic">Experimenter</em> stage.',
      summary: 'Your Digital Twin is capable of entering Europe — but conversion depends on how structured your next 90 days are. Focus on demand pipeline, partner readiness, and value proposition sharpening.',
      primaryGap: 'Demand Pipeline',
      topLever: 'Conversion',
      topCountry: 'Germany',
      weeklyInsight: 'Your conversion rate of 5% on 500 leads is leaving €180K/month on the table. Improving conversion by just 30% — from 5% to 6.5% — adds €54K monthly with zero new leads required. Focus here before spending more on acquisition.',
      metrics: [
        { value: '64',           label: 'Twin Score',         variant: 'accent' },
        { value: 'Experimenter', label: 'Cluster Stage',      variant: 'accent' },
        { value: '42',           label: 'Matches',            variant: 'good' },
        { value: '€180K',        label: 'Pipeline Est.' },
        { value: 'Demand',       label: 'Primary Constraint', variant: 'alert' },
      ],
      readiness: [
        { name: 'Demand',      score: 58, color: 'var(--rose)' },
        { name: 'Strategy',    score: 62, color: 'var(--amber)' },
        { name: 'Competition', score: 60, color: 'var(--amber)' },
        { name: 'Economics',   score: 66, color: 'var(--gold)' },
        { name: 'Customer',    score: 59, color: 'var(--rose)' },
        { name: 'Execution',   score: 70, color: 'var(--sage)' },
      ],
      feed: [
        { type: 'insight',   title: '3 new playbooks matched to your GTM needs',        description: '"Distribution-led entry for industrial SaaS in Germany" and 2 others just published in the Intelligence Hub.', time: '15 minutes ago', source: 'Intelligence Hub' },
        { type: 'match',     title: '7 new matches added in last 48 hours',             description: 'Including 2 Tier-1 VCs in London and 3 industrial distributors in DACH region.',                              time: '2 hours ago',    source: 'Match Engine' },
        { type: 'milestone', title: "You're now expansion-ready for Netherlands",       description: 'Your recent answers unlocked Netherlands as a viable secondary entry market (fit score: 78/100).',             time: 'Yesterday',      source: 'Expansion Engine' },
        { type: 'alert',     title: 'Risk alert: Demand pipeline below threshold',      description: 'Your demand score of 58 is the #1 blocker to first deal. Run 15 structured EU prospect calls in 30 days.',     time: 'Yesterday',      source: 'AI Advisor' },
      ],
    };
  }
}
