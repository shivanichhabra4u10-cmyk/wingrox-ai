'use client';

import { useState, useEffect, useRef } from 'react';
import { PlatformNav } from './PlatformNav';

// ── Maps ──────────────────────────────────────────────────────────────────────

const INDUSTRY_MAP: Record<string, string> = {
  'FMCG': 'FMCG', 'B2B SaaS': 'SaaS', 'Healthcare / Pharma': 'Healthcare',
  'Fintech': 'Fintech', 'Industrial / Manufacturing': 'Industrial',
  'Climate / Energy': 'Climate', 'Consumer / D2C': 'Consumer',
  'Agri / Food': 'Agri', 'EV / Mobility': 'EV',
};

const MARKET_CODE_MAP: Record<string, string> = {
  'UAE': 'UAE', 'USA': 'US', 'UK': 'UK', 'Germany': 'DE',
  'Singapore': 'SG', 'Vietnam': 'VN', 'Indonesia': 'ID',
  'Saudi Arabia': 'SA', 'Japan': 'JP', 'Brazil': 'BR', 'Australia': 'AU', 'Kenya': 'KE',
};

// ── Static data ───────────────────────────────────────────────────────────────

const ENTRY_MODELS = [
  { id: 'distributor', label: 'Distributor-Led', icon: '🤝', tag: 'Fastest to market', desc: 'Partner-driven entry. Lowest capital, fastest first deal.' },
  { id: 'direct',      label: 'Direct Entry',   icon: '🏢', tag: 'Highest ceiling',   desc: 'Own entity, team, and IP. Maximum long-term upside.' },
  { id: 'jv',          label: 'Joint Venture',  icon: '🤲', tag: 'Balanced risk',     desc: 'Share risk and investment with a strong local partner.' },
  { id: 'licensing',   label: 'Licensing',      icon: '📋', tag: 'Asset-light',       desc: 'IP-led market access with minimal capital required.' },
];

const PILLARS = [
  { icon: '📊', color: '#c9973a', title: 'Market Fit',        desc: 'Demand signals, competitive intensity, sector maturity, TAM' },
  { icon: '💰', color: '#9a7028', title: 'Financial Readiness', desc: 'Capital requirements, ROI timeline, burn rate, currency risk' },
  { icon: '🎯', color: '#3d6b40', title: 'GTM Strategy',       desc: 'Entry model fit, pricing architecture, distribution channels' },
  { icon: '⚖️', color: '#3a4f6b', title: 'Regulatory & Ops',   desc: 'Entity setup, compliance burden, HR complexity, supply chain' },
];

const INDUSTRIES = [
  'FMCG', 'B2B SaaS', 'Healthcare / Pharma', 'Fintech',
  'Industrial / Manufacturing', 'Climate / Energy', 'Consumer / D2C', 'Agri / Food', 'EV / Mobility',
];
const MARKETS = [
  { geo: 'UAE',          flag: '🇦🇪' }, { geo: 'USA',          flag: '🇺🇸' }, { geo: 'UK',        flag: '🇬🇧' },
  { geo: 'Germany',      flag: '🇩🇪' }, { geo: 'Singapore',    flag: '🇸🇬' }, { geo: 'Vietnam',   flag: '🇻🇳' },
  { geo: 'Indonesia',    flag: '🇮🇩' }, { geo: 'Saudi Arabia', flag: '🇸🇦' }, { geo: 'Japan',     flag: '🇯🇵' },
  { geo: 'Brazil',       flag: '🇧🇷' }, { geo: 'Australia',    flag: '🇦🇺' }, { geo: 'Kenya',     flag: '🇰🇪' },
];
const GOALS = ['Revenue growth', 'Find distributors', 'Raise capital', 'De-risk domestic', 'IPO / M&A prep'];

// ── Types ─────────────────────────────────────────────────────────────────────

type ApiCountry = {
  code: string; name: string; flag: string; score: number;
  gdpUsdBn: number; gdpGrowthPct: number; easeScore: number;
  riskBand: string; tariffBand: string; currency: string;
  fitMultiplier: number; why: string;
};
type ApiRisk   = { tag: string; text: string; severity: 'rose' | 'amber' | 'sage' };
type ApiMove   = { title: string; desc: string; when: string };
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

type Step = 'input' | 'computing' | 'report';

// ── Trajectory sparkline ──────────────────────────────────────────────────────

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

const SEV_COLOR: Record<string, string> = { rose: 'var(--rose)', amber: 'var(--amber)', sage: 'var(--sage)' };
const SEV_BG:    Record<string, string> = { rose: 'var(--rose-pale)', amber: 'var(--amber-pale)', sage: 'var(--sage-pale)' };

