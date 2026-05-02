import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import {
  CreateLeadDTO,
  GenerateAssessmentDTO,
  ListAssessmentsDTO,
  ListCountriesDTO,
  ListLeadsDTO,
  ListSignalsDTO,
} from './expansion.dto';
import {
  EXPANSION_COUNTRIES_SEED,
  EXPANSION_SIGNALS_SEED,
  ExpansionCountrySeed,
  IndustryFit,
  IndustryKey,
} from './expansion.seed';

type CountryRow = {
  code: string;
  name: string;
  flag: string;
  region: string | null;
  currency: string;
  language: string;
  population: Prisma.Decimal;
  gdpUsdBn: Prisma.Decimal;
  gdpGrowthPct: Prisma.Decimal;
  tradeScore: number;
  demandScore: number;
  easeScore: number;
  riskBand: string;
  regulatoryBand: string;
  costBand: string;
  tariffBand: string;
  ceta: boolean;
  industryFit: unknown;
};

type CountryFacts = {
  code: string;
  name: string;
  flag: string;
  region: string | null;
  currency: string;
  language: string;
  population: number;
  gdpUsdBn: number;
  gdpGrowthPct: number;
  tradeScore: number;
  demandScore: number;
  easeScore: number;
  riskBand: string;
  regulatoryBand: string;
  costBand: string;
  tariffBand: string;
  ceta: boolean;
  industryFit: IndustryFit;
};

type ScoredCountry = CountryFacts & {
  fitMultiplier: number;
  score: number;
};

type IntelligenceMove = { title: string; desc: string; when: string };
type IntelligenceRisk = { tag: string; text: string; severity: 'rose' | 'amber' | 'sage' };

const CLAMP = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const REVENUE_BANDS: Record<string, [number, number, number]> = {
  'Pre-revenue': [0.5, 1.2, 2.5],
  '< $500K': [1, 2.5, 5],
  '$500K – $2M': [3, 7.5, 14],
  '$2M – $10M': [10, 22, 45],
  '$10M – $50M': [30, 65, 120],
  '$50M+': [80, 180, 350],
};

const REVENUE_STAGE_SCORE: Record<string, number> = {
  'Pre-revenue': 55,
  '< $500K': 60,
  '$500K – $2M': 68,
  '$2M – $10M': 76,
  '$10M – $50M': 84,
  '$50M+': 90,
};

const TIMEFRAME_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };

@Injectable()
export class ExpansionService implements OnModuleInit {
  private readonly logger = new Logger(ExpansionService.name);

  constructor(private readonly prisma: PrismaService) {}

  // -----------------------------------------------------------
  // Bootstrap: idempotent seed of reference markets + signals.
  // -----------------------------------------------------------
  async onModuleInit(): Promise<void> {
    try {
      await this.seedReferenceData();
    } catch (err) {
      // Don't crash app boot if migrations haven't run yet.
      this.logger.warn(`Expansion reference seed skipped: ${(err as Error).message}`);
    }
  }

  private async seedReferenceData(): Promise<void> {
    const [countryCount, signalCount] = await Promise.all([
      this.prisma.expansionCountry.count(),
      this.prisma.expansionSignal.count(),
    ]);

    if (countryCount === 0) {
      await this.prisma.$transaction(
        EXPANSION_COUNTRIES_SEED.map((c) =>
          this.prisma.expansionCountry.create({
            data: {
              code: c.code,
              name: c.name,
              flag: c.flag,
              region: c.region,
              currency: c.currency,
              language: c.language,
              population: new Prisma.Decimal(c.population),
              gdpUsdBn: new Prisma.Decimal(c.gdpUsdBn),
              gdpGrowthPct: new Prisma.Decimal(c.gdpGrowthPct),
              tradeScore: c.tradeScore,
              demandScore: c.demandScore,
              easeScore: c.easeScore,
              riskBand: c.riskBand,
              regulatoryBand: c.regulatoryBand,
              costBand: c.costBand,
              tariffBand: c.tariffBand,
              ceta: c.ceta,
              industryFit: c.industryFit as unknown as Prisma.InputJsonValue,
            },
          }),
        ),
      );
      this.logger.log(`Seeded ${EXPANSION_COUNTRIES_SEED.length} expansion countries`);
    }

    if (signalCount === 0) {
      const now = Date.now();
      await this.prisma.$transaction(
        EXPANSION_SIGNALS_SEED.map((s) =>
          this.prisma.expansionSignal.create({
            data: {
              externalId: s.externalId,
              apiLayer: s.apiLayer,
              apiLabel: s.apiLabel,
              industry: s.industry,
              geo: s.geo,
              priority: s.priority,
              signalType: s.signalType,
              ageDays: s.ageDays,
              signal: s.signal,
              impact: s.impact,
              action: s.action,
              source: s.source,
              publishedAt: new Date(now - s.ageDays * 86_400_000),
            },
          }),
        ),
      );
      this.logger.log(`Seeded ${EXPANSION_SIGNALS_SEED.length} expansion signals`);
    }
  }

