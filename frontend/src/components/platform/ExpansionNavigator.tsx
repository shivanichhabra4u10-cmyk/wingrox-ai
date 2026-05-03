'use client';

import { useState, useEffect, useRef } from 'react';
import { PlatformNav } from './PlatformNav';

const INDUSTRY_API: Record<string, string> = {
  'Manufacturing': 'Industrial', 'Technology / SaaS': 'SaaS',
  'Pharmaceuticals': 'Healthcare', 'Healthcare': 'Healthcare',
  'FMCG / Consumer Goods': 'FMCG', 'Engineering / Industrial': 'Industrial',
  'Chemicals': 'Industrial', 'Automotive / Auto Components': 'Industrial',
  'Textiles / Apparel': 'Consumer', 'Food & Beverages': 'Agri',
  'Financial Services': 'Fintech', 'Logistics / Supply Chain': 'Industrial',
  'AgriTech': 'Agri', 'Other': 'SaaS',
};

type ApiCountry = {
  code: string; name: string; flag: string; score: number;
  gdpUsdBn: number; gdpGrowthPct: number; easeScore: number;
  riskBand: string; tariffBand: string; currency: string;
  fitMultiplier: number; why: string;
};
type ApiRisk  = { tag: string; text: string; severity: 'rose' | 'amber' | 'sage' };
type ApiMove  = { title: string; desc: string; when: string };
type ApiReport = {
  assessmentId: string;
  headline: string; subhead: string; cluster: string;
  readinessScore: number; marketReady: number; financialReady: number; gtmReady: number;
  revenueProjectionUsdM: { low: number; base: number; high: number };
  topCountries: ApiCountry[];
  risks: ApiRisk[];
  moves: ApiMove[];
  entryModel: string;
  trajectory: number[];
  timeToDealMonths: number;
  paybackMonths: number;
};

type Step = 'landing' | 'packages' | 'assessment' | 'computing' | 'report';
type PackageTier = 'free' | 'professional' | 'enterprise';

const TOTAL_PAGES = 7;

const INDUSTRIES = [
  'Manufacturing', 'Technology / SaaS', 'Pharmaceuticals', 'Healthcare',
  'FMCG / Consumer Goods', 'Engineering / Industrial', 'Chemicals',
  'Automotive / Auto Components', 'Textiles / Apparel', 'Food & Beverages',
  'Financial Services', 'Logistics / Supply Chain', 'AgriTech', 'Other',
];
const REVENUES = [
  'Pre-revenue', '< ₹5 Cr', '₹5–20 Cr', '₹20–50 Cr',
  '₹50–100 Cr', '₹100–250 Cr', '₹250–500 Cr', '₹500–1000 Cr', '₹1000+ Cr',
];
const EU_COUNTRIES  = ['Germany', 'Netherlands', 'France', 'United Kingdom', 'Spain', 'Italy', 'Nordics (Sweden/Denmark/Norway/Finland)', 'DACH Region', 'Not yet decided'];
const GOALS         = ['Revenue growth', 'Find distributors', 'Raise capital', 'De-risk domestic', 'IPO / M&A prep'];
const HQ_COUNTRIES  = ['India', 'United Kingdom', 'Germany', 'United States', 'Singapore', 'UAE', 'Other'];
const EU_TRACTIONS  = ['Paying EU customers', 'Pilots / POCs running', 'Validated, no revenue yet', 'No EU traction yet'];
const MKT_RESEARCH  = ['Comprehensive', 'Basic desk research', 'None'];
const PROD_COMPL    = ['Fully EU-compliant', 'Partially compliant', 'Not yet started'];
const BUDGETS       = ['< $50K', '$50K – $150K', '$150K – $500K', '$500K – $2M', '$2M+'];
const BIZ_MODELS    = ['B2B', 'B2C', 'B2B2C', 'Marketplace', 'D2C'];
const PRICING_POS   = ['Premium', 'Mid-market', 'Value / Low-cost'];
const TEAM_SIZES    = ['1–10', '11–50', '51–200', '201–500', '500+'];
const EU_NETWORKS   = ['Strong network', 'Some contacts', 'Building', 'None'];
const DEDIC_TEAMS   = ['Yes — full-time', 'Part-time / shared', 'Planning to hire', 'No dedicated team'];
const ENTRY_MODELS  = ['Distributor-Led', 'Direct Sales', 'Joint Venture', 'Licensing', 'E-commerce'];
const TIMELINES     = ['0–6 months', '6–12 months', '12–18 months', '18+ months'];
const COMP_PRIOS    = ['Speed first', 'Balanced approach', 'Compliance-first'];

const ENTRY_MODEL_LABELS: Record<string, string> = {
  distributor: 'Distributor-Led', direct: 'Direct Entry', jv: 'Joint Venture', licensing: 'Licensing',
};
const SEV_COLOR: Record<string, string> = { rose: 'var(--rose)', amber: 'var(--amber)', sage: 'var(--sage)' };
const SEV_BG:    Record<string, string> = { rose: 'var(--rose-pale)', amber: 'var(--amber-pale)', sage: 'var(--sage-pale)' };

