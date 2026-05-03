'use client';

import { useState, useEffect, useRef } from 'react';
import { PlatformNav } from './PlatformNav';
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// â”€â”€ Static data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const API_LAYERS = [
  { num: '01', icon: '[N]', title: 'News & Signals',       src: 'GNews &middot; NewsAPI &middot; Reuters &middot; FT &middot; TechCrunch' },
  { num: '02', icon: '[G]', title: 'Global Markets',       src: 'World Bank &middot; IMF &middot; UN Comtrade &middot; OECD &middot; Eurostat' },
  { num: '03', icon: '[D]', title: 'Demand Trends',        src: 'Google Trends &middot; Our World in Data &middot; GitHub &middot; Reddit' },
  { num: '04', icon: '[C]', title: 'Company Intel',        src: 'OpenCorporates &middot; Open Startup &middot; Product Hunt' },
  { num: '05', icon: '[F]', title: 'Finance Signals',      src: 'Alpha Vantage &middot; Yahoo Finance &middot; SEC EDGAR' },
  { num: '06', icon: '[T]', title: 'Trade & Supply Chain', src: 'UN Comtrade &middot; MarineTraffic &middot; data.gov' },
  { num: '07', icon: '[P]', title: 'Talent & Cost',        src: 'Adzuna &middot; REST Countries' },
  { num: '08', icon: '[L]', title: 'Country Context',      src: 'REST Countries &middot; OpenWeather &middot; ExchangeRate' },
  { num: '09', icon: '[R]', title: 'RSS Automation',       src: 'Feedparser &middot; RSS-to-JSON &middot; Zapier' },
  { num: '10', icon: '[A]', title: 'AI Fusion Layer',      src: 'Claude &middot; Custom ML &middot; Semantic scoring' },
];

const INDUSTRIES = ['FMCG', 'B2B SaaS', 'Healthcare / Pharma', 'Fintech', 'Industrial / Manufacturing', 'Climate / Energy', 'Consumer / D2C', 'Agri / Food', 'EV / Mobility'];
const MARKETS    = [
  { geo: 'UAE',          flag: 'AE' }, { geo: 'USA',       flag: 'US' }, { geo: 'UK',        flag: 'GB' },
  { geo: 'Germany',      flag: 'DE' }, { geo: 'Singapore',  flag: 'SG' }, { geo: 'Vietnam',   flag: 'VN' },
  { geo: 'Indonesia',    flag: 'ID' }, { geo: 'Saudi Arabia', flag: 'SA' }, { geo: 'Japan',   flag: 'JP' },
  { geo: 'Brazil',       flag: 'BR' }, { geo: 'Australia',  flag: 'AU' }, { geo: 'Kenya',     flag: 'KE' },
];
const GOALS = ['Revenue growth', 'Find distributors', 'Raise capital', 'De-risk domestic', 'IPO / M&A prep'];

interface TopCountry {
  code: string; name: string; flag: string; score: number;
  gdpUsdBn: number; gdpGrowthPct: number; easeScore: number;
  riskBand: string; tariffBand: string; why: string;
  fitMultiplier?: number;
}
interface IntelRisk  { tag: string; severity: string; text: string; }
interface IntelMove  { title: string; desc: string; when: string; }
interface IntelReport {
  assessmentId: string; readinessScore: number;
  marketReady: number; financialReady: number; gtmReady: number;
  headline: string; subhead: string; cluster: string;
  topCountries: TopCountry[];
  revenueProjectionUsdM: { low: number; base: number; high: number };
  risks: IntelRisk[]; moves: IntelMove[];
}

const INDUSTRY_API: Record<string, string> = {
  'FMCG': 'FMCG', 'B2B SaaS': 'SaaS', 'Healthcare / Pharma': 'Healthcare',
  'Fintech': 'Fintech', 'Industrial / Manufacturing': 'Industrial',
  'Climate / Energy': 'Climate', 'Consumer / D2C': 'Consumer',
  'Agri / Food': 'Agri', 'EV / Mobility': 'EV',
};

