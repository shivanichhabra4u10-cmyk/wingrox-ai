'use client';

import { useState, useRef } from 'react';
import { PlatformNav } from './PlatformNav';

const SECTORS = [
  'Industrial & Manufacturing', 'B2B SaaS', 'Healthcare & Life Sci.',
  'Fintech', 'Climate / Energy', 'Consumer / D2C', 'Deep Tech / AI', 'Agri / Food',
];

const INTENTS = [
  { key: 'investor',    label: '💰 Investors (Seed / Series A+)' },
  { key: 'distributor', label: '🏭 Distributors & Resellers' },
  { key: 'jv',          label: '🤝 JV / Strategic Partners' },
  { key: 'customer',    label: '🎯 Enterprise Customers' },
  { key: 'advisor',     label: '🧭 Advisors & Mentors' },
  { key: 'hire',        label: '👥 Senior Hires (CRO / VP)' },
  { key: 'accel',       label: '🚀 Accelerators / Programmes' },
  { key: 'gov',         label: '🏛️ Government / Trade Bodies' },
];

const GEOS = [
  { key: 'DACH',     label: '🇩🇪 DACH (DE/AT/CH)' },
  { key: 'BENELUX',  label: '🇳🇱 Benelux' },
  { key: 'UK',       label: '🇬🇧 UK & Ireland' },
  { key: 'NORDICS',  label: '🇸🇪 Nordics' },
  { key: 'FR_IT_ES', label: '🇫🇷 France / Italy / Spain' },
  { key: 'NA',       label: '🇺🇸 North America' },
  { key: 'MENA',     label: '🇦🇪 Middle East' },
  { key: 'APAC',     label: '🇸🇬 APAC / SEA' },
];

const PRIORITIES = [
  'Raise capital', 'Enter new market', 'Grow demand', 'Improve unit economics',
  'Find signature customer', 'Secure distribution', 'Build partnerships',
  'Hire senior team', 'Exit / M&A prep',
];

const REVENUE_OPTIONS = [
  'Pre-revenue', '< $250K', '$250K – $1M', '$1M – $5M', '$5M – $20M', '$20M+',
];

const TIME_OPTIONS = [
  'This week · Morning (IST)', 'This week · Afternoon (IST)',
  'Next week · Morning (IST)', 'Next week · Afternoon (IST)', 'Flexible',
];

interface GeoDistributionItem { geo: string; label: string; flag: string; count: number; pct: number; }
interface TypeBreakdownItem   { type: string; label: string; count: number; pct: number; }
interface MatchCard           { type: string; role: string; mo: string; tags: string[]; score: number; av: string; }

interface MatchResult {
  sessionId: string;
  matchCount: number;
  aiRead: string;
  geoDistribution: GeoDistributionItem[];
  typeBreakdown: TypeBreakdownItem[];
  topMatches: MatchCard[];
}

type MatchStep = 1 | 2 | 3 | 4;

const CARD_SYMBOLS = ['◆', '◇', '▲', '△', '●', '○'];
const STATUS_STEPS = [
  'Analysing compatibility across 42 dimensions…',
  'Scoring investor thesis alignment…',
  'Matching distribution channels…',
  'Running geographic fit engine…',
  'Finalising your partner pool…',
];

function scoreColor(s: number) {
  return s >= 85 ? 'var(--sage)' : s >= 80 ? 'var(--gold)' : 'var(--amber)';
}