const WHY_CARDS = [
  { icon: '🧩', title: 'Weak Demand Validation',  desc: 'Assuming a great product has EU demand leads to 6–9 months wasted without a deal.' },
  { icon: '📜', title: 'Compliance Delays',        desc: 'EU regulatory requirements catch 60% of companies off-guard, delaying entry 6–12 months.' },
  { icon: '🤝', title: 'Wrong Partner Selection',  desc: 'The wrong distributor or JV sets you back 12–18 months. Partner fit is everything in Europe.' },
  { icon: '💸', title: 'Hidden Cost Erosion',       desc: 'European CAC, logistics, and compliance erode margins that looked healthy on paper.' },
  { icon: '🗺️', title: 'Wrong Country First',       desc: 'Entering Germany with a product better suited for Netherlands wastes critical early momentum.' },
  { icon: '👥', title: 'Execution Bandwidth',       desc: 'Leadership split between India ops and EU expansion without a dedicated team is a silent killer.' },
];
const WHAT_GET = [
  { icon: '📊', title: 'Readiness Score',  desc: '0–100 score with full interpretation' },
  { icon: '🏷️', title: 'Cluster Stage',    desc: 'Which of 5 readiness stages you are in' },
  { icon: '🎯', title: 'Entry Strategy',   desc: 'Best model for your exact profile' },
  { icon: '⚠️', title: 'Critical Gaps',    desc: 'Top 5 gaps with specific fixes' },
  { icon: '🗺️', title: 'Risk Map',         desc: 'Compliance and execution risk flags' },
  { icon: '📅', title: '12-Month Roadmap', desc: 'Phase-by-phase execution blueprint' },
  { icon: '🤝', title: 'Partner Profile',  desc: 'Ideal partner match signals' },
  { icon: '💰', title: 'Financial Reality',desc: 'EU unit economics validation' },
];

function TrajectoryChart({ trajectory, timeToDeal }: { trajectory: number[]; timeToDeal: number }) {
  const max = Math.max(...trajectory, 1);
  const W = 600; const H = 100;
  const pts = trajectory.map((v, i) => `${(i / 24) * W},${H - (v / max) * H * 0.9}`).join(' ');
  const dealX = (timeToDeal / 24) * W;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 100, display: 'block' }}>
      <defs>
        <linearGradient id="navTrajGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9973a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#c9973a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill="url(#navTrajGrad)" />
      <polyline points={pts} fill="none" stroke="#c9973a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {timeToDeal > 0 && (
        <line x1={dealX} y1="0" x2={dealX} y2={H} stroke="rgba(201,151,58,.4)" strokeWidth="1.5" strokeDasharray="4 3" />
      )}
    </svg>
  );
}