  // -----------------------------------------------------------
  // Public reads
  // -----------------------------------------------------------
  async listCountries(input: ListCountriesDTO) {
    const where: Prisma.ExpansionCountryWhereInput = {};
    if (input.region) {
      where.region = input.region;
    }

    const items = await this.prisma.expansionCountry.findMany({
      where,
      orderBy: [{ tradeScore: 'desc' }, { name: 'asc' }],
    });

    return {
      total: items.length,
      items: items.map((c) => ({
        code: c.code,
        name: c.name,
        flag: c.flag,
        region: c.region,
        currency: c.currency,
        language: c.language,
        population: Number(c.population),
        gdpUsdBn: Number(c.gdpUsdBn),
        gdpGrowthPct: Number(c.gdpGrowthPct),
        tradeScore: c.tradeScore,
        demandScore: c.demandScore,
        easeScore: c.easeScore,
        riskBand: c.riskBand,
        regulatoryBand: c.regulatoryBand,
        costBand: c.costBand,
        tariffBand: c.tariffBand,
        ceta: c.ceta,
        industryFit: c.industryFit,
      })),
    };
  }

  async listSignals(input: ListSignalsDTO) {
    const days = TIMEFRAME_DAYS[input.timeframe];
    const since = new Date(Date.now() - days * 86_400_000);

    const where: Prisma.ExpansionSignalWhereInput = {
      publishedAt: { gte: since },
    };
    if (input.apiLayer && input.apiLayer !== 'all') where.apiLayer = input.apiLayer;
    if (input.industry && input.industry !== 'all') where.industry = input.industry;
    if (input.geo && input.geo !== 'all') where.geo = input.geo;
    if (input.priority) where.priority = input.priority;
    if (input.signalType) where.signalType = input.signalType;

    const orderBy: Prisma.ExpansionSignalOrderByWithRelationInput[] =
      input.sort === 'recent'
        ? [{ publishedAt: 'desc' }]
        : input.sort === 'impact'
          ? [{ apiLayer: 'asc' }, { publishedAt: 'desc' }]
          : [{ publishedAt: 'desc' }];

    const [total, urgentCount, items] = await Promise.all([
      this.prisma.expansionSignal.count({ where }),
      this.prisma.expansionSignal.count({ where: { ...where, priority: 'urgent' } }),
      this.prisma.expansionSignal.findMany({
        where,
        orderBy,
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
    ]);

    // Apply priority sort in memory (rank order: urgent > high > monitor)
    const ranked =
      input.sort === 'priority'
        ? [...items].sort(
            (a, b) =>
              this.priorityRank(a.priority) - this.priorityRank(b.priority) ||
              b.publishedAt.getTime() - a.publishedAt.getTime(),
          )
        : items;

    return {
      page: input.page,
      limit: input.limit,
      total,
      hasMore: input.page * input.limit < total,
      urgentCount,
      lastUpdated: new Date().toISOString(),
      items: ranked.map((s) => ({
        id: s.id,
        externalId: s.externalId,
        apiLayer: s.apiLayer,
        apiLabel: s.apiLabel,
        industry: s.industry,
        geo: s.geo,
        priority: s.priority,
        signalType: s.signalType,
        ageDays: s.ageDays,
        signal: s.signal,
        impact: s.impact,
        action: s.action,
        source: s.source,
        publishedAt: s.publishedAt.toISOString(),
      })),
    };
  }

  // -----------------------------------------------------------
  // Assessment generation (deterministic mirror of UI logic)
  // -----------------------------------------------------------
  async generateAssessment(input: GenerateAssessmentDTO, ipAddress?: string) {
    const allRows = await this.prisma.$queryRaw<CountryRow[]>`
      SELECT "code","name","flag","region","currency","language","population","gdpUsdBn","gdpGrowthPct",
             "tradeScore","demandScore","easeScore","riskBand","regulatoryBand","costBand","tariffBand","ceta","industryFit"
      FROM "expansion_countries"
    `;

    if (!allRows.length) {
      throw new NotFoundException('Expansion country reference data is not seeded');
    }

    const allCountries = allRows.map((row) => this.toCountryFacts(row));
    const byCode = new Map(allCountries.map((c) => [c.code, c]));

    const requestedGeos = input.targetGeos.length
      ? input.targetGeos.map((g) => g.toUpperCase()).filter((g) => byCode.has(g))
      : [];

    const universe = requestedGeos.length
      ? requestedGeos.map((g) => byCode.get(g)!).filter(Boolean)
      : allCountries;

    const scored: ScoredCountry[] = universe
      .map((c) => this.scoreCountry(c, input.industry, input.goal))
      .sort((a, b) => b.score - a.score);

    if (scored.length < 3) {
      const filler = allCountries
        .filter((c) => !scored.find((s) => s.code === c.code))
        .map((c) => this.scoreCountry(c, input.industry, input.goal))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3 - scored.length);
      scored.push(...filler);
    }

    const top3 = scored.slice(0, 3);
    const top = top3[0];

    const stageScore = REVENUE_STAGE_SCORE[input.revenueBand] ?? 70;
    const readinessScore = Math.round(top.score * 0.5 + stageScore * 0.35 + 72 * 0.15);
    const marketReady = Math.min(96, top.score);
    const financialReady = Math.min(96, stageScore + 4);
    const gtmReady = Math.min(96, Math.round((marketReady + financialReady) / 2));
    const cluster =
      readinessScore >= 80 ? 'Scale-Ready'
        : readinessScore >= 65 ? 'Expansion-Ready'
          : readinessScore >= 50 ? 'Preparation-Stage'
            : 'Foundation-Stage';

    const band = REVENUE_BANDS[input.revenueBand] ?? [3, 7.5, 14];
    const fit = top.fitMultiplier;
    const revenueLow = +(band[0] * fit).toFixed(2);
    const revenueBase = +(band[1] * fit).toFixed(2);
    const revenueHigh = +(band[2] * fit).toFixed(2);

    // Entry model economics (mirrors the Scale Navigator simulator)
    const MODEL_MULT:    Record<string, number> = { distributor: 0.6, direct: 1.4, jv: 1.0, licensing: 0.4 };
    const TIME_TO_DEAL:  Record<string, number> = { distributor: 4,   direct: 10,  jv: 7,   licensing: 3   };
    const entryModelKey   = input.entryModel ?? 'distributor';
    const capitalK        = input.entryCapitalUsdK ?? 150;
    const modelMult       = MODEL_MULT[entryModelKey] ?? 0.6;
    const timeToDealMonths = TIME_TO_DEAL[entryModelKey] ?? 4;
    const mktMult         = top.demandScore / 80;
    const rampY1K         = capitalK * modelMult * 0.8 * mktMult;
    const paybackMonths   = rampY1K > 0 ? Math.min(99, Math.round(capitalK * 12 / (rampY1K / 12))) : 99;
    const trajectory: number[] = Array.from({ length: 25 }, (_, m) => {
      if (m < timeToDealMonths) return 0;
      return +(((rampY1K / 12) * Math.pow(1.08, m - timeToDealMonths)).toFixed(1));
    });

    const risks = this.buildRisks(top);
    const moves = this.buildMoves(top, input);

    const topCountriesPayload = top3.map((c) => ({
      code: c.code,
      name: c.name,
      flag: c.flag,
      score: c.score,
      gdpUsdBn: c.gdpUsdBn,
      gdpGrowthPct: c.gdpGrowthPct,
      easeScore: c.easeScore,
      riskBand: c.riskBand,
      tariffBand: c.tariffBand,
      currency: c.currency,
      fitMultiplier: c.fitMultiplier,
      why: this.whyCountry(c, input.industry, c.code === top.code),
    }));

    const headline = `You're ${cluster}. Start with ${top.name}.`;
    const subhead =
      `Based on ${input.industry} fundamentals plus your profile, we recommend entering ${top.name} ` +
      `within 6 months to ${this.goalNarrative(input.goal)}. Expected first-deal timeline: 4–7 months.`;

    const report = {
      generatedAt: new Date().toISOString(),
      headline,
      subhead,
      cluster,
      readinessScore,
      marketReady,
      financialReady,
      gtmReady,
      revenueProjectionUsdM: { low: revenueLow, base: revenueBase, high: revenueHigh },
      topCountries: topCountriesPayload,
      risks,
      moves,
      entryModel: entryModelKey,
      trajectory,
      timeToDealMonths,
      paybackMonths,
      input: {
        companyName: input.companyName,
        hqCountry: input.hqCountry,
        industry: input.industry,
        revenueBand: input.revenueBand,
        businessModel: input.businessModel,
        goal: input.goal,
        targetGeos: requestedGeos,
        entryModel: entryModelKey,
        entryCapitalUsdK: capitalK,
      },
    };

    const created = await this.prisma.expansionAssessment.create({
      data: {
        email: input.email?.toLowerCase(),
        companyName: input.companyName,
        hqCountry: input.hqCountry,
        industry: input.industry,
        revenueBand: input.revenueBand,
        businessModel: input.businessModel,
        goal: input.goal,
        targetGeos: requestedGeos,
        readinessScore,
        marketReady,
        financialReady,
        gtmReady,
        cluster,
        topCountries: topCountriesPayload as unknown as Prisma.InputJsonValue,
        revenueLowUsdM: new Prisma.Decimal(revenueLow),
        revenueBaseUsdM: new Prisma.Decimal(revenueBase),
        revenueHighUsdM: new Prisma.Decimal(revenueHigh),
        risks: risks as unknown as Prisma.InputJsonValue,
        moves: moves as unknown as Prisma.InputJsonValue,
        report: report as unknown as Prisma.InputJsonValue,
        entryModel: entryModelKey,
        entryCapitalUsdK: capitalK,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
        ipAddress,
      },
      select: { id: true, createdAt: true },
    });

    await this.writeAudit('EXPANSION_ASSESSMENT_CREATED', created.id, {
      industry: input.industry,
      cluster,
      readinessScore,
      hasEmail: !!input.email,
    });

    return {
      assessmentId: created.id,
      createdAt: created.createdAt.toISOString(),
      ...report,
      entryModel: entryModelKey,
      trajectory,
      timeToDealMonths,
      paybackMonths,
    };
  }

  // -----------------------------------------------------------
  // Lead capture (modal: sample / strategy call / playbook)
  // -----------------------------------------------------------
  async createLead(input: CreateLeadDTO, ipAddress?: string) {
    const created = await this.prisma.expansionLead.create({
      data: {
        kind: input.kind,
        name: input.name,
        email: input.email.toLowerCase(),
        company: input.company,
        assessmentId: input.assessmentId,
        notes: input.notes,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
        ipAddress,
      },
      select: { id: true, kind: true, status: true, createdAt: true },
    });

    await this.writeAudit('EXPANSION_LEAD_CREATED', created.id, {
      kind: input.kind,
      email: input.email.toLowerCase(),
    });

    return created;
  }

  // -----------------------------------------------------------
  // Admin lists
  // -----------------------------------------------------------
  async listAssessments(input: ListAssessmentsDTO) {
    const where: Prisma.ExpansionAssessmentWhereInput = {};
    if (input.industry) where.industry = input.industry;
    if (input.email) where.email = input.email.toLowerCase();

    const [total, items] = await Promise.all([
      this.prisma.expansionAssessment.count({ where }),
      this.prisma.expansionAssessment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
        select: {
          id: true,
          email: true,
          companyName: true,
          industry: true,
          revenueBand: true,
          goal: true,
          readinessScore: true,
          cluster: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      page: input.page,
      limit: input.limit,
      total,
      hasMore: input.page * input.limit < total,
      items,
    };
  }

  async listLeads(input: ListLeadsDTO) {
    const where: Prisma.ExpansionLeadWhereInput = {};
    if (input.kind) where.kind = input.kind;
    if (input.status) where.status = input.status;

    const [total, items] = await Promise.all([
      this.prisma.expansionLead.count({ where }),
      this.prisma.expansionLead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
    ]);

    return {
      page: input.page,
      limit: input.limit,
      total,
      hasMore: input.page * input.limit < total,
      items,
    };
  }

  // -----------------------------------------------------------
  // Internals
  // -----------------------------------------------------------
  private toCountryFacts(row: CountryRow): CountryFacts {
    return {
      code: row.code,
      name: row.name,
      flag: row.flag,
      region: row.region,
      currency: row.currency,
      language: row.language,
      population: Number(row.population),
      gdpUsdBn: Number(row.gdpUsdBn),
      gdpGrowthPct: Number(row.gdpGrowthPct),
      tradeScore: row.tradeScore,
      demandScore: row.demandScore,
      easeScore: row.easeScore,
      riskBand: row.riskBand,
      regulatoryBand: row.regulatoryBand,
      costBand: row.costBand,
      tariffBand: row.tariffBand,
      ceta: row.ceta,
      industryFit: (row.industryFit as IndustryFit) ?? this.defaultFit(),
    };
  }

  private defaultFit(): IndustryFit {
    return { FMCG: 1, SaaS: 1, Healthcare: 1, Fintech: 1, Industrial: 1, Climate: 1, Consumer: 1, Agri: 1, EV: 1 };
  }

  private scoreCountry(c: CountryFacts, industry: IndustryKey, goal: string): ScoredCountry {
    const fit = c.industryFit?.[industry] ?? 1;
    const gdpScore = Math.min(100, c.gdpGrowthPct * 12 + 50);
    const composite =
      c.demandScore * 0.35 + c.tradeScore * 0.25 + c.easeScore * 0.20 + gdpScore * 0.20;

    let final = Math.round(composite * fit);
    const g = goal.toLowerCase();
    if (g.includes('distributor') && c.easeScore >= 75) final += 3;
    if (g.includes('capital') && ['US', 'UK', 'SG'].includes(c.code)) final += 4;
    if (g.includes('revenue') && c.demandScore >= 80) final += 2;

    return { ...c, fitMultiplier: fit, score: CLAMP(final, 45, 99) };
  }

  private whyCountry(c: ScoredCountry, industry: IndustryKey, isTop: boolean): string {
    if (isTop) {
      const ease = c.easeScore >= 80 ? 'excellent' : 'good';
      return `Strong ${industry} demand signals · ${c.gdpGrowthPct}% GDP growth · ${c.tariffBand} tariffs · ${ease} ease of entry.`;
    }
    return `Stable market · ${c.riskBand.toLowerCase()} risk · ${c.regulatoryBand.toLowerCase()} regulation · secondary priority.`;
  }

  private goalNarrative(goal: string): string {
    const map: Record<string, string> = {
      'Revenue growth': 'prioritise revenue velocity',
      'Find distributors': 'lead with distributor partnerships',
      'Raise capital': 'align with fundraise-ready markets',
      'De-risk domestic': 'diversify geo concentration',
      'IPO / M&A prep': 'build multi-market credibility',
    };
    return map[goal] ?? 'prioritise revenue velocity';
  }

  private buildRisks(top: ScoredCountry): IntelligenceRisk[] {
    const regHigh = top.regulatoryBand === 'High';
    return [
      {
        tag: 'REG',
        severity: regHigh ? 'rose' : 'amber',
        text: `Local entity formation takes ${regHigh ? '3–6 months' : '4–8 weeks'} — plan capital lock-up.`,
      },
      {
        tag: 'FX',
        severity: 'amber',
        text: `Currency exposure in ${top.currency} — hedge first $500K+ revenue flows.`,
      },
      {
        tag: 'COMP',
        severity: top.fitMultiplier > 1.2 ? 'amber' : 'rose',
        text: `${top.fitMultiplier > 1.2 ? 'High' : 'Moderate'} local competition — clear differentiation required.`,
      },
    ];
  }

  private buildMoves(top: ScoredCountry, input: GenerateAssessmentDTO): IntelligenceMove[] {
    const g = input.goal.toLowerCase();
    if (g.includes('revenue')) {
      return [
        {
          title: `Validate demand with 10 discovery calls in ${top.name}`,
          desc: `Before committing entry capital, test value prop with 10 qualified buyers in ${top.name}. Focus on ${input.industry.toLowerCase()} decision-makers at mid-market firms. Document pricing willingness, objections, and localisation asks.`,
          when: 'Next 30 days · ~$3K cost',
        },
        {
          title: `Shortlist 3 distributor candidates in ${top.name}`,
          desc: `For ${input.industry} entering ${top.name}, distributor-led model reduces entry capital by ~60% and cuts time-to-first-deal by 4–6 months. Target partners with €10M+ revenue and complementary portfolio.`,
          when: 'Days 30–75',
        },
        {
          title: 'Localise pricing and commercial terms',
          desc: `Benchmark ${top.name} local pricing — likely ${this.priceDelta(top.costBand)} your home market. Build 2-tier pricing: penetration + full. Offer ${top.currency} invoicing and 90-day NET terms for anchor accounts.`,
          when: 'Days 60–90',
        },
      ];
    }
    if (g.includes('distributor')) {
      return [
        { title: `Build a distributor scorecard for ${top.name}`,
          desc: 'Define must-haves: existing customer base (500+), complementary portfolio, financial health (3+ years profitable), geographic coverage, and digital sales capability. Weight each 1–5.',
          when: 'Week 1' },
        { title: `Outreach to 15 qualified ${top.name} distributors`,
          desc: 'Use warm intros from trade bodies and sectoral associations. Lead with joint business plan, not product pitch. Include revenue projection for their territory.',
          when: 'Weeks 2–6' },
        { title: 'Negotiate term sheet with top-2 candidates',
          desc: 'Standard terms: 20–35% distributor margin, 18-month minimum, territory exclusivity, annual minimum purchases, co-marketing budget. Protect: pricing floor, data ownership, termination clauses.',
          when: 'Weeks 6–12' },
      ];
    }
    if (g.includes('capital')) {
      return [
        { title: `Target VCs with ${top.name} portfolio experience`,
          desc: `Investors with prior ${input.industry} bets in ${top.name} will understand your thesis 3× faster. Prepare market sizing ($${(top.gdpUsdBn / 1000).toFixed(1)}T TAM), competitive mapping, your wedge, and 24-month revenue projection.`,
          when: 'Month 1' },
        { title: 'Build expansion-ready data room',
          desc: 'Add country-specific cohort data, unit economics by geography, burn multiple by market, and case studies. Investors funding geo-expansion look for capital efficiency per market.',
          when: 'Month 1–2' },
        { title: 'Anchor term sheet before full round',
          desc: `Land one tier-1 investor first — they validate thesis and pull in co-investors. Target raise sizing: 24 months runway through ${top.name} entry plus one more market.`,
          when: 'Month 2–4' },
      ];
    }
    return [
      { title: `Run ${top.name} market validation`,
        desc: 'Pre-entry validation: 10–15 customer discovery calls, competitor deep-dive, regulatory scan. Total cost about $5K, saves 6+ months of wasted entry capital.',
        when: 'Next 30 days' },
      { title: 'Choose entry model + partner shortlist',
        desc: `For your profile (${input.revenueBand} revenue, ${input.industry}), distributor-led entry is recommended. Shortlist 3–5 candidates with strong ${top.name} networks.`,
        when: 'Days 30–60' },
      { title: 'Build 90-day execution dashboard',
        desc: 'Define monthly revenue targets, partner activation KPIs, pipeline generation, first-deal timeline. Review weekly with your expansion lead.',
        when: 'Days 60–90' },
    ];
  }

  private priceDelta(costBand: string): string {
    if (costBand === 'Low') return '20–30% below';
    if (costBand === 'High') return '10–20% above';
    return 'roughly at par with';
  }

  private priorityRank(p: string): number {
    return p === 'urgent' ? 0 : p === 'high' ? 1 : 2;
  }

  private async writeAudit(
    action: string,
    resourceId: string | null,
    changes: Record<string, unknown>,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action,
        resource: 'EXPANSION',
        resourceId: resourceId ?? undefined,
        changes: changes as unknown as Prisma.InputJsonValue,
      },
    });
  }
}

// Re-export to silence the unused-import lint while keeping types narrow.
export type { ExpansionCountrySeed };
