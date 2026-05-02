// Static reference data lifted directly from the Intelligence Engine UI
// (frontend/public/wingrox-os.html → INTEL_COUNTRIES / INTEL_INDUSTRY_FIT
// and LIVE_SIGNALS). Kept here so the backend can seed and keep parity
// without mutating the canonical UI source.

export type IndustryKey =
  | 'FMCG'
  | 'SaaS'
  | 'Healthcare'
  | 'Fintech'
  | 'Industrial'
  | 'Climate'
  | 'Consumer'
  | 'Agri'
  | 'EV';

export type IndustryFit = Record<IndustryKey, number>;

export interface ExpansionCountrySeed {
  code: string;
  name: string;
  flag: string;
  region: 'MENA' | 'APAC' | 'EU' | 'NA' | 'LATAM' | 'AFR';
  currency: string;
  language: string;
  population: number; // millions
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
}

export const EXPANSION_COUNTRIES_SEED: ExpansionCountrySeed[] = [
  {
    code: 'UAE', name: 'UAE', flag: '🇦🇪', region: 'MENA', currency: 'AED', language: 'EN/AR',
    population: 9.9, gdpUsdBn: 509, gdpGrowthPct: 3.7,
    tradeScore: 88, demandScore: 82, easeScore: 92,
    riskBand: 'Low', regulatoryBand: 'Medium', costBand: 'Medium-High', tariffBand: '0–5%', ceta: true,
    industryFit: { FMCG: 1.35, SaaS: 1.10, Healthcare: 1.25, Fintech: 1.30, Industrial: 1.15, Climate: 1.30, Consumer: 1.25, Agri: 1.20, EV: 1.25 },
  },
  {
    code: 'US', name: 'USA', flag: '🇺🇸', region: 'NA', currency: 'USD', language: 'EN',
    population: 334, gdpUsdBn: 27360, gdpGrowthPct: 2.1,
    tradeScore: 95, demandScore: 78, easeScore: 75,
    riskBand: 'Low', regulatoryBand: 'Medium-High', costBand: 'High', tariffBand: '0–8%', ceta: false,
    industryFit: { FMCG: 1.05, SaaS: 1.40, Healthcare: 1.30, Fintech: 1.35, Industrial: 1.25, Climate: 1.25, Consumer: 1.15, Agri: 0.95, EV: 1.30 },
  },
  {
    code: 'UK', name: 'UK', flag: '🇬🇧', region: 'EU', currency: 'GBP', language: 'EN',
    population: 67, gdpUsdBn: 3340, gdpGrowthPct: 0.6,
    tradeScore: 86, demandScore: 74, easeScore: 82,
    riskBand: 'Low', regulatoryBand: 'Medium', costBand: 'High', tariffBand: '2–6%', ceta: false,
    industryFit: { FMCG: 1.10, SaaS: 1.30, Healthcare: 1.20, Fintech: 1.40, Industrial: 1.10, Climate: 1.30, Consumer: 1.15, Agri: 0.95, EV: 1.25 },
  },
  {
    code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'EU', currency: 'EUR', language: 'DE/EN',
    population: 84, gdpUsdBn: 4460, gdpGrowthPct: 0.3,
    tradeScore: 82, demandScore: 70, easeScore: 68,
    riskBand: 'Low', regulatoryBand: 'High', costBand: 'High', tariffBand: '0–4%', ceta: false,
    industryFit: { FMCG: 0.95, SaaS: 1.15, Healthcare: 1.25, Fintech: 1.10, Industrial: 1.35, Climate: 1.40, Consumer: 1.05, Agri: 0.90, EV: 1.35 },
  },
  {
    code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'APAC', currency: 'SGD', language: 'EN',
    population: 6, gdpUsdBn: 497, gdpGrowthPct: 2.8,
    tradeScore: 92, demandScore: 75, easeScore: 95,
    riskBand: 'Low', regulatoryBand: 'Low', costBand: 'High', tariffBand: '0%', ceta: true,
    industryFit: { FMCG: 1.15, SaaS: 1.35, Healthcare: 1.20, Fintech: 1.35, Industrial: 1.15, Climate: 1.20, Consumer: 1.20, Agri: 1.05, EV: 1.20 },
  },
  {
    code: 'VN', name: 'Vietnam', flag: '🇻🇳', region: 'APAC', currency: 'VND', language: 'VI/EN',
    population: 100, gdpUsdBn: 429, gdpGrowthPct: 6.3,
    tradeScore: 74, demandScore: 84, easeScore: 70,
    riskBand: 'Medium', regulatoryBand: 'Medium', costBand: 'Low', tariffBand: '3–10%', ceta: true,
    industryFit: { FMCG: 1.20, SaaS: 1.22, Healthcare: 1.05, Fintech: 1.15, Industrial: 1.30, Climate: 1.15, Consumer: 1.25, Agri: 1.30, EV: 1.30 },
  },
  {
    code: 'ID', name: 'Indonesia', flag: '🇮🇩', region: 'APAC', currency: 'IDR', language: 'ID/EN',
    population: 278, gdpUsdBn: 1370, gdpGrowthPct: 5.1,
    tradeScore: 68, demandScore: 80, easeScore: 62,
    riskBand: 'Medium', regulatoryBand: 'Medium-High', costBand: 'Low', tariffBand: '5–12%', ceta: false,
    industryFit: { FMCG: 1.25, SaaS: 1.10, Healthcare: 1.10, Fintech: 1.20, Industrial: 1.20, Climate: 1.20, Consumer: 1.30, Agri: 1.25, EV: 1.25 },
  },
  {
    code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', region: 'MENA', currency: 'SAR', language: 'AR/EN',
    population: 36, gdpUsdBn: 1100, gdpGrowthPct: 4.1,
    tradeScore: 72, demandScore: 77, easeScore: 68,
    riskBand: 'Low-Medium', regulatoryBand: 'Medium', costBand: 'Medium', tariffBand: '5–12%', ceta: false,
    industryFit: { FMCG: 1.30, SaaS: 1.05, Healthcare: 1.30, Fintech: 1.25, Industrial: 1.25, Climate: 1.15, Consumer: 1.25, Agri: 1.30, EV: 1.15 },
  },
  {
    code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'APAC', currency: 'JPY', language: 'JA',
    population: 125, gdpUsdBn: 4200, gdpGrowthPct: 0.9,
    tradeScore: 80, demandScore: 62, easeScore: 58,
    riskBand: 'Low', regulatoryBand: 'High', costBand: 'High', tariffBand: '0–5%', ceta: false,
    industryFit: { FMCG: 0.85, SaaS: 1.00, Healthcare: 1.15, Fintech: 1.00, Industrial: 1.20, Climate: 1.25, Consumer: 0.95, Agri: 1.05, EV: 1.30 },
  },
  {
    code: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'LATAM', currency: 'BRL', language: 'PT',
    population: 216, gdpUsdBn: 2170, gdpGrowthPct: 2.9,
    tradeScore: 64, demandScore: 72, easeScore: 52,
    riskBand: 'Medium-High', regulatoryBand: 'High', costBand: 'Medium', tariffBand: '10–20%', ceta: false,
    industryFit: { FMCG: 1.10, SaaS: 0.95, Healthcare: 1.05, Fintech: 1.15, Industrial: 1.05, Climate: 1.10, Consumer: 1.15, Agri: 1.35, EV: 1.20 },
  },
  {
    code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'APAC', currency: 'AUD', language: 'EN',
    population: 26, gdpUsdBn: 1700, gdpGrowthPct: 1.8,
    tradeScore: 82, demandScore: 70, easeScore: 84,
    riskBand: 'Low', regulatoryBand: 'Medium', costBand: 'High', tariffBand: '0–5%', ceta: true,
    industryFit: { FMCG: 1.05, SaaS: 1.25, Healthcare: 1.20, Fintech: 1.20, Industrial: 1.10, Climate: 1.30, Consumer: 1.10, Agri: 1.15, EV: 1.15 },
  },
  {
    code: 'KE', name: 'Kenya', flag: '🇰🇪', region: 'AFR', currency: 'KES', language: 'EN/SW',
    population: 55, gdpUsdBn: 115, gdpGrowthPct: 5.2,
    tradeScore: 58, demandScore: 72, easeScore: 60,
    riskBand: 'Medium', regulatoryBand: 'Medium', costBand: 'Low', tariffBand: '5–15%', ceta: false,
    industryFit: { FMCG: 1.05, SaaS: 0.85, Healthcare: 1.00, Fintech: 1.30, Industrial: 0.95, Climate: 1.20, Consumer: 1.15, Agri: 1.30, EV: 1.00 },
  },
];