// ── Main component ────────────────────────────────────────────────────────────

export function ExpansionNavigator() {
  const [step,          setStep]          = useState<Step>('input');
  const [companyName,   setCompanyName]   = useState('');
  const [hqCountry,     setHqCountry]     = useState('India');
  const [industry,      setIndustry]      = useState('B2B SaaS');
  const [revenue,       setRevenue]       = useState('$500K – $2M');
  const [bizModel,      setBizModel]      = useState('B2B');
  const [markets,       setMarkets]       = useState<string[]>([]);
  const [goal,          setGoal]          = useState('Revenue growth');
  const [entryModel,    setEntryModel]    = useState('distributor');
  const [entryCapital,  setEntryCapital]  = useState(150);
  const [email,         setEmail]         = useState('');
  const [progress,      setProgress]      = useState(0);
  const [report,        setReport]        = useState<ApiReport | null>(null);
  const [error,         setError]         = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleMarket = (geo: string) =>
    setMarkets(prev => prev.includes(geo) ? prev.filter(m => m !== geo) : prev.length < 3 ? [...prev, geo] : prev);

  const generate = async () => {
    if (!companyName.trim()) { setError('Please enter your company name.'); return; }
    setError(null);
    setStep('computing');
    setProgress(0);
    let p = 0;
    timerRef.current = setInterval(() => {
      p = Math.min(p + Math.random() * 9 + 2, 90);
      setProgress(p);
    }, 380);
    try {
      const res = await fetch('/api/expansion/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName:     companyName.trim(),
          hqCountry,
          industry:        INDUSTRY_MAP[industry] ?? 'SaaS',
          revenueBand:     revenue,
          businessModel:   bizModel,
          goal,
          targetGeos:      markets.map(m => MARKET_CODE_MAP[m]).filter(Boolean),
          entryModel,
          entryCapitalUsdK: entryCapital,
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
      setStep('input');
    }
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const progressLabel =
    progress < 20  ? 'Analysing market fit...'              :
    progress < 40  ? 'Scoring regulatory landscape...'      :
    progress < 60  ? 'Computing entry model economics...'   :
    progress < 80  ? 'Building revenue trajectory...'       :
    progress < 100 ? 'Finalising readiness report...'       : 'Complete';

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PlatformNav active="expansion" />

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 0 60px', background: 'linear-gradient(170deg,var(--bg) 0%,var(--bg-warm) 55%,var(--gold-mist) 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,151,58,.12) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 360px', gap: 56, alignItems: 'center' }}>
            <div>
              <div className="eyebrow anim-1">&#9672; Scale Navigator &middot; Global Entry Intelligence</div>
              <h1 className="anim-2" style={{ fontSize: 'clamp(38px,5.5vw,64px)', fontWeight: 400, lineHeight: 1.06, letterSpacing: '-.02em', margin: '20px 0 18px' }}>
                Is your company <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>truly ready</em><br />
                to scale globally?
              </h1>
              <p className="anim-3" style={{ fontSize: 17, color: 'var(--ink-70)', lineHeight: 1.7, maxWidth: 540, fontWeight: 300, marginBottom: 28 }}>
                The Scale Navigator scores your business across market fit, financial readiness, GTM strategy, and regulatory complexity &mdash; then maps your optimal entry path, country by country.
              </p>
              <div className="anim-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
                <button
                  className="btn-gold"
                  onClick={() => document.getElementById('nav-assessment')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Run Readiness Assessment <span className="arr">&#8594;</span>
                </button>
                <button className="btn-outline" onClick={() => document.getElementById('nav-pillars')?.scrollIntoView({ behavior: 'smooth' })}>
                  How It Works
                </button>
              </div>
              <div className="anim-5" style={{ display: 'flex', gap: 28, flexWrap: 'wrap', paddingTop: 28, borderTop: '1px solid var(--ink-08)' }}>
                <div><div className="hm-val" style={{ fontFamily: 'var(--f-display)', fontSize: 34, fontWeight: 500, lineHeight: 1 }}>48<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>+</em></div><div className="hm-lbl">Countries Scored</div></div>
                <div><div className="hm-val" style={{ fontFamily: 'var(--f-display)', fontSize: 34, fontWeight: 500, lineHeight: 1 }}>4</div><div className="hm-lbl">Entry Models</div></div>
                <div><div className="hm-val" style={{ fontFamily: 'var(--f-display)', fontSize: 34, fontWeight: 500, lineHeight: 1 }}>12</div><div className="hm-lbl">Readiness Dimensions</div></div>
                <div><div className="hm-val" style={{ fontFamily: 'var(--f-display)', fontSize: 34, fontWeight: 500, lineHeight: 1 }}>87<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>%</em></div><div className="hm-lbl">Success Rate</div></div>
              </div>
            </div>

            {/* Dark info widget */}
            <div className="anim-3" style={{ background: 'var(--bg-dark)', borderRadius: 'var(--r-xl)', padding: 28, color: 'var(--bg)', boxShadow: 'var(--sh-lg)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,var(--gold),var(--gold-2),var(--gold))' }} />
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>&#9672; SCALE NAVIGATOR</div>
              <h4 style={{ fontFamily: 'var(--f-display)', fontSize: 16, fontWeight: 500, marginBottom: 16, color: '#fff' }}>What We Score</h4>
              {[
                ['Market Fit',        'Demand signals + competitive density'],
                ['Financial Readiness','Capital needs + ROI timeline'],
                ['GTM Strategy',      'Entry model + distribution match'],
                ['Regulatory & Ops',  'Compliance burden + entity complexity'],
              ].map(([title, desc]) => (
                <div key={title} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 2 }}>{title}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{desc}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(201,151,58,.25)', color: 'var(--gold)' }}>LIVE</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ PILLARS ═════════════════════════════════════════════════════════ */}
      <section id="nav-pillars" style={{ padding: '80px 0', background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Readiness Architecture</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 400, margin: '14px 0' }}>
              Four dimensions,<br /><em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>one verdict.</em>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ink-70)', lineHeight: 1.7 }}>
              Every dimension is scored against live data. Your readiness cluster determines your recommended entry path.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {PILLARS.map(p => (
              <div key={p.title} className="dash-card" style={{ padding: '28px 24px', borderTop: `3px solid ${p.color}` }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{p.icon}</div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 18, fontWeight: 500, marginBottom: 8 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-70)', lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ASSESSMENT ══════════════════════════════════════════════════════ */}
      <section id="nav-assessment" style={{ padding: '100px 0', background: 'var(--bg-warm)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 680, marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Scale Navigator &middot; Free &middot; 3 minutes</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 400, margin: '14px 0' }}>
              Tell us about your company.<br />
              Get your <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>readiness verdict</em> instantly.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ink-70)', lineHeight: 1.7 }}>No login required. Full readiness report unlocks immediately.</p>
          </div>

          {/* ── INPUT ── */}
          {step === 'input' && (
            <div className="dash-card" style={{ maxWidth: 880, margin: '0 auto', padding: '40px 48px' }}>
              <div className="dc-label">Company Context</div>

              <div className="field-row">
                <div className="field">
                  <label>Company Name</label>
                  <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your company" />
                </div>
                <div className="field">
                  <label>HQ Country</label>
                  <select value={hqCountry} onChange={e => setHqCountry(e.target.value)}>
                    {['India','United Kingdom','Germany','United States','Singapore','UAE','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Industry</label>
                <div className="chip-group">
                  {INDUSTRIES.map(ind => (
                    <span key={ind} className={`chip${industry === ind ? ' active' : ''}`} onClick={() => setIndustry(ind)}>{ind}</span>
                  ))}
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Annual Revenue (USD)</label>
                  <select value={revenue} onChange={e => setRevenue(e.target.value)}>
                    {['Pre-revenue','< $500K','$500K – $2M','$2M – $10M','$10M – $50M','$50M+'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Business Model</label>
                  <select value={bizModel} onChange={e => setBizModel(e.target.value)}>
                    {['B2B','B2C','B2B2C','Marketplace','D2C'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Target Markets <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--ink-50)', letterSpacing: 0 }}>(pick up to 3 &mdash; or we recommend)</span></label>
                <div className="chip-group">
                  {MARKETS.map(({ geo, flag }) => (
                    <span key={geo} className={`chip${markets.includes(geo) ? ' active' : ''}`} onClick={() => toggleMarket(geo)}>{flag} {geo}</span>
                  ))}
                </div>
              </div>

              {/* Entry model cards */}
              <div className="field">
                <label>Preferred Entry Model</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 8 }}>
                  {ENTRY_MODELS.map(em => (
                    <div
                      key={em.id}
                      onClick={() => setEntryModel(em.id)}
                      style={{
                        padding: '16px 14px', borderRadius: 'var(--r-lg)', cursor: 'pointer', transition: 'var(--t)',
                        border: `2px solid ${entryModel === em.id ? 'var(--gold)' : 'var(--ink-08)'}`,
                        background: entryModel === em.id ? 'var(--gold-mist)' : 'var(--surface)',
                      }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{em.icon}</div>
                      <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, fontWeight: 500, marginBottom: 3, color: entryModel === em.id ? 'var(--gold-deep)' : 'var(--ink)' }}>{em.label}</div>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold-deep)', marginBottom: 6 }}>{em.tag}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-70)', lineHeight: 1.5 }}>{em.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Entry Capital Budget</label>
                  <input
                    type="number" value={entryCapital} min={10} max={50000}
                    onChange={e => setEntryCapital(Number(e.target.value))}
                    placeholder="150"
                  />
                  <div style={{ fontSize: 11, color: 'var(--ink-50)', marginTop: 4 }}>In USD thousands &mdash; e.g. 150 = $150K</div>
                </div>
                <div className="field">
                  <label>Primary Expansion Goal</label>
                  <div className="chip-group">
                    {GOALS.map(g => (
                      <span key={g} className={`chip${goal === g ? ' active' : ''}`} onClick={() => setGoal(g)}>{g}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="field">
                <label>Email <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--ink-50)', letterSpacing: 0 }}>(optional &mdash; we&apos;ll send your report)</span></label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
              </div>

              {error && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--rose-pale)', border: '1px solid var(--rose)', borderRadius: 'var(--r-sm)', color: 'var(--rose)', fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--ink-08)' }}>
                <button className="btn-gold" onClick={generate}>
                  Run My Readiness Assessment <span className="arr">&#8594;</span>
                </button>
              </div>
            </div>
          )}

          {/* ── COMPUTING ── */}
          {step === 'computing' && (
            <div className="dash-card" style={{ maxWidth: 640, margin: '0 auto', padding: '60px 48px', textAlign: 'center', background: 'linear-gradient(135deg,var(--bg-dark),#2a2515)', color: 'var(--bg)', border: 'none' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid rgba(201,151,58,.25)', borderTopColor: 'var(--gold)', margin: '0 auto 28px', animation: 'spin 1.1s linear infinite' }} />
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>&#9672; Scale Navigator Running</div>
              <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 24, fontWeight: 400, marginBottom: 12 }}>Scoring your readiness...</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', lineHeight: 1.7, marginBottom: 24 }}>{progressLabel}</p>
              <div style={{ maxWidth: 360, margin: '0 auto' }}>
                <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,var(--gold),var(--gold-2))', transition: 'width .4s' }} />
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 8 }}>{Math.round(progress)}%</div>
              </div>
            </div>
          )}

          {/* ── REPORT ── */}
          {step === 'report' && report && (
            <div style={{ maxWidth: 960, margin: '0 auto' }}>

              {/* Score headline */}
              <div className="dash-card" style={{ padding: 40, marginBottom: 24, background: 'linear-gradient(135deg,var(--gold-mist),var(--bg-warm))', borderColor: 'var(--gold)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 40, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto' }}>
                      <svg viewBox="0 0 200 200" width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="100" cy="100" r="86" fill="none" stroke="rgba(201,151,58,.1)" strokeWidth="14" />
                        <circle
                          cx="100" cy="100" r="86" fill="none"
                          stroke="url(#navScoreGrad)" strokeWidth="14" strokeLinecap="round"
                          strokeDasharray="540"
                          strokeDashoffset={540 - (540 * report.readinessScore) / 100}
                          style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(.4,0,.2,1)' }}
                        />
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
                    <div className="eyebrow" style={{ marginBottom: 12 }}>&#9672; Your Readiness Report &middot; {report.cluster}</div>
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

              {/* Entry model analysis + trajectory */}
              {report.trajectory?.length > 0 && (
                <div className="dash-card" style={{ marginBottom: 24 }}>
                  <div className="dc-label" style={{ marginBottom: 16 }}>
                    &#9672; Entry Model Analysis &middot; {ENTRY_MODELS.find(e => e.id === report.entryModel)?.label ?? report.entryModel}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
                    {([
                      ['Time to First Deal', `Month ${report.timeToDealMonths}`, 'After entry'],
                      ['Year-2 Revenue Run Rate', `$${(report.trajectory[23] ?? 0).toFixed(1)}K/mo`, 'Monthly by month 24'],
                      ['Capital Payback', `${report.paybackMonths} months`, 'On entry budget'],
                    ] as [string, string, string][]).map(([label, val, sub]) => (
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

              {/* Top 3 countries */}
              <div className="dash-card" style={{ marginBottom: 24 }}>
                <div className="dc-label">&#9672; Top 3 Markets &mdash; ranked for your profile</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 14 }}>
                  {report.topCountries.slice(0, 3).map((c, i) => (
                    <div key={c.code} style={{
                      padding: 20,
                      background: i === 0 ? 'linear-gradient(135deg,var(--gold-mist),var(--bg-warm))' : 'var(--bg-warm)',
                      border: `${i === 0 ? '2px' : '1px'} solid ${i === 0 ? 'var(--gold)' : 'var(--ink-08)'}`,
                      borderRadius: 'var(--r-lg)',
                    }}>
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
                        {([['GDP Growth', `${c.gdpGrowthPct}%`], ['Ease of Entry', `${c.easeScore}/100`], ['Risk', c.riskBand], ['Tariffs', c.tariffBand]] as [string,string][]).map(([lbl, val]) => (
                          <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--ink-70)' }}>{lbl}</span>
                            <span style={{ fontFamily: 'var(--f-mono)', fontWeight: 600 }}>{val}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ paddingTop: 10, borderTop: `1px solid ${i === 0 ? 'rgba(201,151,58,.25)' : 'var(--ink-08)'}`, fontSize: 11.5, color: 'var(--ink-70)', fontStyle: 'italic', lineHeight: 1.5 }}>
                        {c.why}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10.5, color: 'var(--ink-50)', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--ink-08)' }}>
                  Sources: World Bank &middot; IMF &middot; UN Comtrade &middot; OECD
                </div>
              </div>

              {/* 3-up: revenue / risks / readiness bars */}
              <div className="dash-grid-3" style={{ marginBottom: 24 }}>
                <div className="dash-card">
                  <div className="dc-label">&#9672; Revenue Opportunity</div>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 36, color: 'var(--gold-deep)', lineHeight: 1, marginTop: 4 }}>${report.revenueProjectionUsdM.base}M</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-70)', marginTop: 4 }}>Year-2 projection &middot; top market</div>
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--ink-08)' }}>
                    {([['Conservative', `$${report.revenueProjectionUsdM.low}M`], ['Base case', `$${report.revenueProjectionUsdM.base}M`], ['Aggressive', `$${report.revenueProjectionUsdM.high}M`]] as [string,string][]).map(([lbl, val]) => (
                      <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                        <span style={{ color: 'var(--ink-70)' }}>{lbl}</span>
                        <span style={{ fontFamily: 'var(--f-mono)', fontWeight: 600 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dash-card">
                  <div className="dc-label">&#9672; Key Risks</div>
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
                  <div className="dc-label">&#9672; Readiness Profile</div>
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {([['Market Fit', report.marketReady], ['Financial', report.financialReady], ['GTM', report.gtmReady], ['Overall', report.readinessScore]] as [string,number][]).map(([lbl, val]) => (
                      <div key={lbl} className="hc-bar-row">
                        <div className="hc-bar-lbl">{lbl}</div>
                        <div className="hc-bar-tr"><div className="hc-bar-fl" style={{ width: `${val}%`, background: 'var(--gold)' }} /></div>
                        <div className="hc-bar-v">{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Next 3 moves */}
              <div className="dash-card" style={{ marginBottom: 24, background: 'var(--bg-dark)', color: 'var(--bg)', border: 'none' }}>
                <div className="dc-label" style={{ color: 'var(--gold)' }}>&#9672; Your Next 3 Moves &middot; tailored to your profile</div>
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

              {/* Upgrade CTA */}
              <div className="dash-card" style={{ padding: 36, textAlign: 'center', background: 'var(--gold-mist)', border: '1.5px solid var(--gold)' }}>
                <div className="eyebrow" style={{ justifyContent: 'center', marginBottom: 12 }}>&#9672; Unlock the Full Navigator Report</div>
                <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 24, fontWeight: 400, marginBottom: 10 }}>
                  Get your <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>90-day Market Entry Playbook</em>
                </h3>
                <p style={{ fontSize: 14, color: 'var(--ink-70)', maxWidth: 520, margin: '0 auto 20px', lineHeight: 1.7 }}>
                  Full country scorecard, entry model deep-dive, distributor shortlist, localised pricing, week-by-week execution plan, and board-ready projections.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn-gold">
                    Unlock Full Report &mdash; from &#8377;2L <span className="arr">&#8594;</span>
                  </button>
                  <button className="btn-outline" onClick={() => { setReport(null); setStep('input'); }}>Run New Assessment</button>
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-50)', marginTop: 14 }}>Assessment ID: {report.assessmentId}</div>
              </div>

            </div>
          )}
        </div>
      </section>
    </main>
  );
}