const REVENUE_OPTIONS = [
  'Pre-revenue', '< $500K', '$500K – $2M', '$2M – $10M', '$10M – $50M', '$50M+',
];

const SEVERITY_COLOR: Record<string, string> = {
  rose: 'var(--rose)', amber: 'var(--amber)', sage: 'var(--sage)',
};

type Step = 'input' | 'computing' | 'report';

export function PlatformIntel() {
  const [step, setStep]               = useState<Step>('input');
  const [companyName, setCompanyName] = useState('');
  const [hqCountry, setHqCountry]     = useState('India');
  const [industry, setIndustry]       = useState('B2B SaaS');
  const [revenue, setRevenue]         = useState('$500K – $2M');
  const [model, setModel]             = useState('B2B');
  const [markets, setMarkets]         = useState<string[]>([]);
  const [goal, setGoal]               = useState('Revenue growth');
  const [progress, setProgress]       = useState(0);
  const [report, setReport]           = useState<IntelReport | null>(null);
  const [apiError, setApiError]       = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleMarket = (geo: string) =>
    setMarkets((prev) => prev.includes(geo) ? prev.filter((m) => m !== geo) : prev.length < 3 ? [...prev, geo] : prev);

  const generate = async () => {
    setStep('computing');
    setProgress(0);
    setApiError('');
    let p = 0;
    timerRef.current = setInterval(() => {
      p += Math.random() * 8 + 2;
      if (p < 90) setProgress(Math.round(p));
    }, 400);

    try {
      const payload = {
        companyName: companyName || 'Your Company',
        hqCountry,
        industry: INDUSTRY_API[industry] ?? 'SaaS',
        revenueBand: revenue,
        businessModel: model,
        goal,
        targetGeos: markets,
      };
      const res = await fetch('/api/expansion/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(r => r.json());

      clearInterval(timerRef.current!);

      if (!res.success) throw new Error(res.message ?? 'Request failed');
      if (res.data?.assessmentId) localStorage.setItem('wg_assessment_id', res.data.assessmentId);

      setProgress(100);
      setReport(res.data as IntelReport);
      setTimeout(() => setStep('report'), 400);
    } catch (err) {
      clearInterval(timerRef.current!);
      setApiError(err instanceof Error ? err.message : 'Failed to generate report');
      setStep('input');
    }
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const progressLabel =
    progress < 20 ? '0% · Initialising APIs' :
    progress < 40 ? '20% · Pulling trade signals' :
    progress < 60 ? '40% · Fusing demand data' :
    progress < 80 ? '65% · Running AI scoring' :
    progress < 100 ? '85% · Building your report' : '100% · Complete';

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PlatformNav active="intel" />

      {/* == HERO ====================================================== */}
      <section style={{ padding: '100px 0 60px', background: 'linear-gradient(170deg,var(--bg) 0%,var(--bg-warm) 55%,#ebe6da 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,151,58,.15) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 380px', gap: 56, alignItems: 'center' }}>
            <div>
              <div className="eyebrow anim-1">&#9672; The Bloomberg for Global Expansion</div>
              <h1 className="anim-2" style={{ fontSize: 'clamp(40px,5.8vw,68px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-.02em', margin: '20px 0 18px' }}>
                We don&apos;t give you <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>data.</em><br />
                We tell you <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>where to go,</em><br />
                what to do, <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>how to win.</em>
              </h1>
              <p className="anim-3" style={{ fontSize: 17, color: 'var(--ink-70)', lineHeight: 1.7, maxWidth: 560, fontWeight: 300, marginBottom: 28 }}>
                Ten live intelligence layers &mdash; fusing World Bank, UN Comtrade, Google Trends, IMF, OECD, real-time
                news, and more &mdash; into one decision engine. For leaders ready to scale globally without the guesswork.
              </p>
              <div className="anim-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
                <button className="btn-gold" onClick={() => document.getElementById('intel-assessment')?.scrollIntoView({ behavior: 'smooth' })}>
                  Run Free Intelligence Report <span className="arr">&#8594;</span>
                </button>
                <button className="btn-outline" onClick={() => document.getElementById('intel-layers')?.scrollIntoView({ behavior: 'smooth' })}>
                  See What&apos;s Inside
                </button>
              </div>
              <div className="anim-5" style={{ display: 'flex', gap: 28, flexWrap: 'wrap', paddingTop: 28, borderTop: '1px solid var(--ink-08)' }}>
                <div><div className="hm-val">10</div><div className="hm-lbl">Data Layers</div></div>
                <div><div className="hm-val">48<em>+</em></div><div className="hm-lbl">Countries Modelled</div></div>
                <div><div className="hm-val">7<em>+</em></div><div className="hm-lbl">Decision Engines</div></div>
                <div><div className="hm-val">87<em>%</em></div><div className="hm-lbl">Strategy Success Rate</div></div>
              </div>
            </div>

            {/* Dark live widget */}
            <div className="anim-3" style={{ background: 'var(--bg-dark)', borderRadius: 'var(--r-xl)', padding: 28, color: 'var(--bg)', boxShadow: 'var(--sh-lg)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,var(--gold),#e8b85a,var(--gold))' }} />
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block', animation: 'shimmer 2s infinite' }} />
                LIVE &middot; Intelligence Feed
              </div>
              <h4 style={{ fontFamily: 'var(--f-display)', fontSize: 18, fontWeight: 500, marginBottom: 16, color: '#fff' }}>Today&apos;s Actionable Signals</h4>
              <div>
                <div className="live-signal"><div className="ls-tag">UN COMTRADE</div><div className="ls-text"><strong>UAE imports of FMCG &#8593; 22% YoY.</strong> Indian FMCG should prioritise UAE entry in next 6 months.</div></div>
                <div className="live-signal"><div className="ls-tag">GOOGLE TRENDS</div><div className="ls-text"><strong>SaaS search demand in Vietnam &#8593; 47%.</strong> Window opening for B2B SaaS entry via local distributors.</div></div>
                <div className="live-signal"><div className="ls-tag">GNEWS</div><div className="ls-text"><strong>India&ndash;UAE CEPA phase 2 signed.</strong> Tariffs drop 90% for exporters &mdash; act within Q2.</div></div>
                <div className="live-signal"><div className="ls-tag">IMF DATA</div><div className="ls-text"><strong>Indonesia GDP forecast +5.1% 2026.</strong> Fastest-growing APAC consumer market. Top-3 destination.</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* == 10 API LAYERS ============================================= */}
      <section id="intel-layers" style={{ padding: '100px 0', background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56, maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Intelligence Architecture</div>
            <h2 style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 400, margin: '14px 0' }}>
              Ten data layers,<br />one <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>decision engine.</em>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ink-70)', lineHeight: 1.7 }}>
              Every layer is fused in real time. Nothing is static. Nothing is manually curated. The system thinks with you.
            </p>
          </div>
          <div className="api-grid">
            {API_LAYERS.map((l) => (
              <div className="api-layer" key={l.num}>
                <div className="api-num">{l.num}</div>
                <div className="api-icon">{l.icon}</div>
                <div className="api-title">{l.title}</div>
                <div className="api-src">{l.src}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* == INTELLIGENCE PACKAGES ====================================== */}
      <section style={{ padding: '72px 0', background: 'var(--bg-warm)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Intelligence Packages</div>
            <h2 style={{ fontSize: 'clamp(30px,4.2vw,46px)', fontWeight: 400, margin: '12px 0' }}>
              Choose your package and <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>start the diagnostic.</em>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ink-70)', lineHeight: 1.7, maxWidth: 760, margin: '0 auto' }}>
              Select the depth of analysis you want. Your package controls the breadth of questions, report granularity, and consultation support.
            </p>
          </div>
          <div className="tier-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
            {/* NUCLEUS */}
            <div className="tier-card">
              <div className="tier-label free">Signal Scan</div>
              <div className="tier-title">Nucleus</div>
              <ul className="tier-list">
                <li><span className="tc-ck">&#10003;</span><span>15 core diagnostic questions</span></li>
                <li><span className="tc-ck">&#10003;</span><span>Revenue signal overview</span></li>
                <li><span className="tc-ck">&#10003;</span><span>1 constraint identified</span></li>
                <li><span className="tc-ck">&#10003;</span><span>Executive summary (3 sections)</span></li>
              </ul>
              <div className="tier-price">Free<span className="tc-unit"> No credit card needed</span></div>
              <button className="btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => document.getElementById('intel-assessment')?.scrollIntoView({ behavior: 'smooth' })}>
                Start Free <span className="arr">&#8594;</span>
              </button>
            </div>

            {/* CATALYST */}
            <div className="tier-card">
              <div className="tier-label paid">Diagnostic Deep Dive</div>
              <div className="tier-title">Catalyst</div>
              <ul className="tier-list">
                <li><span className="tc-ck">&#10003;</span><span>35 diagnostic questions</span></li>
                <li><span className="tc-ck">&#10003;</span><span>Revenue engine + funnel</span></li>
                <li><span className="tc-ck">&#10003;</span><span>3 constraints mapped</span></li>
                <li><span className="tc-ck">&#10003;</span><span>6-section report</span></li>
                <li><span className="tc-ck">&#10003;</span><span>Live revenue simulator</span></li>
                <li><span className="tc-ck">&#10003;</span><span>30-min expert strategy call</span></li>
              </ul>
              <div className="tier-price">$99<span className="tc-unit"> One-time &middot; Instant access</span></div>
              <button className="btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                Get Catalyst <span className="arr">&#8594;</span>
              </button>
            </div>

            {/* VANGUARD */}
            <div className="tier-card featured">
              <div className="tier-label paid">Full Intelligence</div>
              <div className="tier-title">Vanguard</div>
              <ul className="tier-list">
                <li><span className="tc-ck">&#10003;</span><span>55 diagnostic questions</span></li>
                <li><span className="tc-ck">&#10003;</span><span>Full 9-section report</span></li>
                <li><span className="tc-ck">&#10003;</span><span>AI follow-up layer (5-8 questions)</span></li>
                <li><span className="tc-ck">&#10003;</span><span>5-year projection</span></li>
                <li><span className="tc-ck">&#10003;</span><span>AS-IS vs TO-BE model</span></li>
                <li><span className="tc-ck">&#10003;</span><span>Valuation estimate</span></li>
                <li><span className="tc-ck">&#10003;</span><span>60-min expert strategy call</span></li>
              </ul>
              <div className="tier-price">$199<span className="tc-unit"> One-time &middot; Instant access</span></div>
              <button className="btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                Get Vanguard <span className="arr">&#8594;</span>
              </button>
            </div>

            {/* APEX */}
            <div className="tier-card">
              <div className="tier-label premium">Boardroom Grade</div>
              <div className="tier-title">Apex</div>
              <ul className="tier-list">
                <li><span className="tc-ck">&#10003;</span><span>All 77+ diagnostic questions</span></li>
                <li><span className="tc-ck">&#10003;</span><span>Full 11-section report</span></li>
                <li><span className="tc-ck">&#10003;</span><span>AI follow-up (8-10 questions)</span></li>
                <li><span className="tc-ck">&#10003;</span><span>Strategic canvas + roadmap</span></li>
                <li><span className="tc-ck">&#10003;</span><span>Must-win battles framework</span></li>
                <li><span className="tc-ck">&#10003;</span><span>Full simulator + projections</span></li>
                <li><span className="tc-ck">&#10003;</span><span>90-min board-level review call</span></li>
              </ul>
              <div className="tier-price">$499<span className="tc-unit"> One-time &middot; Priority access</span></div>
              <button className="btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                Get Apex <span className="arr">&#8594;</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* == INTERACTIVE ASSESSMENT ==================================== */}
      <section id="intel-assessment" style={{ padding: '100px 0', background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Try the Engine Free &middot; 3 minutes</div>
            <h2 style={{ fontSize: 'clamp(30px,4.2vw,48px)', fontWeight: 400, margin: '12px 0' }}>
              Tell us about your company.<br />
              Get your <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>expansion intelligence</em> in 3 minutes.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ink-70)', lineHeight: 1.7 }}>No login required. Full report unlocks immediately.</p>
          </div>

          {/* INPUT */}
          {step === 'input' && (
            <div className="dash-card" style={{ maxWidth: 820, margin: '0 auto', padding: '40px 48px' }}>
              <div className="dc-label">Step 1 of 2 &middot; Company Context</div>
              <div className="field-row">
                <div className="field"><label>Company Name</label><input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your company" /></div>
                <div className="field">
                  <label>HQ Country</label>
                  <select value={hqCountry} onChange={(e) => setHqCountry(e.target.value)}>
                    {['India','United Kingdom','Germany','United States','Singapore','UAE','Other'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Industry</label>
                <div className="chip-group">
                  {INDUSTRIES.map((ind) => <span key={ind} className={`chip${industry === ind ? ' active' : ''}`} onClick={() => setIndustry(ind)}>{ind}</span>)}
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Annual Revenue (USD)</label>
                  <select value={revenue} onChange={(e) => setRevenue(e.target.value)}>
                    {REVENUE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Business Model</label>
                  <select value={model} onChange={(e) => setModel(e.target.value)}>
                    {['B2B','B2C','B2B2C','Marketplace','D2C'].map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Target Markets <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--ink-50)', letterSpacing: 0 }}>(pick up to 3 &mdash; or let us recommend)</span></label>
                <div className="chip-group">
                  {MARKETS.map(({ geo, flag }) => (
                    <span key={geo} className={`chip${markets.includes(geo) ? ' active' : ''}`} onClick={() => toggleMarket(geo)}>{flag} {geo}</span>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Your Primary Expansion Goal</label>
                <div className="chip-group">
                  {GOALS.map((g) => <span key={g} className={`chip${goal === g ? ' active' : ''}`} onClick={() => setGoal(g)}>{g}</span>)}
                </div>
              </div>
              {apiError && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: '#fbe9e7', border: '1px solid #d65a4f', borderRadius: 4, color: '#d65a4f', fontSize: 13 }}>
                  {apiError}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--ink-08)' }}>
                <button className="btn-gold" onClick={generate}>Generate My Intelligence Report <span className="arr">&#8594;</span></button>
              </div>
            </div>
          )}

          {/* COMPUTING */}
          {step === 'computing' && (
            <div className="dash-card" style={{ maxWidth: 680, margin: '0 auto', padding: '60px 48px', textAlign: 'center', background: 'linear-gradient(135deg,var(--bg-dark),#241f18)', color: 'var(--bg)', border: 'none' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid rgba(201,151,58,.25)', borderTopColor: 'var(--gold)', margin: '0 auto 28px', animation: 'spin 1.1s linear infinite' }} />
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>&#9672; Intelligence Engine Running</div>
              <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 26, fontWeight: 400, marginBottom: 14 }}>Fusing 10 data layers...</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', lineHeight: 1.7, marginBottom: 24 }}>Pulling live trade, demand, news &amp; economic signals for your profile...</p>
              <div style={{ maxWidth: 360, margin: '0 auto' }}>
                <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,var(--gold),var(--gold-2))', transition: 'width .4s' }} />
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 10 }}>{progressLabel}</div>
              </div>
            </div>
          )}

          {/* REPORT */}
          {step === 'report' && report && (
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
              {/* Headline */}
              <div className="dash-card" style={{ padding: 40, marginBottom: 24, background: 'linear-gradient(135deg,var(--gold-mist),var(--bg-warm))', borderColor: 'var(--gold)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 40, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
                      <svg viewBox="0 0 200 200" width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="100" cy="100" r="86" fill="none" stroke="rgba(26,24,20,.1)" strokeWidth="14" />
                        <circle cx="100" cy="100" r="86" fill="none" stroke="url(#intelGrad)" strokeWidth="14" strokeLinecap="round" strokeDasharray="540" strokeDashoffset={540 - (540 * report.readinessScore) / 100} />
                        <defs>
                          <linearGradient id="intelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#c9973a" /><stop offset="100%" stopColor="#e8b85a" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <div style={{ fontFamily: 'var(--f-display)', fontSize: 56, fontWeight: 500, lineHeight: 1 }}>{report.readinessScore}</div>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-50)', marginTop: 4 }}>Readiness Score</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 14 }}>&#9672; Your Intelligence Report</div>
                    <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 28, fontWeight: 400, marginBottom: 10, lineHeight: 1.25 }}>{report.headline}</h3>
                    <p style={{ fontSize: 15, color: 'var(--ink-70)', lineHeight: 1.7, marginBottom: 16 }}>{report.subhead}</p>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      {([['Market Ready', report.marketReady], ['Financially Ready', report.financialReady], ['GTM Ready', report.gtmReady]] as [string, number][]).map(([lbl, val]) => (
                        <div key={lbl}>
                          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-50)', marginBottom: 4 }}>{lbl}</div>
                          <div style={{ fontFamily: 'var(--f-display)', fontSize: 22 }}>{val}/100</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Top 3 countries */}
              <div className="dash-card" style={{ marginBottom: 24 }}>
                <div className="dc-label">&#9672; Top 3 Countries To Expand &mdash; ranked for you</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 14 }}>
                  {report.topCountries.slice(0, 3).map((c, i) => (
                    <div key={c.code} style={{ background: i === 0 ? 'linear-gradient(135deg,var(--gold-mist),var(--bg-warm))' : 'var(--bg-warm)', border: `1.5px solid ${i === 0 ? 'var(--gold)' : 'var(--ink-08)'}`, borderRadius: 'var(--r-lg)', padding: 20 }}>
                      {/* Header: flag code + score */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ fontFamily: 'var(--f-display)', fontSize: 28, lineHeight: 1 }}>{c.code}</div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--f-display)', fontSize: 28, color: i === 0 ? 'var(--gold)' : 'var(--ink)', lineHeight: 1 }}>{c.score}</div>
                          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-40)', marginTop: 2 }}>OPP · SCORE</div>
                        </div>
                      </div>
                      {/* Country name */}
                      <div style={{ fontFamily: 'var(--f-display)', fontSize: 18, marginBottom: 14 }}>{c.name}</div>
                      {/* Stats */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, color: 'var(--ink-70)', marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Market size</span><span style={{ fontFamily: 'var(--f-mono)', fontWeight: 600 }}>${c.gdpUsdBn}B</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>GDP growth</span><span style={{ fontFamily: 'var(--f-mono)', fontWeight: 600, color: 'var(--gold-deep)' }}>{c.gdpGrowthPct}%</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Ease of entry</span><span style={{ fontFamily: 'var(--f-mono)', fontWeight: 600 }}>{c.easeScore}/100</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Risk</span><span style={{ fontFamily: 'var(--f-mono)', fontWeight: 600 }}>{c.riskBand}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tariffs</span><span style={{ fontFamily: 'var(--f-mono)', fontWeight: 600 }}>{c.tariffBand}</span></div>
                      </div>
                      {/* Why */}
                      <div style={{ fontSize: 11.5, color: 'var(--ink-70)', fontStyle: 'italic', borderTop: '1px solid var(--ink-08)', paddingTop: 10 }}>{c.why}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10.5, letterSpacing: '.08em', color: 'var(--ink-50)', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--ink-08)' }}>
                  Sources: World Bank Open Data · UN Comtrade · IMF · Google Trends · OECD
                </div>
              </div>

              {/* 3-up analytics */}
              <div className="dash-grid-3">
                <div className="dash-card">
                  <div className="dc-label">&#9672; Revenue Opportunity</div>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 38, color: 'var(--gold)', lineHeight: 1, marginTop: 4 }}>${report.revenueProjectionUsdM.base}M</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-70)', marginTop: 4 }}>Year-2 projection · top market</div>
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--ink-08)' }}>
                    {([['Conservative', `$${report.revenueProjectionUsdM.low}M`], ['Base case', `$${report.revenueProjectionUsdM.base}M`], ['Aggressive', `$${report.revenueProjectionUsdM.high}M`]] as [string, string][]).map(([lbl, val]) => (
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
                    {report.risks.map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12.5, lineHeight: 1.55 }}>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, letterSpacing: '.12em', padding: '3px 8px', borderRadius: 4, background: SEVERITY_COLOR[r.severity] ? `${SEVERITY_COLOR[r.severity]}22` : 'var(--bg-warm)', color: SEVERITY_COLOR[r.severity] ?? 'var(--ink)', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>{r.tag}</span>
                        <span style={{ color: 'var(--ink-70)' }}>{r.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="dash-card">
                  <div className="dc-label">&#9672; Industry Radar</div>
                  {(() => {
                    const top = report.topCountries[0];
                    const fitMult = top?.fitMultiplier ?? 1.0;
                    const radarData = top ? [
                      Math.min(100, top.gdpGrowthPct * 12 + 50),
                      Math.round(top.score * 0.8),
                      Math.round(top.score * fitMult),
                      top.easeScore,
                      Math.round(70 + fitMult * 15),
                    ] : [60, 60, 60, 60, 60];
                    return (
                      <div style={{ height: 180, marginTop: 8 }}>
                        <Radar
                          data={{
                            labels: ['Growth', 'Trade', 'Demand', 'Ease', 'Talent'],
                            datasets: [{
                              label: top?.name ?? '',
                              data: radarData,
                              backgroundColor: 'rgba(201,151,58,.2)',
                              borderColor: '#c9973a',
                              borderWidth: 2,
                              pointBackgroundColor: '#c9973a',
                              pointRadius: 3,
                            }],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                              r: {
                                beginAtZero: true, max: 100,
                                grid: { color: 'rgba(26,24,20,.08)' },
                                angleLines: { color: 'rgba(26,24,20,.08)' },
                                pointLabels: { font: { family: 'Outfit', size: 10 }, color: '#1a1814' },
                                ticks: { display: false },
                              },
                            },
                          }}
                        />
                      </div>
                    );
                  })()}
                  <div style={{ fontSize: 11, color: 'var(--ink-50)', fontFamily: 'var(--f-mono)', marginTop: 8 }}>
                    Growth · Trade flow · Demand · Talent
                  </div>
                </div>
              </div>

              {/* Next 3 moves */}
              <div className="dash-card" style={{ marginBottom: 24, background: 'var(--bg-dark)', color: 'var(--bg)', border: 'none' }}>
                <div className="dc-label" style={{ color: 'var(--gold)' }}>&#9672; Your Next 3 Moves · AI-generated from your profile</div>
                <div style={{ marginTop: 14 }}>
                  {report.moves.map((m, i) => (
                    <div key={i} className="intel-move">
                      <div className="im-step">{String(i + 1).padStart(2, '0')} · {m.when}</div>
                      <div className="im-title">{m.title}</div>
                      <div className="im-desc">{m.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Playbook CTA */}
              <div className="dash-card" style={{ padding: 36, textAlign: 'center', background: 'var(--gold-mist)', border: '1.5px solid var(--gold)', marginBottom: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 14, justifyContent: 'center' }}>&#9672; Unlock the Full Playbook</div>
                <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 26, fontWeight: 400, marginBottom: 12 }}>
                  Get your 90-day <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Market Entry Playbook</em>
                </h3>
                <p style={{ fontSize: 14.5, color: 'var(--ink-70)', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 24px' }}>
                  Full country scorecard, competitive landscape, distributor shortlist, localised pricing model, and week-by-week execution plan.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn-gold">Get Full Report &mdash; from &#8377;2L <span className="arr">&#8594;</span></button>
                  <button className="btn-outline" onClick={() => setStep('input')}>Run New Assessment</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