export interface ExpansionSignalSeed {
  externalId: string;
  apiLayer: 'news' | 'markets' | 'trends' | 'trade' | 'finance' | 'company' | 'talent' | 'country' | 'risk' | 'ai';
  apiLabel: string;
  industry: string; // 'global' | IndustryKey
  geo: string; // 'global' | 'MENA' | country code
  priority: 'urgent' | 'high' | 'monitor';
  signalType: 'opportunity' | 'risk' | 'regulatory' | 'demand' | 'competitive';
  ageDays: number;
  signal: string;
  impact: string;
  action: string;
  source: string;
}

export const EXPANSION_SIGNALS_SEED: ExpansionSignalSeed[] = [
  { externalId: 'S001', apiLayer: 'news', apiLabel: 'GNEWS', industry: 'FMCG', geo: 'UAE', priority: 'urgent', signalType: 'regulatory', ageDays: 2,
    signal: 'India–UAE <em>CEPA Phase 2</em> tariffs reduced 90% for processed foods.',
    impact: '<strong>Zero-duty window</strong> now open for Indian FMCG brands with 4–7 months to leverage before competitors saturate shelf space. Estimated cost-of-goods advantage: 12–18%.',
    action: 'Launch UAE GCC market entry within 90 days. Start with Dubai + Abu Dhabi. Target modern-trade chains first (Carrefour, LuLu, Union Coop).',
    source: 'GNews · Reuters · Ministry of Commerce' },
  { externalId: 'S002', apiLayer: 'news', apiLabel: 'FT', industry: 'SaaS', geo: 'UK', priority: 'high', signalType: 'opportunity', ageDays: 5,
    signal: 'UK government announces <em>£2.5B AI adoption fund</em> for SMEs.',
    impact: 'B2B SaaS providers with AI-native products can apply as approved vendors. <strong>50% subsidy</strong> on first-year subscriptions creates a 6-month customer acquisition tailwind.',
    action: 'Apply to UK.gov AI Vendor Framework. Register your SaaS by end of quarter. Pre-draft co-marketing deck for channel partners.',
    source: 'FT · UK.gov' },
  { externalId: 'S003', apiLayer: 'news', apiLabel: 'TECHCRUNCH', industry: 'Fintech', geo: 'SG', priority: 'high', signalType: 'opportunity', ageDays: 8,
    signal: 'MAS launches <em>Cross-Border Payment Sandbox</em> with 6 Asian partners.',
    impact: 'Fintech startups get regulatory fast-track + tax incentives for 24 months. Singapore-based cross-border payment companies projected to capture <strong>40% of South Asia remittance flow</strong>.',
    action: 'Incorporate Singapore entity if not already. Apply to MAS sandbox by Q2. Budget: $35K initial + regulatory costs.',
    source: 'TechCrunch · MAS' },
  { externalId: 'S004', apiLayer: 'markets', apiLabel: 'UN COMTRADE', industry: 'FMCG', geo: 'UAE', priority: 'urgent', signalType: 'demand', ageDays: 1,
    signal: 'UAE FMCG imports <em>↑22% YoY</em> — fastest acceleration in 8 years.',
    impact: 'Import gap indicates <strong>$3.8B unmet demand</strong>. Categories leading: packaged snacks (+34%), beverages (+28%), frozen foods (+19%). Indian and Southeast Asian suppliers gaining share.',
    action: 'Prioritise UAE entry within 6 months. Focus on snack & beverage categories first. Partner with established distributors (Apparel Group, Gulf Marketing Group).',
    source: 'UN Comtrade · WTO Stat' },
  { externalId: 'S005', apiLayer: 'markets', apiLabel: 'IMF', industry: 'SaaS', geo: 'VN', priority: 'high', signalType: 'opportunity', ageDays: 3,
    signal: 'Vietnam GDP forecast <em>+6.3% for 2026</em>. Digitisation spend +18% YoY.',
    impact: 'Fastest-growing SaaS market in SEA. <strong>Enterprise IT budgets up 24%</strong> as manufacturers digitise post-supply-chain-reshoring. English-speaking talent pool expanding.',
    action: 'Explore Vietnam distributor-led entry. Ho Chi Minh City + Hanoi as beachheads. Local partner recommended; direct entry premature.',
    source: 'IMF · World Bank' },
  { externalId: 'S006', apiLayer: 'markets', apiLabel: 'WORLD BANK', industry: 'Healthcare', geo: 'SA', priority: 'high', signalType: 'opportunity', ageDays: 6,
    signal: 'Saudi <em>Vision 2030 health sector</em> budget increased to $65B.',
    impact: 'Healthcare infrastructure spending up <strong>40% through 2028</strong>. Digital health, medical devices, and pharma manufacturers with local partnership models will be prioritised for public procurement.',
    action: 'Engage Saudi Investment Ministry. Explore JV with local manufacturers. NUPCO registration required for procurement.',
    source: 'World Bank · Saudi MoH' },
  { externalId: 'S007', apiLayer: 'markets', apiLabel: 'OECD', industry: 'Industrial', geo: 'DE', priority: 'monitor', signalType: 'competitive', ageDays: 14,
    signal: 'Germany industrial output <em>contracts 0.8%</em> — first time in 3 years.',
    impact: 'Slowdown in legacy mid-market firms creates <strong>acquisition windows</strong>. Valuations of mid-cap German industrial SMEs down 15–22%. Distributor relationships more willing to renegotiate.',
    action: 'Review partnership targets in DACH. Strategic hires from incumbents becoming available. Negotiate better distributor terms now.',
    source: 'OECD · Destatis' },
  { externalId: 'S008', apiLayer: 'trends', apiLabel: 'GOOGLE TRENDS', industry: 'SaaS', geo: 'VN', priority: 'high', signalType: 'demand', ageDays: 1,
    signal: 'Vietnam searches for "B2B SaaS platform" <em>↑47%</em> last 90 days.',
    impact: 'Demand index hit all-time high. Cross-validated with GitHub: Vietnamese developer activity on B2B SaaS repositories <strong>+62%</strong>. Market maturation signal — buyer education sufficient.',
    action: 'Launch Vietnam go-to-market within 2 quarters. Content marketing in Vietnamese + English. Target SMB segment first.',
    source: 'Google Trends · GitHub Trending' },
  { externalId: 'S009', apiLayer: 'trends', apiLabel: 'GOOGLE TRENDS', industry: 'EV', geo: 'DE', priority: 'high', signalType: 'demand', ageDays: 4,
    signal: 'German EV charging-station searches <em>↑89%</em> after tax incentive announcement.',
    impact: 'Private home-charger market projected at <strong>€4.2B by 2027</strong>. Incumbent incumbents supply-constrained. 6-month import window before European Commission applies quotas.',
    action: 'Explore German distributor partnerships immediately. CE certification required. Budget €120K for entry capital.',
    source: 'Google Trends · BMWK' },
  { externalId: 'S010', apiLayer: 'trends', apiLabel: 'GOOGLE TRENDS', industry: 'Climate', geo: 'US', priority: 'high', signalType: 'opportunity', ageDays: 7,
    signal: 'US carbon-accounting software searches <em>↑120% YoY</em>.',
    impact: 'SEC climate-disclosure rule drives <strong>mandatory compliance spend</strong> for 6,400+ public companies. Market expanding from $800M to projected $4B by 2027.',
    action: 'Prioritise US climate-tech GTM. Enterprise sales motion. Target CFOs and Chief Sustainability Officers. Partner with Big-4 audit firms.',
    source: 'Google Trends · SEC.gov' },
  { externalId: 'S011', apiLayer: 'trade', apiLabel: 'UN COMTRADE', industry: 'Agri', geo: 'KE', priority: 'high', signalType: 'opportunity', ageDays: 2,
    signal: 'Kenya agri-processing imports <em>+31% YoY</em>. Irrigation tech leads.',
    impact: 'East Africa agri-tech window opening. <strong>€450M unmet demand</strong> in precision irrigation, cold-chain, and crop-analytics. Government offering 5-year tax holiday for foreign manufacturers.',
    action: 'Mombasa port entry recommended. Partner with KEPSA (Kenya Private Sector Alliance). Explore Kenya as HQ for East Africa operations.',
    source: 'UN Comtrade · KEBS' },
  { externalId: 'S012', apiLayer: 'trade', apiLabel: 'UN COMTRADE', industry: 'Consumer', geo: 'ID', priority: 'high', signalType: 'demand', ageDays: 5,
    signal: 'Indonesia consumer electronics imports <em>+28% in 2 quarters</em>.',
    impact: 'Post-election policy clarity + middle-class expansion drove <strong>$6.3B in new consumer electronics demand</strong>. Premium segment growing fastest — 34% of total.',
    action: 'Premium D2C brands: consider Indonesia entry. Jakarta + Surabaya first. Local e-commerce partnerships (Tokopedia, Shopee) over bricks-and-mortar.',
    source: 'UN Comtrade · BPS Indonesia' },
  { externalId: 'S013', apiLayer: 'finance', apiLabel: 'ALPHA VANTAGE', industry: 'Fintech', geo: 'US', priority: 'high', signalType: 'competitive', ageDays: 3,
    signal: 'Fintech sector valuations down <em>22% YoY</em>. Consolidation wave begins.',
    impact: 'Tier-2 competitor valuations down 40%. Creates <strong>acquisition or tuck-in opportunities</strong> for well-capitalised operators. Capital-constrained rivals losing market share rapidly.',
    action: 'Review competitive set for acquisition targets. Engage tier-1 VCs about inorganic growth thesis. 12-month window before rates normalise.',
    source: 'Alpha Vantage · Yahoo Finance' },
  { externalId: 'S014', apiLayer: 'finance', apiLabel: 'SEC EDGAR', industry: 'SaaS', geo: 'US', priority: 'monitor', signalType: 'opportunity', ageDays: 10,
    signal: 'Public SaaS company <em>R&D spending +14% YoY</em>, headcount flat.',
    impact: 'Incumbents deferring hiring = <strong>pipeline of senior talent</strong> open to early-stage moves. Negotiating leverage stronger for emerging companies. Hiring window 4–6 months.',
    action: 'Accelerate senior engineering and GTM hires. Target VPs from publicly-listed SaaS cos. Use equity-heavy comp to offset rate shock.',
    source: 'SEC EDGAR · Levels.fyi' },
  { externalId: 'S015', apiLayer: 'company', apiLabel: 'OPENCORPORATES', industry: 'Healthcare', geo: 'UK', priority: 'monitor', signalType: 'competitive', ageDays: 6,
    signal: 'UK healthcare startup registrations <em>+18%</em> — NHS partnership trend.',
    impact: 'NHS digital procurement opening to smaller vendors. <strong>43 new healthtech SMEs</strong> registered in Q1 alone. Increased competition but also market validation signal.',
    action: 'If you offer NHS-relevant solutions, engage now. NHS Digital Procurement Alliance onboarding takes 4–6 months — start early.',
    source: 'OpenCorporates · NHS Digital' },
  { externalId: 'S016', apiLayer: 'company', apiLabel: 'PRODUCT HUNT', industry: 'SaaS', geo: 'global', priority: 'monitor', signalType: 'competitive', ageDays: 2,
    signal: 'Vertical SaaS launches <em>+42% this quarter</em>. Niche specialisation winning.',
    impact: 'Investors rewarding focused ICPs over horizontal plays. <strong>Top 10 vertical SaaS launches raised $280M combined</strong> in past 60 days. Generalist players seeing valuation pressure.',
    action: 'Evaluate your positioning: are you horizontal or vertical? Consider sharpening wedge. Fundraising environment favours narrow-deep ICPs.',
    source: 'Product Hunt · Crunchbase' },
  { externalId: 'S017', apiLayer: 'talent', apiLabel: 'ADZUNA', industry: 'SaaS', geo: 'VN', priority: 'high', signalType: 'opportunity', ageDays: 4,
    signal: 'Vietnam senior engineering salaries <em>still 38% below Singapore</em>.',
    impact: 'Total engineering hire cost in Ho Chi Minh City: <strong>$28–42K/year</strong> vs Singapore $75–95K. English proficiency rising. Visa-free remote setup available for Indian companies.',
    action: 'Establish Vietnam engineering hub within 12 months. Target 10 engineers in Year 1. Partner with local recruiters (NashTech, FPT).',
    source: 'Adzuna · Glassdoor' },
  { externalId: 'S018', apiLayer: 'talent', apiLabel: 'ADZUNA', industry: 'Industrial', geo: 'DE', priority: 'high', signalType: 'opportunity', ageDays: 8,
    signal: 'German industrial-engineering hiring <em>down 12%</em> — senior talent available.',
    impact: 'Former Siemens/Bosch/ABB senior engineers now open to scale-up roles. <strong>22% salary flexibility</strong> vs peak. Window to land VPs and plant managers before economy recovers.',
    action: 'Engage executive search firms in DACH. Target roles: VP Engineering, Head of Manufacturing, Country GM.',
    source: 'Adzuna · Stepstone' },
  { externalId: 'S019', apiLayer: 'country', apiLabel: 'EXCHANGERATE', industry: 'FMCG', geo: 'BR', priority: 'urgent', signalType: 'risk', ageDays: 1,
    signal: 'Brazilian Real <em>depreciated 8%</em> vs USD in 14 days.',
    impact: 'Pricing models requiring urgent revision. Imported goods <strong>8–11% more expensive</strong> in local terms. Elasticity risk for non-essential categories. Existing contracts may need renegotiation.',
    action: 'Review Brazil pricing immediately. Consider BRL-denominated invoicing for partners. Hedge exposure if over $500K annual revenue.',
    source: 'ExchangeRate API · Banco Central' },
  { externalId: 'S020', apiLayer: 'country', apiLabel: 'REST COUNTRIES', industry: 'Consumer', geo: 'SA', priority: 'monitor', signalType: 'regulatory', ageDays: 12,
    signal: 'Saudi Arabia <em>e-commerce VAT threshold</em> lowered to $10K.',
    impact: 'Foreign D2C sellers now need local VAT registration. <strong>15% VAT liability</strong> on Saudi sales. Compliance lead-time 8–12 weeks.',
    action: 'If Saudi revenue exceeds $10K/year: register now. Appoint local tax agent. Update pricing to include VAT.',
    source: 'ZATCA · REST Countries' },
  { externalId: 'S021', apiLayer: 'risk', apiLabel: 'GNEWS', industry: 'Industrial', geo: 'US', priority: 'urgent', signalType: 'risk', ageDays: 2,
    signal: 'US tightens <em>CFIUS review</em> — foreign investments above $50M flagged.',
    impact: 'Cross-border deals above $50M now subject to 90-day review. <strong>20% of filings getting mitigation terms</strong>. Deal timelines extending 3–5 months.',
    action: 'If planning US M&A or large investment: engage CFIUS counsel early. Pre-brief key senators. Budget +15% for legal costs.',
    source: 'GNews · CFIUS.gov' },
  { externalId: 'S022', apiLayer: 'risk', apiLabel: 'OECD', industry: 'Climate', geo: 'DE', priority: 'high', signalType: 'regulatory', ageDays: 5,
    signal: 'EU <em>Carbon Border Adjustment Mechanism</em> enters transition phase.',
    impact: 'Importers of steel, cement, fertiliser, aluminium now must report embedded emissions. <strong>Full tariff from 2026</strong>. Non-compliance penalty: €10–50 per excess ton.',
    action: 'Audit your supply chain emissions. Source alternative suppliers with lower-carbon inputs. Register with EU CBAM registry by end of quarter.',
    source: 'OECD · EU Commission' },
  { externalId: 'S023', apiLayer: 'risk', apiLabel: 'GNEWS', industry: 'Healthcare', geo: 'IN', priority: 'monitor', signalType: 'regulatory', ageDays: 14,
    signal: 'India CDSCO <em>new medical-device registration</em> fees revised.',
    impact: 'Importer registration fees up <strong>30%</strong>. Device approval timeline extended to 9–12 months. Domestic manufacturers get preferential treatment.',
    action: 'If importing medical devices into India: budget for increased costs. Evaluate local manufacturing partnerships to offset.',
    source: 'GNews · CDSCO' },
  { externalId: 'S024', apiLayer: 'trade', apiLabel: 'UN COMTRADE', industry: 'EV', geo: 'SG', priority: 'high', signalType: 'opportunity', ageDays: 3,
    signal: 'Singapore EV imports <em>+78%</em> — government target 100% EV by 2040.',
    impact: 'Luxury and mid-market EV demand accelerating. <strong>$1.8B addressable market</strong>. Tax-incentive stacking makes per-unit economics 22% better than most markets.',
    action: 'Explore Singapore as APAC hub for EV entry. Direct import model viable at volume. Partner with charging network operators.',
    source: 'UN Comtrade · LTA Singapore' },
  { externalId: 'S025', apiLayer: 'markets', apiLabel: 'IMF', industry: 'Fintech', geo: 'KE', priority: 'high', signalType: 'demand', ageDays: 6,
    signal: 'Kenya mobile-money transaction volume <em>+34% YoY</em>.',
    impact: 'M-Pesa ecosystem matured into true financial infrastructure. <strong>85% of adults</strong> now use mobile money. Lending, insurance, and B2B payments layers now exploding.',
    action: 'Explore Nairobi-based fintech partnerships. Safaricom ecosystem partnerships especially valuable. Consider Kenya as East Africa fintech HQ.',
    source: 'IMF · Central Bank of Kenya' },
  { externalId: 'S026', apiLayer: 'news', apiLabel: 'REUTERS', industry: 'Climate', geo: 'JP', priority: 'monitor', signalType: 'opportunity', ageDays: 9,
    signal: 'Japan <em>Green Transformation bonds</em> — $150B issuance plan.',
    impact: 'Japanese government directly funding climate-tech SMEs. Grants up to <strong>¥500M per company</strong>. Foreign-owned JVs eligible with Japanese majority partner.',
    action: 'If climate-tech: establish Japan JV. Engage METI (Ministry of Economy). Partner with Japanese trading houses (Mitsubishi, Mitsui, Sumitomo).',
    source: 'Reuters · METI' },
  { externalId: 'S027', apiLayer: 'trends', apiLabel: 'GOOGLE TRENDS', industry: 'Healthcare', geo: 'UAE', priority: 'high', signalType: 'demand', ageDays: 4,
    signal: 'UAE telemedicine searches <em>+95%</em> post-regulatory reform.',
    impact: 'UAE approved cross-border telehealth consultations. <strong>Estimated 2.1M addressable patients</strong> for remote second-opinion services. Arabic-language content demand rising.',
    action: 'Launch UAE telehealth market. Emirates Health Services partnership recommended. Ensure DHA licensing + Arabic localisation.',
    source: 'Google Trends · DHA' },
  { externalId: 'S028', apiLayer: 'finance', apiLabel: 'ALPHA VANTAGE', industry: 'Industrial', geo: 'VN', priority: 'monitor', signalType: 'opportunity', ageDays: 11,
    signal: 'Vietnam industrial park REITs up <em>31% YTD</em> — supply-chain re-shoring.',
    impact: 'Manufacturing capacity shifting to Vietnam accelerating. <strong>$22B FDI commitments</strong> in past 18 months. Logistics and industrial software demand spiking.',
    action: 'Industrial SaaS: Vietnam is priority. Target manufacturers moving capacity from China. Bangkok + Hanoi dual-HQ model works.',
    source: 'Alpha Vantage · Vietnam MPI' },
  { externalId: 'S029', apiLayer: 'risk', apiLabel: 'GNEWS', industry: 'Fintech', geo: 'UK', priority: 'high', signalType: 'regulatory', ageDays: 2,
    signal: 'FCA tightens <em>Consumer Duty</em> — crypto and BNPL in scope.',
    impact: 'Stricter suitability and fair-value rules. <strong>Non-compliant firms face enforcement</strong>. Compliance cost +18% for affected categories. 12-week implementation deadline.',
    action: 'Review product design, pricing, and disclosures. Appoint dedicated Consumer Duty champion. Prep FCA notification by deadline.',
    source: 'GNews · FCA' },
  { externalId: 'S030', apiLayer: 'talent', apiLabel: 'ADZUNA', industry: 'Healthcare', geo: 'IN', priority: 'high', signalType: 'opportunity', ageDays: 5,
    signal: 'India AI-in-healthcare job postings <em>+214% YoY</em>.',
    impact: 'Major hospital groups building data-science teams. <strong>35K roles projected</strong> in next 24 months. Talent still affordable: $18K–$35K median for senior roles.',
    action: 'If building AI healthcare product: hire in India. Bangalore + Hyderabad primary. Consider Indian co-founder or country GM for credibility.',
    source: 'Adzuna · Naukri' },
  { externalId: 'S031', apiLayer: 'company', apiLabel: 'OPENCORPORATES', industry: 'Climate', geo: 'UK', priority: 'monitor', signalType: 'competitive', ageDays: 13,
    signal: 'UK carbon-accounting startup <em>landscape consolidating</em> — 8 M&A deals in 6 months.',
    impact: 'Market entering maturation phase. <strong>Top 3 players captured 65%</strong> of new customer adds. Differentiation window closing for generic horizontal products.',
    action: 'If entering UK: go vertical (specific industry) or exit strategy (acquisition target). Horizontal play no longer viable.',
    source: 'OpenCorporates · Crunchbase' },
  { externalId: 'S032', apiLayer: 'trade', apiLabel: 'UN COMTRADE', industry: 'FMCG', geo: 'JP', priority: 'monitor', signalType: 'opportunity', ageDays: 10,
    signal: 'Japan premium-FMCG imports from India <em>+12%</em> — Ayurveda, turmeric, spices.',
    impact: 'Japanese demand for "Indian wellness" products unlocking. <strong>Niche but high-margin</strong>: 40–60% gross margins achievable. Language and distribution are moats.',
    action: 'Target Japanese premium retailers (Isetan, Takashimaya). Consider 10-city pilot. Minimum viable entry: $80K in 6 months.',
    source: 'UN Comtrade · JETRO' },
  { externalId: 'S033', apiLayer: 'trends', apiLabel: 'REDDIT', industry: 'Consumer', geo: 'US', priority: 'monitor', signalType: 'demand', ageDays: 7,
    signal: 'Reddit discussions of <em>"made in India"</em> consumer goods up 180%.',
    impact: 'American consumer sentiment shifting toward Indian-origin products (textiles, home goods, wellness). Brand premium building. <strong>Early-mover advantage intact</strong>.',
    action: 'Build American consumer brand narrative emphasising Indian craftsmanship. Amazon + Shopify DTC recommended. Target $50–$500 price point.',
    source: 'Reddit · Google Trends' },
  { externalId: 'S034', apiLayer: 'country', apiLabel: 'REST COUNTRIES', industry: 'global', geo: 'global', priority: 'monitor', signalType: 'regulatory', ageDays: 3,
    signal: '6 new bilateral <em>digital trade agreements</em> signed in past 30 days.',
    impact: 'India–Singapore, India–Australia, UAE–Indonesia agreements reduce cross-border data-transfer friction. <strong>Legal entity setup simplified</strong> in affected pairs.',
    action: 'If targeting any pair: expedite entry. Tax and compliance advantages available for 3–5 years.',
    source: 'REST Countries · WTO' },
  { externalId: 'S035', apiLayer: 'news', apiLabel: 'GNEWS', industry: 'Agri', geo: 'ID', priority: 'high', signalType: 'opportunity', ageDays: 6,
    signal: 'Indonesia announces <em>$4B food security fund</em> — irrigation tech priority.',
    impact: 'Foreign agri-tech companies with local JV partners can bid. <strong>Top priority: precision irrigation, cold-chain, seed genetics</strong>. Government-backed financing available.',
    action: 'Engage Indonesian Trade Ministry. Partner with local conglomerates (Salim Group, Astra). 9-12 month deal cycle.',
    source: 'GNews · BKPM' },
  { externalId: 'S036', apiLayer: 'markets', apiLabel: 'WORLD BANK', industry: 'global', geo: 'MENA', priority: 'high', signalType: 'opportunity', ageDays: 8,
    signal: 'MENA region GDP growth forecast <em>4.1%</em> — top in emerging markets.',
    impact: 'UAE + Saudi + Qatar leading. <strong>Combined $2.3T GDP</strong> growing ~3× global average. English-proficient business environment. Low capital gains tax.',
    action: 'Any globally-minded founder should evaluate MENA. UAE as first base, then Saudi. Sequenced 18-month roadmap.',
    source: 'World Bank · IMF' },
  { externalId: 'S037', apiLayer: 'talent', apiLabel: 'ADZUNA', industry: 'EV', geo: 'DE', priority: 'high', signalType: 'opportunity', ageDays: 4,
    signal: 'German automotive engineers <em>seeking new roles</em> — +45% LinkedIn activity.',
    impact: 'Traditional auto-giant layoffs creating talent surplus. <strong>Senior EV engineers now available</strong> with 15–20 years incumbent experience. Equity-for-salary arbitrage possible.',
    action: 'If building EV tech: recruit actively in DACH. LinkedIn talent-insights packages work. Can close senior hires in 6–8 weeks.',
    source: 'Adzuna · LinkedIn' },
  { externalId: 'S038', apiLayer: 'finance', apiLabel: 'YAHOO', industry: 'SaaS', geo: 'US', priority: 'monitor', signalType: 'demand', ageDays: 15,
    signal: 'Public SaaS ARR multiples rebounded to <em>8.5× TTM</em>.',
    impact: 'Valuation environment improving for IPO-bound SaaS. <strong>$50M+ ARR companies</strong> with clean unit economics best positioned. Window opening for dual-track processes.',
    action: 'If approaching $50M ARR: consider IPO-readiness work. Engage Tier-1 investment bank. 18-month preparation cycle typical.',
    source: 'Yahoo Finance · Public filings' },
  { externalId: 'S039', apiLayer: 'risk', apiLabel: 'OECD', industry: 'FMCG', geo: 'US', priority: 'high', signalType: 'risk', ageDays: 1,
    signal: 'US tariff review — <em>additional 15% duties</em> possible on select imports.',
    impact: 'Category-specific threat. <strong>Textiles, processed foods, electronics at highest risk</strong>. Final decision expected within 60 days. Existing orders may be affected.',
    action: 'Accelerate US shipments of affected categories. Review pricing models. Consider Mexican/Central American manufacturing for tariff arbitrage.',
    source: 'OECD · USTR.gov' },
  { externalId: 'S040', apiLayer: 'news', apiLabel: 'YOURSTORY', industry: 'SaaS', geo: 'IN', priority: 'monitor', signalType: 'competitive', ageDays: 5,
    signal: 'Indian SaaS funding <em>up 28%</em> — vertical specialists winning.',
    impact: 'Domestic capital pool expanding for SaaS. <strong>Median round size Seed: $1.8M, Series A: $11M</strong>. Vertical focus outperforming horizontal 3×.',
    action: 'If Indian-origin SaaS with vertical focus: raise capital now. Terms favourable. Target top-tier India VCs.',
    source: 'YourStory · Inc42' },
];