function ChipGroup({ options, value, onChange, multi = false, limit }: {
  options: string[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  multi?: boolean;
  limit?: number;
}) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
      {options.map(opt => {
        const active = selected.includes(opt);
        const atLimit = !!(limit && multi && !active && selected.length >= limit);
        return (
          <button key={opt} type="button"
            onClick={() => {
              if (atLimit) return;
              if (multi) {
                const arr = Array.isArray(value) ? [...(value as string[])] : [];
                onChange(active ? arr.filter(v => v !== opt) : [...arr, opt]);
              } else {
                onChange(active ? '' : opt);
              }
            }}
            style={{
              padding: '8px 16px', borderRadius: 'var(--r-full)',
              border: `1.5px solid ${active ? 'var(--gold)' : 'var(--ink-08)'}`,
              background: active ? 'var(--gold-mist)' : atLimit ? 'var(--bg-warm)' : '#fff',
              color: active ? 'var(--gold-deep)' : atLimit ? 'var(--ink-30)' : 'var(--ink-70)',
              fontSize: 13, fontWeight: active ? 600 : 400,
              cursor: atLimit ? 'default' : 'pointer',
              opacity: atLimit ? 0.45 : 1, transition: 'all .15s',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function ExpansionNavigator() {
  const [step,            setStep]            = useState<Step>('landing');
  const [selectedPackage, setSelectedPackage] = useState<PackageTier>('free');
  const [assessmentPage,  setAssessmentPage]  = useState(0);
  const [pageError,       setPageError]       = useState('');
  const [error,           setError]           = useState<string | null>(null);

  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [mobile,  setMobile]  = useState('');
  const [companyName,  setCompanyName]  = useState('');
  const [hqCountry,    setHqCountry]    = useState('India');
  const [industry,     setIndustry]     = useState('');
  const [revenue,      setRevenue]      = useState('');
  const [goal,             setGoal]             = useState('');
  const [targetCountries,  setTargetCountries]  = useState<string[]>([]);
  const [euTraction,        setEuTraction]        = useState('');
  const [marketResearch,    setMarketResearch]    = useState('');
  const [productCompliance, setProductCompliance] = useState('');
  const [expansionBudget,  setExpansionBudget]  = useState('');
  const [businessModel,    setBusinessModel]    = useState('B2B');
  const [pricingPosition,  setPricingPosition]  = useState('');
  const [teamSize,      setTeamSize]      = useState('');
  const [euNetwork,     setEuNetwork]     = useState('');
  const [dedicatedTeam, setDedicatedTeam] = useState('');
  const [preferredEntryModel, setPreferredEntryModel] = useState('');
  const [dealTimeline,        setDealTimeline]         = useState('');
  const [compliancePriority,  setCompliancePriority]   = useState('');

  const [progress, setProgress] = useState(0);
  const [report,   setReport]   = useState<ApiReport | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progressLabel =
    progress < 20  ? 'Analysing market fit...'            :
    progress < 40  ? 'Scoring regulatory landscape...'    :
    progress < 60  ? 'Computing entry model economics...' :
    progress < 80  ? 'Building revenue trajectory...'     :
    progress < 100 ? 'Finalising readiness report...'     : 'Complete';

  const canProceed = () => {
    if (assessmentPage === 0) return companyName.trim().length > 0;
    if (assessmentPage === 1) return industry !== '' && revenue !== '';
    if (assessmentPage === 2) return goal !== '' && targetCountries.length > 0;
    return true;
  };

  const nextPage = () => {
    if (!canProceed()) { setPageError('Please complete the required fields above.'); return; }
    setPageError('');
    if (assessmentPage === TOTAL_PAGES - 1) { generate(); }
    else { setAssessmentPage(p => p + 1); }
  };

  const prevPage = () => {
    setPageError('');
    if (assessmentPage === 0) { setStep('packages'); }
    else { setAssessmentPage(p => p - 1); }
  };

  const generate = async () => {
    setError(null);
    setStep('computing');
    setProgress(0);
    let p = 0;
    timerRef.current = setInterval(() => {
      p = Math.min(p + Math.random() * 9 + 2, 90);
      setProgress(p);
    }, 380);
    try {
      const revenueBandMap: Record<string, string> = {
        'Pre-revenue': 'Pre-revenue', '< ₹5 Cr': '< $500K', '₹5–20 Cr': '$500K – $2M',
        '₹20–50 Cr': '$2M – $10M', '₹50–100 Cr': '$2M – $10M', '₹100–250 Cr': '$10M – $50M',
        '₹250–500 Cr': '$10M – $50M', '₹500–1000 Cr': '$50M+', '₹1000+ Cr': '$50M+',
      };
      const geoCodeMap: Record<string, string> = {
        'Germany': 'DE', 'Netherlands': 'NL', 'France': 'FR', 'United Kingdom': 'UK',
        'Spain': 'ES', 'Italy': 'IT', 'Nordics (Sweden/Denmark/Norway/Finland)': 'SE',
        'DACH Region': 'DE', 'Not yet decided': 'DE',
      };
      const entryModelApiMap: Record<string, string> = {
        'Distributor-Led': 'distributor', 'Direct Sales': 'direct',
        'Joint Venture': 'jv', 'Licensing': 'licensing', 'E-commerce': 'direct',
      };
      const budgetApiMap: Record<string, number> = {
        '< $50K': 40, '$50K – $150K': 100, '$150K – $500K': 325, '$500K – $2M': 1250, '$2M+': 3000,
      };
      const geos = targetCountries.length > 0
        ? targetCountries.map(c => geoCodeMap[c] ?? 'DE')
        : ['DE'];
      const res = await fetch('/api/expansion/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName:      companyName.trim(),
          hqCountry:        hqCountry || 'India',
          industry:         INDUSTRY_API[industry] ?? 'SaaS',
          revenueBand:      revenueBandMap[revenue] ?? '$500K – $2M',
          businessModel:    businessModel || 'B2B',
          goal:             goal || 'Revenue growth',
          targetGeos:       geos,
          entryModel:       entryModelApiMap[preferredEntryModel] ?? 'distributor',
          entryCapitalUsdK: budgetApiMap[expansionBudget] ?? 150,
          ...(email.trim() ? { email: email.trim() } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message || `Request failed (${res.status})`);
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);
      if (json.data?.assessmentId) localStorage.setItem('wg_assessment_id', json.data.assessmentId);
      setReport(json.data as ApiReport);
      setTimeout(() => setStep('report'), 350);
    } catch (err) {
      if (timerRef.current) clearInterval(timerRef.current);
      setError(err instanceof Error ? err.message : 'Failed to run assessment');
      setStep('assessment');
      setAssessmentPage(TOTAL_PAGES - 1);
    }
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── LANDING ────────────────────────────────────────────────────────────────
  if (step === 'landing') return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PlatformNav active="expansion" />
      <section style={{ paddingTop: 110, paddingBottom: 80, background: 'linear-gradient(165deg,var(--bg) 0%,var(--bg-warm) 55%,#e8f0fa 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, right: -80, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(201,151,58,.1) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 56, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--gold-mist)', border: '1px solid rgba(201,151,58,.35)', color: 'var(--gold-deep)', padding: '4px 13px', borderRadius: 'var(--r-full)', fontSize: 11, fontWeight: 700, letterSpacing: '.7px', textTransform: 'uppercase', marginBottom: 18 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
                Europe Expansion Intelligence
              </div>
              <h1 style={{ fontSize: 'clamp(36px,5.5vw,62px)', lineHeight: 1.1, marginBottom: 18, fontWeight: 400 }}>
                Are You Ready to Scale Your Business <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Globally?</em>
              </h1>
              <p style={{ fontSize: 17, color: 'var(--ink-70)', maxWidth: 500, marginBottom: 14, fontWeight: 300, lineHeight: 1.65 }}>
                Most companies fail not because of their product — but because of wrong market entry decisions. Find out exactly where you stand, what is blocking you, and what to do next.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,.04)', padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, marginBottom: 30, color: 'var(--ink-70)' }}>
                ⏱ 20–30 min assessment &nbsp;·&nbsp; Instant results &nbsp;·&nbsp; Free expert call included
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
                <button className="btn-gold" onClick={() => setStep('packages')}>
                  Start Free Assessment <span className="arr">→</span>
                </button>
                <button className="btn-outline" onClick={() => document.getElementById('nav-why')?.scrollIntoView({ behavior: 'smooth' })}>
                  See a Real Journey ↓
                </button>
              </div>
              <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap' }}>
                {[['75+','Diagnostic questions'],['12','Assessment dimensions'],['340+','Companies assessed'],['87%','Success rate']].map(([n,l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: 30, lineHeight: 1 }}>{n}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-40)', fontWeight: 500, marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ background: '#fff', border: '1px solid var(--ink-08)', borderRadius: 18, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,.09)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,var(--gold),var(--gold-2))', borderRadius: '18px 18px 0 0' }} />
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 14 }}>Sample Readiness Report</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                  <div style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
                    <svg viewBox="0 0 76 76" width="76" height="76" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="38" cy="38" r="30" fill="none" stroke="var(--ink-08)" strokeWidth="7" />
                      <circle cx="38" cy="38" r="30" fill="none" stroke="var(--gold)" strokeWidth="7" strokeLinecap="round" strokeDasharray="188" strokeDashoffset="68" />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'var(--f-display)', fontSize: 22, fontWeight: 700, lineHeight: 1 }}>64</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', background: 'var(--amber-pale)', padding: '3px 10px', borderRadius: 5, display: 'inline-block', marginBottom: 5 }}>Experimenter Stage</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-70)', lineHeight: 1.5 }}>Ready to enter Europe — needs structured execution to convert first deals</div>
                  </div>
                </div>
                {([['Demand',58,'#e05c4a'],['Strategy',62,'#e08c3a'],['Competition',60,'#d4a030'],['Economics',66,'var(--gold)'],['Customer',59,'#9f7020'],['Execution',70,'#166640']] as [string,number,string][]).map(([label,val,color]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginBottom: 6 }}>
                    <span style={{ minWidth: 72, color: 'var(--ink-70)', fontWeight: 500 }}>{label}</span>
                    <div style={{ flex: 1, height: 4, background: 'var(--ink-08)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 11, minWidth: 22, textAlign: 'right', color }}>{val}</span>
                  </div>
                ))}
                <div style={{ marginTop: 14, padding: '10px 13px', background: 'var(--sage-pale)', borderRadius: 8, fontSize: 12, color: 'var(--sage)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span>✓</span> Your report is generated instantly from your answers
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="nav-why" style={{ padding: '80px 0', background: '#fff' }}>
        <div className="container">
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Why It Matters</div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', marginBottom: 12, fontWeight: 400 }}>Why 70% of Companies Fail<br />in European Markets</h2>
          <p style={{ fontSize: 15, color: 'var(--ink-70)', maxWidth: 520, marginBottom: 44 }}>The European market punishes assumptions. These are the six most expensive mistakes companies make.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 }}>
            {WHY_CARDS.map(c => (
              <div key={c.title} className="dash-card" style={{ padding: '24px 22px' }}>
                <div style={{ fontSize: 26, marginBottom: 12 }}>{c.icon}</div>
                <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 7 }}>{c.title}</h4>
                <p style={{ fontSize: 13, color: 'var(--ink-70)', lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', background: 'var(--bg-warm)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>What You Get</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', marginBottom: 12, fontWeight: 400 }}>Your Complete Readiness Picture</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 14 }}>
            {WHAT_GET.map(w => (
              <div key={w.title} className="dash-card" style={{ padding: '18px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 9 }}>{w.icon}</div>
                <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{w.title}</h4>
                <p style={{ fontSize: 11, color: 'var(--ink-70)' }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 400 }}>Three Steps to Your Expansion Verdict</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, maxWidth: 760, margin: '0 auto', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 28, left: '20%', right: '20%', height: 2, background: 'linear-gradient(90deg,var(--gold),var(--gold-2))', opacity: .25, pointerEvents: 'none' }} />
            {[
              { n: '1', bg: 'var(--bg-dark)', color: '#fff', title: 'Answer Questions',  desc: '75+ structured questions across 7 critical dimensions of expansion readiness' },
              { n: '2', bg: 'var(--gold)',     color: '#fff', title: 'Get Deep Analysis', desc: 'AI scoring evaluates demand, execution, economics, risk, and partner readiness' },
              { n: '3', bg: '#1a4a8a',         color: '#fff', title: 'See Your Path',     desc: 'Receive your custom roadmap, partner signals, and 12-month execution blueprint' },
            ].map(s => (
              <div key={s.n} style={{ background: 'var(--bg-warm)', borderRadius: 18, padding: 24, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: s.bg, color: s.color, fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontFamily: 'var(--f-mono)' }}>{s.n}</div>
                <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 7 }}>{s.title}</h4>
                <p style={{ fontSize: 12, color: 'var(--ink-70)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button className="btn-gold" onClick={() => setStep('packages')} style={{ fontSize: 15, padding: '14px 32px' }}>
              Start Free Assessment <span className="arr">→</span>
            </button>
            <div style={{ fontSize: 12, color: 'var(--ink-40)', marginTop: 10 }}>Use coupon codes for up to 100% discount &nbsp;·&nbsp; Free expert call with every report</div>
          </div>
        </div>
      </section>

      <section style={{ padding: '36px 0', background: 'var(--bg-warm)', borderTop: '1px solid var(--ink-08)', borderBottom: '1px solid var(--ink-08)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            {[['📊','Real expansion data'],['🏢','Founders & enterprises'],['🌍','Europe-specific intel'],['🔒','Confidential & secure'],['⚡','Instant results'],['📞','Free expert call included']].map(([icon,text]) => (
              <div key={text as string} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff', border: '1px solid var(--ink-08)', borderRadius: 9, padding: '9px 16px' }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );

  // ── PACKAGES ───────────────────────────────────────────────────────────────
  if (step === 'packages') return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PlatformNav active="expansion" />
      <div style={{ paddingTop: 96, paddingBottom: 80 }}>
        <div className="container" style={{ maxWidth: 980 }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--gold-mist)', border: '1px solid rgba(201,151,58,.35)', color: 'var(--gold-deep)', padding: '4px 13px', borderRadius: 'var(--r-full)', fontSize: 11, fontWeight: 700, letterSpacing: '.7px', textTransform: 'uppercase', marginBottom: 16 }}>
              Assessment Track
            </div>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(26px,4vw,38px)', fontWeight: 400, marginBottom: 10 }}>Choose Your Assessment Track</h2>
            <p style={{ fontSize: 15, color: 'var(--ink-70)', maxWidth: 520, margin: '0 auto' }}>
              All tracks use the same 75+ question assessment. Your track determines the depth of insights you receive.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 32 }}>

            {/* Free */}
            <div className="dash-card" onClick={() => setSelectedPackage('free')}
              style={{ padding: '28px 24px', cursor: 'pointer', transition: 'all .2s',
                border: `2px solid ${selectedPackage === 'free' ? 'var(--gold)' : 'var(--ink-08)'}`,
                background: selectedPackage === 'free' ? 'var(--gold-mist)' : '#fff' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-50)', marginBottom: 10 }}>Free</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 400, marginBottom: 6 }}>Basic Navigator</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 34, color: 'var(--ink)', lineHeight: 1, marginBottom: 20 }}>₹0</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
                {([['✓','Readiness Score (0–100)'],['✓','Cluster Stage Diagnosis'],['✓','Top 3 EU Market Picks'],['✓','Key Risk Flags'],['✓','3 Next-Step Recommendations'],['–','90-Day Execution Playbook'],['–','Country Deep-Dive Analysis'],['–','Distributor Shortlist']] as [string,string][]).map(([tick,text]) => (
                  <div key={text} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                    <span style={{ color: tick === '✓' ? 'var(--sage)' : 'var(--ink-30)', fontWeight: 600, flexShrink: 0 }}>{tick}</span>
                    <span style={{ color: tick === '✓' ? 'var(--ink-70)' : 'var(--ink-30)' }}>{text}</span>
                  </div>
                ))}
              </div>
              <button className={selectedPackage === 'free' ? 'btn-gold' : 'btn-outline'} style={{ width: '100%', justifyContent: 'center' }}
                onClick={e => { e.stopPropagation(); setSelectedPackage('free'); setStep('assessment'); setAssessmentPage(0); }}>
                Start Free Assessment
              </button>
            </div>

            {/* Professional */}
            <div className="dash-card" onClick={() => setSelectedPackage('professional')}
              style={{ padding: '28px 24px', cursor: 'pointer', border: '2px solid var(--gold)', background: 'var(--bg-warm)', position: 'relative', transition: 'all .2s' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 'var(--r-full)', whiteSpace: 'nowrap' }}>
                Most Popular
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gold-deep)', marginBottom: 10 }}>Professional</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 400, marginBottom: 6 }}>Full Navigator</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 34, color: 'var(--gold-deep)', lineHeight: 1, marginBottom: 4 }}>₹2,00,000</div>
              <div style={{ fontSize: 11, color: 'var(--ink-50)', marginBottom: 20 }}>Use a coupon for up to 100% off</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
                {['Everything in Free','90-Day Execution Playbook','Country Deep-Dive (7 dimensions)','Distributor Shortlist (10 vetted)','Localised Pricing Model','Board-Ready Projections','1 Expert Strategy Call (60 min)','Post-Report Email Support (30 days)'].map(text => (
                  <div key={text} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                    <span style={{ color: 'var(--sage)', fontWeight: 600, flexShrink: 0 }}>✓</span>
                    <span style={{ color: 'var(--ink-70)' }}>{text}</span>
                  </div>
                ))}
              </div>
              <button className="btn-gold" style={{ width: '100%', justifyContent: 'center' }}
                onClick={e => { e.stopPropagation(); setSelectedPackage('professional'); setStep('assessment'); setAssessmentPage(0); }}>
                Start Assessment <span className="arr">→</span>
              </button>
            </div>

            {/* Enterprise */}
            <div className="dash-card" onClick={() => setSelectedPackage('enterprise')}
              style={{ padding: '28px 24px', cursor: 'pointer', transition: 'all .2s',
                border: `2px solid ${selectedPackage === 'enterprise' ? 'var(--ink)' : 'var(--ink-08)'}`,
                background: selectedPackage === 'enterprise' ? 'var(--bg-dark)' : '#fff' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-50)', marginBottom: 10 }}>Enterprise</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 400, marginBottom: 6, color: selectedPackage === 'enterprise' ? '#fff' : 'inherit' }}>Tailored Assessment</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 34, color: selectedPackage === 'enterprise' ? 'var(--gold)' : 'var(--ink)', lineHeight: 1, marginBottom: 20 }}>Custom</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
                {['Everything in Professional','Multi-country Comparison','Team Workshops (2 sessions)','White-label Report','Quarterly Advisory Retainer'].map(text => (
                  <div key={text} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                    <span style={{ color: 'var(--sage)', fontWeight: 600, flexShrink: 0 }}>✓</span>
                    <span style={{ color: selectedPackage === 'enterprise' ? 'rgba(255,255,255,.7)' : 'var(--ink-70)' }}>{text}</span>
                  </div>
                ))}
              </div>
              <button className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}
                onClick={e => { e.stopPropagation(); setSelectedPackage('enterprise'); setStep('assessment'); setAssessmentPage(0); }}>
                Contact Us →
              </button>
            </div>

          </div>
          <div style={{ textAlign: 'center' }}>
            <button className="btn-outline btn-sm" onClick={() => setStep('landing')}>← Back to Overview</button>
          </div>
        </div>
      </div>
    </main>
  );

  // ── ASSESSMENT ─────────────────────────────────────────────────────────────
  if (step === 'assessment') {
    const pages = [
      { title: 'Company Profile',       subtitle: 'Tell us about your company and contact details.' },
      { title: 'Business Profile',      subtitle: 'Help us understand your industry and current scale.' },
      { title: 'Expansion Intent',      subtitle: 'Where do you want to go and what do you want to achieve?' },
      { title: 'Market Validation',     subtitle: 'What progress have you already made in the European market?' },
      { title: 'Financial Readiness',   subtitle: 'Tell us about your financial capacity for expansion.' },
      { title: 'Team & Operations',     subtitle: 'What is your execution capacity and EU network strength?' },
      { title: 'Go-to-Market Strategy', subtitle: 'How do you plan to enter and win the European market?' },
    ];
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <PlatformNav active="expansion" />
        <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '80px 24px 60px' }}>
          <div className="dash-card" style={{ maxWidth: 640, width: '100%', padding: '40px 44px' }}>

            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 30 }}>
              {Array.from({ length: TOTAL_PAGES }, (_, i) => (
                <div key={i} style={{ height: 5, flexShrink: 0, borderRadius: 3, transition: 'all .3s ease',
                  width: i === assessmentPage ? 28 : i < assessmentPage ? 14 : 6,
                  background: i <= assessmentPage ? 'var(--gold)' : 'var(--ink-08)' }} />
              ))}
              <span style={{ marginLeft: 10, fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-40)', letterSpacing: '.1em', whiteSpace: 'nowrap' }}>
                {assessmentPage + 1} / {TOTAL_PAGES}
              </span>
            </div>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div className="mh-eyebrow" style={{ display: 'inline-flex', marginBottom: 10 }}>
                Step {assessmentPage + 1} of {TOTAL_PAGES}
              </div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 24, fontWeight: 400, marginBottom: 6 }}>
                {pages[assessmentPage].title}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--ink-70)' }}>{pages[assessmentPage].subtitle}</p>
            </div>

            {/* Page 0 */}
            {assessmentPage === 0 && (
              <>
                <div className="field-row">
                  <div className="field"><label>Company Name *</label><input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Technologies Ltd." /></div>
                  <div className="field"><label>Your Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Rajesh Sharma" /></div>
                </div>
                <div className="field-row">
                  <div className="field"><label>Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="rajesh@company.com" /></div>
                  <div className="field"><label>Mobile Number</label><input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="+91 9876543210" /></div>
                </div>
                <div className="field">
                  <label>HQ Country</label>
                  <select value={hqCountry} onChange={e => setHqCountry(e.target.value)}>
                    {HQ_COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </>
            )}

            {/* Page 1 */}
            {assessmentPage === 1 && (
              <>
                <div style={{ marginBottom: 26 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Industry *</label>
                  <ChipGroup options={INDUSTRIES} value={industry} onChange={v => setIndustry(v as string)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Annual Revenue *</label>
                  <ChipGroup options={REVENUES} value={revenue} onChange={v => setRevenue(v as string)} />
                </div>
              </>
            )}

            {/* Page 2 */}
            {assessmentPage === 2 && (
              <>
                <div style={{ marginBottom: 26 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                    Target EU Markets *
                    <span style={{ fontWeight: 400, color: 'var(--ink-40)', fontSize: 12, marginLeft: 8 }}>select up to 3</span>
                  </label>
                  <ChipGroup options={EU_COUNTRIES} value={targetCountries} onChange={v => setTargetCountries(v as string[])} multi limit={3} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Primary Expansion Goal *</label>
                  <ChipGroup options={GOALS} value={goal} onChange={v => setGoal(v as string)} />
                </div>
              </>
            )}

            {/* Page 3 */}
            {assessmentPage === 3 && (
              <>
                <div style={{ marginBottom: 26 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>EU Customer Traction</label>
                  <ChipGroup options={EU_TRACTIONS} value={euTraction} onChange={v => setEuTraction(v as string)} />
                </div>
                <div style={{ marginBottom: 26 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>EU Market Research Done?</label>
                  <ChipGroup options={MKT_RESEARCH} value={marketResearch} onChange={v => setMarketResearch(v as string)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Product EU Compliance Status</label>
                  <ChipGroup options={PROD_COMPL} value={productCompliance} onChange={v => setProductCompliance(v as string)} />
                </div>
              </>
            )}

            {/* Page 4 */}
            {assessmentPage === 4 && (
              <>
                <div style={{ marginBottom: 26 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Entry Capital Budget</label>
                  <ChipGroup options={BUDGETS} value={expansionBudget} onChange={v => setExpansionBudget(v as string)} />
                </div>
                <div style={{ marginBottom: 26 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Business Model</label>
                  <ChipGroup options={BIZ_MODELS} value={businessModel} onChange={v => setBusinessModel(v as string)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Pricing Position</label>
                  <ChipGroup options={PRICING_POS} value={pricingPosition} onChange={v => setPricingPosition(v as string)} />
                </div>
              </>
            )}

            {/* Page 5 */}
            {assessmentPage === 5 && (
              <>
                <div style={{ marginBottom: 26 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Team Size</label>
                  <ChipGroup options={TEAM_SIZES} value={teamSize} onChange={v => setTeamSize(v as string)} />
                </div>
                <div style={{ marginBottom: 26 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>EU Network Strength</label>
                  <ChipGroup options={EU_NETWORKS} value={euNetwork} onChange={v => setEuNetwork(v as string)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Dedicated EU Team?</label>
                  <ChipGroup options={DEDIC_TEAMS} value={dedicatedTeam} onChange={v => setDedicatedTeam(v as string)} />
                </div>
              </>
            )}

            {/* Page 6 */}
            {assessmentPage === 6 && (
              <>
                <div style={{ marginBottom: 26 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Preferred Entry Model</label>
                  <ChipGroup options={ENTRY_MODELS} value={preferredEntryModel} onChange={v => setPreferredEntryModel(v as string)} />
                </div>
                <div style={{ marginBottom: 26 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Target Timeline to First Deal</label>
                  <ChipGroup options={TIMELINES} value={dealTimeline} onChange={v => setDealTimeline(v as string)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Compliance Priority</label>
                  <ChipGroup options={COMP_PRIOS} value={compliancePriority} onChange={v => setCompliancePriority(v as string)} />
                </div>
              </>
            )}

            {(pageError || error) && (
              <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--rose-pale)', border: '1px solid var(--rose)', borderRadius: 'var(--r-sm)', color: 'var(--rose)', fontSize: 13 }}>
                {pageError || error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 30 }}>
              <button className="btn-outline btn-sm" onClick={prevPage}>← Back</button>
              <button className="btn-gold" onClick={nextPage}>
                {assessmentPage === TOTAL_PAGES - 1
                  ? <><span>Submit Assessment</span> <span className="arr">→</span></>
                  : <><span>Next</span> <span className="arr">→</span></>}
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--ink-40)', textAlign: 'center', marginTop: 12 }}>🔒 Your data is secure and confidential</p>
          </div>
        </div>
      </main>
    );
  }

  // ── COMPUTING ──────────────────────────────────────────────────────────────
  if (step === 'computing') return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PlatformNav active="expansion" />
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="dash-card" style={{ maxWidth: 640, width: '100%', padding: '60px 48px', textAlign: 'center', background: 'linear-gradient(135deg,var(--bg-dark),#2a2515)', color: 'var(--bg)', border: 'none' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid rgba(201,151,58,.25)', borderTopColor: 'var(--gold)', margin: '0 auto 28px', animation: 'spin 1.1s linear infinite' }} />
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>◈ Scale Navigator Running</div>
          <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 24, fontWeight: 400, marginBottom: 12 }}>Scoring your readiness...</h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', lineHeight: 1.7, marginBottom: 24 }}>{progressLabel}</p>
          <div style={{ maxWidth: 360, margin: '0 auto' }}>
            <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,var(--gold),var(--gold-2))', transition: 'width .4s' }} />
            </div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 8 }}>{Math.round(progress)}%</div>
          </div>
        </div>
      </div>
    </main>
  );

  // ── REPORT ─────────────────────────────────────────────────────────────────
  if (!report) return null;
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PlatformNav active="expansion" />
      <div style={{ paddingTop: 88 }}>
        <div className="container" style={{ paddingBottom: 32 }}>

          <div className="dash-card" style={{ padding: 40, marginBottom: 24, background: 'linear-gradient(135deg,var(--gold-mist),var(--bg-warm))', borderColor: 'var(--gold)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 40, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto' }}>
                  <svg viewBox="0 0 200 200" width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="100" cy="100" r="86" fill="none" stroke="rgba(201,151,58,.1)" strokeWidth="14" />
                    <circle cx="100" cy="100" r="86" fill="none" stroke="url(#navScoreGrad)" strokeWidth="14" strokeLinecap="round"
                      strokeDasharray="540" strokeDashoffset={540 - (540 * report.readinessScore) / 100}
                      style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(.4,0,.2,1)' }} />
                    <defs>
                      <linearGradient id="navScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c9973a" /><stop offset="100%" stopColor="#e8b85a" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: 52, fontWeight: 500, lineHeight: 1, color: 'var(--gold-deep)' }}>{report.readinessScore}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-50)', marginTop: 4 }}>Readiness</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 12 }}>◈ Your Readiness Report · {report.cluster}</div>
                <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 26, fontWeight: 400, marginBottom: 10, lineHeight: 1.25 }}>{report.headline}</h3>
                <p style={{ fontSize: 14.5, color: 'var(--ink-70)', lineHeight: 1.7, marginBottom: 16 }}>{report.subhead}</p>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {([['Market Ready', report.marketReady], ['Financial Ready', report.financialReady], ['GTM Ready', report.gtmReady]] as [string, number][]).map(([lbl, val]) => (
                    <div key={lbl}>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-50)', marginBottom: 3 }}>{lbl}</div>
                      <div style={{ fontFamily: 'var(--f-display)', fontSize: 22, color: 'var(--gold-deep)' }}>{val}/100</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {report.trajectory?.length > 0 && (
            <div className="dash-card" style={{ marginBottom: 24 }}>
              <div className="dc-label" style={{ marginBottom: 16 }}>◈ Entry Model Analysis · {ENTRY_MODEL_LABELS[report.entryModel] ?? report.entryModel}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
                {([['Time to First Deal', `Month ${report.timeToDealMonths}`, 'After entry'],['Year-2 Revenue Run Rate', `$${(report.trajectory[23] ?? 0).toFixed(1)}K/mo`, 'Monthly by month 24'],['Capital Payback', `${report.paybackMonths} months`, 'On entry budget']] as [string,string,string][]).map(([label,val,sub]) => (
                  <div key={label} style={{ padding: '18px 16px', background: 'var(--bg-warm)', borderRadius: 'var(--r-lg)', border: '1px solid var(--ink-08)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-50)', marginBottom: 6 }}>{label}</div>
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: 26, color: 'var(--gold-deep)', lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-50)', marginTop: 4 }}>{sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.08em', color: 'var(--ink-50)', marginBottom: 8 }}>25-MONTH REVENUE TRAJECTORY ($K / MONTH)</div>
              <TrajectoryChart trajectory={report.trajectory} timeToDeal={report.timeToDealMonths} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-40)', marginTop: 4 }}>
                <span>M0</span><span>M6</span><span>M12</span><span>M18</span><span>M24</span>
              </div>
            </div>
          )}

          <div className="dash-card" style={{ marginBottom: 24 }}>
            <div className="dc-label">◈ Top 3 Markets — ranked for your profile</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 14 }}>
              {report.topCountries.slice(0, 3).map((c, i) => (
                <div key={c.code} style={{ padding: 20, background: i === 0 ? 'linear-gradient(135deg,var(--gold-mist),var(--bg-warm))' : 'var(--bg-warm)', border: `${i === 0 ? '2px' : '1px'} solid ${i === 0 ? 'var(--gold)' : 'var(--ink-08)'}`, borderRadius: 'var(--r-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 30, lineHeight: 1, marginBottom: 4 }}>{c.flag}</div>
                      <div style={{ fontFamily: 'var(--f-display)', fontSize: 18, fontWeight: 500 }}>{c.name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--f-display)', fontSize: 28, color: i === 0 ? 'var(--gold-deep)' : 'var(--ink)', lineHeight: 1 }}>{c.score}</div>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-50)' }}>Score</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, fontSize: 12 }}>
                    {([['GDP Growth', `${c.gdpGrowthPct}%`],['Ease of Entry', `${c.easeScore}/100`],['Risk', c.riskBand],['Tariffs', c.tariffBand]] as [string,string][]).map(([lbl,val]) => (
                      <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--ink-70)' }}>{lbl}</span>
                        <span style={{ fontFamily: 'var(--f-mono)', fontWeight: 600 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ paddingTop: 10, borderTop: `1px solid ${i === 0 ? 'rgba(201,151,58,.25)' : 'var(--ink-08)'}`, fontSize: 11.5, color: 'var(--ink-70)', fontStyle: 'italic', lineHeight: 1.5 }}>{c.why}</div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10.5, color: 'var(--ink-50)', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--ink-08)' }}>
              Sources: World Bank · IMF · UN Comtrade · OECD
            </div>
          </div>

          <div className="dash-grid-3" style={{ marginBottom: 24 }}>
            <div className="dash-card">
              <div className="dc-label">◈ Revenue Opportunity</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 36, color: 'var(--gold-deep)', lineHeight: 1, marginTop: 4 }}>${report.revenueProjectionUsdM.base}M</div>
              <div style={{ fontSize: 12, color: 'var(--ink-70)', marginTop: 4 }}>Year-2 projection · top market</div>
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--ink-08)' }}>
                {([['Conservative', `$${report.revenueProjectionUsdM.low}M`],['Base case', `$${report.revenueProjectionUsdM.base}M`],['Aggressive', `$${report.revenueProjectionUsdM.high}M`]] as [string,string][]).map(([lbl,val]) => (
                  <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: 'var(--ink-70)' }}>{lbl}</span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="dash-card">
              <div className="dc-label">◈ Key Risks</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {report.risks.map(r => (
                  <div key={r.tag} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: 'var(--bg-warm)', borderRadius: 'var(--r-sm)' }}>
                    <span style={{ fontSize: 12.5, color: 'var(--ink-70)', lineHeight: 1.5 }}>{r.text}</span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, fontWeight: 700, color: SEV_COLOR[r.severity], background: SEV_BG[r.severity], padding: '2px 7px', borderRadius: 3, whiteSpace: 'nowrap' }}>{r.tag}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="dash-card">
              <div className="dc-label">◈ Readiness Profile</div>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {([['Market Fit', report.marketReady],['Financial', report.financialReady],['GTM', report.gtmReady],['Overall', report.readinessScore]] as [string,number][]).map(([lbl,val]) => (
                  <div key={lbl} className="hc-bar-row">
                    <div className="hc-bar-lbl">{lbl}</div>
                    <div className="hc-bar-tr"><div className="hc-bar-fl" style={{ width: `${val}%`, background: 'var(--gold)' }} /></div>
                    <div className="hc-bar-v">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dash-card" style={{ marginBottom: 24, background: 'var(--bg-dark)', color: 'var(--bg)', border: 'none' }}>
            <div className="dc-label" style={{ color: 'var(--gold)' }}>◈ Your Next 3 Moves · tailored to your profile</div>
            <div style={{ marginTop: 14 }}>
              {report.moves.map((m, i) => (
                <div key={m.title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px 0', borderBottom: i < report.moves.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 28, color: 'var(--gold)', lineHeight: 1, flexShrink: 0, width: 36 }}>{i + 1}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: 16, fontWeight: 500, color: '#fff', marginBottom: 4 }}>{m.title}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', lineHeight: 1.65 }}>{m.desc}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10.5, letterSpacing: '.06em', color: 'var(--gold)', marginTop: 6 }}>{m.when}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-card" style={{ padding: 36, textAlign: 'center', background: 'var(--gold-mist)', border: '1.5px solid var(--gold)' }}>
            <div className="eyebrow" style={{ justifyContent: 'center', marginBottom: 12 }}>◈ Unlock the Full Navigator Report</div>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 24, fontWeight: 400, marginBottom: 10 }}>
              Get your <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>90-day Market Entry Playbook</em>
            </h3>
            <p style={{ fontSize: 14, color: 'var(--ink-70)', maxWidth: 520, margin: '0 auto 20px', lineHeight: 1.7 }}>
              Full country scorecard, entry model deep-dive, distributor shortlist, localised pricing, week-by-week execution plan, and board-ready projections.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-gold">Unlock Full Report — from ₹2L <span className="arr">→</span></button>
              <button className="btn-outline" onClick={() => { setReport(null); setStep('landing'); setAssessmentPage(0); }}>Run New Assessment</button>
            </div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-50)', marginTop: 14 }}>Assessment ID: {report.assessmentId}</div>
          </div>

        </div>
      </div>
    </main>
  );
}
