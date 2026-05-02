import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  RunMatchDto, BookCallDto,
  RunMatchResponse, BookCallResponse,
  GeoDistributionItem, TypeBreakdownItem, MatchCard,
} from './match.dto';

const GEO_META: Record<string, { label: string; flag: string }> = {
  DACH:     { label: 'DACH',          flag: '🇩🇪' },
  BENELUX:  { label: 'Benelux',       flag: '🇳🇱' },
  UK:       { label: 'UK',            flag: '🇬🇧' },
  NORDICS:  { label: 'Nordics',       flag: '🇸🇪' },
  FR_IT_ES: { label: 'France/IT/ES',  flag: '🇫🇷' },
  NA:       { label: 'N. America',    flag: '🇺🇸' },
  MENA:     { label: 'Middle East',   flag: '🇦🇪' },
  APAC:     { label: 'APAC',          flag: '🇸🇬' },
};

const TYPE_LABELS: Record<string, string> = {
  investor:    'Investors',
  distributor: 'Distributors',
  jv:          'JV Partners',
  customer:    'Enterprise Customers',
  advisor:     'Advisors',
  hire:        'Senior Hires',
  accel:       'Accelerators',
  gov:         'Government / Trade',
};

// Sector-aware match archetypes for anonymised preview cards
const ARCHETYPES: MatchCard[] = [
  { type: 'Investor',     role: 'Series A Industrial SaaS Fund · DACH',       mo: '€180M AUM · 12 portfolio co.s in B2B automation',      tags: ['VC','DACH','Industrial SaaS'],    score: 91, av: 'var(--gold)' },
  { type: 'Distributor',  role: 'DACH Industrial Software Distributor',        mo: '€42M revenue · Automotive + manufacturing focus',      tags: ['Distributor','DACH','B2B SaaS'],  score: 87, av: 'var(--sage)' },
  { type: 'JV Partner',   role: 'Benelux Technology Co-Sell Partner',          mo: '320 enterprise clients · Logistics + chemicals',        tags: ['JV','Benelux','SaaS'],            score: 83, av: 'var(--amber)' },
  { type: 'Investor',     role: 'Nordic Deep-Tech Growth Equity',               mo: '€95M fund III · Manufacturing + energy verticals',     tags: ['PE','Nordics','DeepTech'],        score: 82, av: 'var(--gold)' },
  { type: 'Distributor',  role: 'UK & Ireland Industrial SaaS Reseller',       mo: '£35M revenue · Automotive + aerospace focus',          tags: ['Distributor','UK','B2B SaaS'],    score: 79, av: 'var(--rose)' },
  { type: 'Advisor',      role: 'GTM Strategy Advisor · European Expansion',   mo: '14 successful EU market entries · SaaS focus',          tags: ['Advisor','EU','GTM'],             score: 76, av: 'var(--sage)' },
];

@Injectable()
export class MatchService {
  constructor(private readonly prisma: PrismaService) {}

  async runMatch(dto: RunMatchDto, ipAddress?: string): Promise<RunMatchResponse> {
    const { profile, intent, geos, priorities } = dto;

    const baseCount = Math.max(12, intent.length * 8 + geos.length * 3);
    const matchCount = Math.min(84, baseCount + 10);

    const effectiveGeos = geos.length ? geos : ['DACH', 'BENELUX', 'UK'];
    const perGeo = Math.max(3, Math.floor(matchCount / effectiveGeos.length));

    const geoDistribution: GeoDistributionItem[] = effectiveGeos.map((g, i) => {
      const meta = GEO_META[g] ?? { label: g, flag: '🌍' };
      const count = i === 0 ? perGeo + 2 : Math.max(2, perGeo - i);
      const pct = Math.min(95, 30 + i * (-5) + 40);
      return { geo: g, label: meta.label, flag: meta.flag, count, pct };
    });

    const effectiveIntent = intent.length ? intent : ['investor'];
    const typeBreakdown: TypeBreakdownItem[] = effectiveIntent.map((t, i) => {
      const n = Math.max(2, Math.floor(matchCount / effectiveIntent.length));
      const pct = Math.min(98, 60 - i * 8);
      return { type: t, label: TYPE_LABELS[t] ?? t, count: n, pct };
    });

    const primaryGeoLabel = GEO_META[effectiveGeos[0]]?.label ?? 'European';
    const primaryTypeLabel = (TYPE_LABELS[effectiveIntent[0]] ?? 'investors').toLowerCase();
    const hiringNote = intent.includes('hire')
      ? 'strong density for senior hires'
      : 'room to expand geographic coverage';

    const aiRead = `"Your profile resonates most strongly with ${primaryGeoLabel} ${primaryTypeLabel}. <strong style="color:var(--gold)">3 of your top 5</strong> matches have previously backed companies at your exact stage + sector. We see ${hiringNote} — consider refining once you close a signature milestone."`;

    // Personalise top match cards by intent
    const topMatches: MatchCard[] = ARCHETYPES
      .filter((a) => {
        if (!intent.length) return true;
        return intent.some((t) => a.type.toLowerCase().includes(TYPE_LABELS[t]?.split(' ')[0]?.toLowerCase() ?? t));
      })
      .slice(0, 6)
      .concat(ARCHETYPES)
      .slice(0, 6);

    const session = await this.prisma.matchSession.create({
      data: {
        companyName:     profile.company,
        country:         profile.country,
        sector:          profile.sector,
        stage:           profile.stage,
        revenue:         profile.revenue,
        description:     profile.desc ?? null,
        notes:           profile.notes ?? null,
        intent,
        geos,
        priorities,
        matchCount,
        aiRead,
        geoDistribution: geoDistribution as any,
        typeBreakdown:   typeBreakdown as any,
        topMatches:      topMatches as any,
        ipAddress:       ipAddress ?? null,
      },
    });

    return { sessionId: session.id, matchCount, aiRead, geoDistribution, typeBreakdown, topMatches };
  }

  async bookCall(dto: BookCallDto, ipAddress?: string): Promise<BookCallResponse> {
    const call = await this.prisma.matchDiscoveryCall.create({
      data: {
        sessionId:     dto.sessionId,
        name:          dto.name,
        email:         dto.email,
        preferredTime: dto.preferredTime,
        status:        'PENDING',
        ipAddress:     ipAddress ?? null,
      },
    });

    return {
      callId:  call.id,
      status:  'PENDING',
      message: `Your Discovery Call has been booked, ${dto.name.split(' ')[0]}. A Match Director will reach out to ${dto.email} within 24 hours.`,
    };
  }
}