export function PlatformMatch() {
  const [step, setStep] = useState<MatchStep>(1);

  const [company,  setCompany]  = useState('');
  const [country,  setCountry]  = useState('India');
  const [sector,   setSector]   = useState('');
  const [stage,    setStage]    = useState('Seed');
  const [revenue,  setRevenue]  = useState('$250K – $1M');
  const [desc,     setDesc]     = useState('');

  const [intents,    setIntents]    = useState<string[]>([]);
  const [geos,       setGeos]       = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [notes,      setNotes]      = useState('');

  const [progress,   setProgress]   = useState(0);
  const [statusText, setStatusText] = useState(STATUS_STEPS[0]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [result,    setResult]    = useState<MatchResult | null>(null);
  const [sessionId, setSessionId] = useState('');

  const [modalOpen,   setModalOpen]   = useState(false);
  const [modalName,   setModalName]   = useState('');
  const [modalEmail,  setModalEmail]  = useState('');
  const [modalTime,   setModalTime]   = useState('Flexible');
  const [booking,     setBooking]     = useState(false);
  const [bookConfirm, setBookConfirm] = useState('');

  const toggle = (key: string, list: string[], setter: (v: string[]) => void) =>
    setter(list.includes(key) ? list.filter(k => k !== key) : [...list, key]);

  const progressLabel =
    progress < 20  ? '0% · initialising'    :
    progress < 40  ? '20% · scanning partners' :
    progress < 60  ? '40% · scoring intent'    :
    progress < 80  ? '65% · geographic fit'    :
    progress < 100 ? '85% · building pool'     : '100% · complete';

  const runMatch = async () => {
    if (intents.length === 0) { alert('Please select at least one partner type.'); return; }
    setStep(3);
    setProgress(0);
    let p = 0;
    let si = 0;
    timerRef.current = setInterval(() => {
      p += Math.random() * 7 + 3;
      if (p < 90) {
        setProgress(Math.round(p));
        const nextSi = Math.min(STATUS_STEPS.length - 1, Math.floor(p / 20));
        if (nextSi !== si) { si = nextSi; setStatusText(STATUS_STEPS[si]); }
      }
    }, 350);

    try {
      const res = await fetch('/api/match/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: { company: company || 'Anonymous Co.', country, sector: sector || 'Industrial', stage, revenue, desc, notes },
          intent: intents, geos, priorities,
        }),
      }).then(r => r.json());

      clearInterval(timerRef.current!);
      if (!res.success) throw new Error('Match API error');
      setProgress(100);
      setResult(res.data as MatchResult);
      setSessionId((res.data as MatchResult).sessionId);
      setTimeout(() => setStep(4), 400);
    } catch {
      clearInterval(timerRef.current!);
      setProgress(100);
      setTimeout(() => setStep(4), 400);
    }
  };

  const bookCall = async () => {
    if (!modalName.trim() || !modalEmail.trim()) { alert('Please enter your name and email.'); return; }
    setBooking(true);
    try {
      const res = await fetch('/api/match/book-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, name: modalName, email: modalEmail, preferredTime: modalTime }),
      }).then(r => r.json());
      const msg = res.success && res.data ? res.data.message : `We'll email <strong>${modalEmail}</strong> within 12 hours.`;
      setBookConfirm(msg);
    } catch {
      setBookConfirm(`We'll email <strong>${modalEmail}</strong> within 12 hours.`);
    } finally {
      setBooking(false);
    }
  };

  const stepLabels = ['Your Profile', 'Intent & Priorities', 'AI Matching', 'Your Matches'];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PlatformNav active="match" />

      <section className="module-hero">
        <div className="container">
          <div className="mh-eyebrow">Layer Ⅲ \xb7 Match Intelligence Engine™</div>
          <h1>Find your <em>next partner,</em><br />investor, or distributor.</h1>
          <p>Tell us your intent and priorities. Our AI scans 8,400+ verified ecosystem partners and returns your top matches — anonymised until you book a Discovery Call.</p>
        </div>
      </section>

      <div className="mod-body">
        <div className="container">

          {/* Stepper */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 36, marginBottom: 36 }}>
            {([1, 2, 3, 4] as MatchStep[]).map((s, i) => {
              const isActive = step === s;
              const isDone   = step > s;
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: isActive || isDone ? 1 : 0.4, transition: 'var(--t)' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600, transition: 'var(--t)',
                    background: isActive ? 'var(--gold)' : isDone ? 'var(--sage)' : 'var(--surface)',
                    border: `2px solid ${isActive ? 'var(--gold)' : isDone ? 'var(--sage)' : 'var(--ink-15)'}`,
                    color: isActive || isDone ? '#fff' : 'var(--ink-50)',
                  }}>{s}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: isActive ? 'var(--gold-deep)' : 'var(--ink-70)' }}>{stepLabels[i]}</div>
                </div>
              );
            })}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="dash-card" style={{ maxWidth: 780, margin: '0 auto', padding: '40px 44px' }}>
              <div className="dc-label">Step 1 of 4 \xb7 Your Profile</div>
              <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 28, fontWeight: 400, margin: '4px 0 8px' }}>
                Tell us about <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>your business.</em>
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--ink-70)', marginBottom: 28 }}>
                Stays confidential. Used only to shape your match pool — never shared with partners until you opt in.
              </p>

              <div className="field-row">
                <div className="field">
                  <label>Company Name *</label>
                  <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Your legal entity" />
                </div>
                <div className="field">
                  <label>HQ Country</label>
                  <select value={country} onChange={e => setCountry(e.target.value)}>
                    {['India','United Kingdom','Germany','Netherlands','France','United States','Singapore','UAE','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Sector</label>
                <div className="chip-group">
                  {SECTORS.map(s => (
                    <span key={s} className={`chip${sector === s ? ' active' : ''}`} onClick={() => setSector(s)}>{s}</span>
                  ))}
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Stage</label>
                  <select value={stage} onChange={e => setStage(e.target.value)}>
                    {['Pre-Seed','Seed','Series A','Series B','Growth / PE'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Annual Revenue (USD)</label>
                  <select value={revenue} onChange={e => setRevenue(e.target.value)}>
                    {REVENUE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>One-line description of what you do</label>
                <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="We help [ICP] achieve [outcome] through [mechanism]." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--ink-08)' }}>
                <button className="btn-primary btn-sm" onClick={() => setStep(2)}>Continue <span className="arr">→</span></button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="dash-card" style={{ maxWidth: 780, margin: '0 auto', padding: '40px 44px' }}>
              <div className="dc-label">Step 2 of 4 \xb7 Intent &amp; Priorities</div>
              <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 28, fontWeight: 400, margin: '4px 0 8px' }}>
                What are you <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>looking for?</em>
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--ink-70)', marginBottom: 28 }}>
                Select one or more partner types. Each selection widens or narrows your match pool.
              </p>

              <div className="field">
                <label>Partner types I&apos;m looking for</label>
                <div className="chip-group">
                  {INTENTS.map(({ key, label }) => (
                    <span key={key} className={`chip${intents.includes(key) ? ' active' : ''}`} onClick={() => toggle(key, intents, setIntents)}>{label}</span>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Target geographies</label>
                <div className="chip-group">
                  {GEOS.map(({ key, label }) => (
                    <span key={key} className={`chip${geos.includes(key) ? ' active' : ''}`} onClick={() => toggle(key, geos, setGeos)}>{label}</span>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Top 3 priorities right now</label>
                <div className="chip-group">
                  {PRIORITIES.map(p => (
                    <span key={p} className={`chip${priorities.includes(p) ? ' active' : ''}`} onClick={() => toggle(p, priorities, setPriorities)}>{p}</span>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>
                  Anything specific you want us to factor in?&nbsp;
                  <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--ink-50)', letterSpacing: 0 }}>(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="E.g. prefer investors with operating experience in DACH industrial SaaS…"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--ink-08)' }}>
                <button className="btn-outline btn-sm" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-primary btn-sm" onClick={runMatch}>Run AI Match <span className="arr">→</span></button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="dash-card" style={{ maxWidth: 680, margin: '0 auto', padding: '72px 44px', textAlign: 'center', background: 'linear-gradient(135deg,var(--bg-dark) 0%,#241f18 100%)', color: 'var(--bg)', border: 'none' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid rgba(201,151,58,.25)', borderTopColor: 'var(--gold)', margin: '0 auto 28px', animation: 'spin 1.1s linear infinite' }} />
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>
                ◈ Match Intelligence Running
              </div>
              <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 30, fontWeight: 400, marginBottom: 14 }}>
                Scanning <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>8,412</em> verified partners…
              </h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', lineHeight: 1.7, marginBottom: 28 }}>{statusText}</p>
              <div style={{ maxWidth: 320, margin: '0 auto' }}>
                <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,var(--gold),var(--gold-2))', transition: 'width .35s' }} />
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 10 }}>{progressLabel}</div>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && result && (
            <div>
              <div className="dash-card" style={{ background: 'linear-gradient(135deg,var(--gold-mist),var(--bg-warm))', borderColor: 'var(--gold)', padding: 40, textAlign: 'center', marginBottom: 32 }}>
                <div className="eyebrow" style={{ marginBottom: 18 }}>◈ Match Complete</div>
                <h2 style={{ fontSize: 'clamp(36px,6vw,56px)', fontWeight: 400, marginBottom: 14 }}>
                  <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{result.matchCount}</em> matches found.
                </h2>
                <p style={{ fontSize: 15.5, color: 'var(--ink-70)', maxWidth: 620, margin: '0 auto 22px', lineHeight: 1.7 }}>
                  Anonymised until you book a Discovery Call. Names, intros, and data-room access unlock after our 30-minute fit validation.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button className="btn-gold" onClick={() => setModalOpen(true)}>Book Discovery Call <span className="arr">→</span></button>
                  <button className="btn-outline" onClick={() => setStep(2)}>Refine Criteria</button>
                </div>
              </div>

              <div className="dash-card" style={{ background: 'var(--bg-dark)', color: 'var(--bg)', border: 'none', marginBottom: 24 }}>
                <div className="dc-label" style={{ color: 'var(--gold)' }}>◈ AI Read on Your Pool</div>
                <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.8)', lineHeight: 1.75, fontStyle: 'italic' }} dangerouslySetInnerHTML={{ __html: result.aiRead }} />
              </div>

              <div className="dash-grid" style={{ marginBottom: 24 }}>
                <div className="dash-card">
                  <div className="dc-label">Geographic Distribution</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 14 }}>
                    {result.geoDistribution.map((g, i) => (
                      <div key={g.geo} style={{ textAlign: 'center', padding: '14px 10px', borderRadius: 'var(--r)', border: `1px solid ${i === 0 ? 'var(--gold)' : 'var(--ink-08)'}`, background: i === 0 ? 'var(--gold-mist)' : 'var(--bg-warm)' }}>
                        <div style={{ fontSize: 22, marginBottom: 4 }}>{g.flag}</div>
                        <div style={{ fontFamily: 'var(--f-display)', fontSize: 24, color: i === 0 ? 'var(--gold-deep)' : 'var(--ink)' }}>{g.count}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-70)', marginTop: 2 }}>{g.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="dash-card">
                  <div className="dc-label">Partner Type Breakdown</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                    {result.typeBreakdown.map(t => (
                      <div key={t.type} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontSize: 12, color: 'var(--ink-70)', width: 120, flexShrink: 0 }}>{t.label}</div>
                        <div style={{ flex: 1, height: 6, background: 'var(--ink-08)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ width: `${t.pct}%`, height: '100%', background: 'var(--gold)', borderRadius: 999 }} />
                        </div>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-50)', width: 24, textAlign: 'right' }}>{t.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="dc-label" style={{ paddingLeft: 4, marginBottom: 14 }}>Top 6 Matches \xb7 Anonymised Preview</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                {result.topMatches.slice(0, 6).map((card, i) => (
                  <div key={i} className="dash-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${card.av}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: card.av, fontWeight: 700, flexShrink: 0 }}>
                        {CARD_SYMBOLS[i % 6]}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-50)', marginBottom: 2 }}>{card.type}</div>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>[Anonymised]</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-70)', marginBottom: 6 }}>{card.role}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-50)', marginBottom: 12 }}>{card.mo}</div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                      {card.tags.map(tag => (
                        <span key={tag} style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, padding: '2px 7px', borderRadius: 4, background: 'var(--bg-warm)', border: '1px solid var(--ink-08)', color: 'var(--ink-70)' }}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--ink-08)' }}>
                      <span style={{ fontSize: 11.5, color: 'var(--ink-50)' }}>Fit Score</span>
                      <span style={{ fontFamily: 'var(--f-display)', fontSize: 20, color: scoreColor(card.score) }}>{card.score}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="dash-card" style={{ marginTop: 28, padding: 32, textAlign: 'center', background: 'var(--gold-mist)', border: '1px solid rgba(201,151,58,.35)' }}>
                <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 26, fontWeight: 400, marginBottom: 8 }}>
                  Ready to <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>meet them?</em>
                </h3>
                <p style={{ fontSize: 14, color: 'var(--ink-70)', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.7 }}>A 30-min Discovery Call validates fit both ways. No obligation. Free. Names unlock only after both sides say yes.</p>
                <button className="btn-gold" onClick={() => setModalOpen(true)}>Book Discovery Call →</button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Discovery Call Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,.75)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-xl)', maxWidth: 540, width: '100%', padding: '44px 40px', position: 'relative', boxShadow: 'var(--sh-xl)' }}>
            <button
              style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--ink-50)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => { setModalOpen(false); setBookConfirm(''); }}
            >✕</button>

            {bookConfirm ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
                <div className="eyebrow" style={{ marginBottom: 12 }}>◈ Discovery Call Booked</div>
                <p style={{ fontSize: 14, color: 'var(--ink-70)', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: bookConfirm }} />
              </div>
            ) : (
              <>
                <div className="eyebrow" style={{ marginBottom: 18 }}>◈ 30-Min Discovery Call \xb7 Free</div>
                <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 30, fontWeight: 400, marginBottom: 12 }}>
                  Meet your <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Match Director.</em>
                </h3>
                <p style={{ fontSize: 14, color: 'var(--ink-70)', lineHeight: 1.7, marginBottom: 24 }}>
                  We validate your fit with the top 3–5 matches, review their appetite, and confirm which side to introduce first.
                </p>
                <div className="field">
                  <label>Your name</label>
                  <input value={modalName} onChange={e => setModalName(e.target.value)} placeholder="Full name" />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input type="email" value={modalEmail} onChange={e => setModalEmail(e.target.value)} placeholder="you@company.com" />
                </div>
                <div className="field">
                  <label>Preferred time</label>
                  <select value={modalTime} onChange={e => setModalTime(e.target.value)}>
                    {TIME_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <button
                  className="btn-gold"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 14, opacity: booking ? 0.7 : 1 }}
                  onClick={bookCall}
                  disabled={booking}
                >
                  {booking ? 'Booking…' : 'Confirm Discovery Call'} <span className="arr">→</span>
                </button>
                <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-50)', marginTop: 12 }}>No credit card \xb7 No obligation \xb7 Names revealed only after both sides say yes</p>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
