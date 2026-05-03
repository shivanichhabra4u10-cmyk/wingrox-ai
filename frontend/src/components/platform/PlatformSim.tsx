'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PlatformNav } from './PlatformNav';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface SimInputs {
  rev: number;     // $K/month
  growth: number;  // decimal e.g. 0.08
  margin: number;  // decimal e.g. 0.68
  burn: number;    // $K/month
  cash: number;    // $K
  cac: number;     // $ per customer
  ltm: number;     // months lifetime
  horizon: number; // months
}

type SimTab = 'topline' | 'bottomline' | 'expansion' | 'runway' | 'fundraise' | 'scenario';

const DEFAULTS: SimInputs = { rev: 80, growth: 0.08, margin: 0.68, burn: 120, cash: 1800, cac: 2400, ltm: 24, horizon: 36 };
const MARKET_MULT: Record<string, number>  = { DE: 1.0, NL: 0.7, UK: 0.85, US: 1.3, SG: 0.6 };
const MODEL_MULT: Record<string, number>   = { dist: 0.6, direct: 1.4, jv: 1.0, license: 0.4 };
const TIME_TO_DEAL: Record<string, number> = { dist: 4, direct: 10, jv: 7, license: 3 };

const TABS: { key: SimTab; icon: string; label: string }[] = [
  { key: 'topline',    icon: '📈', label: 'Top-Line Growth'      },
  { key: 'bottomline', icon: '💰', label: 'Bottom-Line'          },
  { key: 'expansion',  icon: '🌍', label: 'Market Expansion'     },
  { key: 'runway',     icon: '⏱️',  label: 'Cash Runway'          },
  { key: 'fundraise',  icon: '🎯', label: 'Fundraise Timing'     },
  { key: 'scenario',   icon: '⚖️',  label: 'Best / Base / Worst' },
];

function simFmt(v: number): string {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}M`;
  if (v < 1)     return `$${(v * 1000).toFixed(0)}`;
  return `$${v.toFixed(0)}K`;
}

function genRevSeries(I: SimInputs): number[] {
  const arr: number[] = [];
  let r = I.rev;
  for (let i = 0; i <= I.horizon; i++) { arr.push(r); r *= (1 + I.growth); }
  return arr;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let sid = localStorage.getItem('wg_sim_session');
  if (!sid) { sid = 'ss_' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('wg_sim_session', sid); }
  return sid;
}

const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { font: { family: 'Outfit', size: 12 }, color: '#6b6452' } },
    tooltip: {
      callbacks: {
        label: (ctx: any) => ` ${ctx.dataset.label}: ${simFmt(ctx.parsed.y as number)}`,
      },
    },
  },
  scales: {
    x: { ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#9d9080' }, grid: { color: 'rgba(26,24,20,.06)' } },
    y: { ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#9d9080', callback: (v: any) => simFmt(v as number) }, grid: { color: 'rgba(26,24,20,.06)' } },
  },
} as const;

export function PlatformSim() {
  const [inputs,      setInputs]      = useState<SimInputs>(DEFAULTS);
  const [activeTab,   setActiveTab]   = useState<SimTab>('topline');
  const [iterations,  setIterations]  = useState(0);
  const [unlocked,    setUnlocked]    = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [expMarket,   setExpMarket]   = useState('DE');
  const [expModel,    setExpModel]    = useState('dist');
  const [expCapital,  setExpCapital]  = useState(150);

  const lastIterTime  = useRef(0);
  const initialRender = useRef(true);

  useEffect(() => {
    const sid = getSessionId();
    if (localStorage.getItem('wx_sim_unlocked') === '1') setUnlocked(true);
    fetch('/api/sim/last?sessionId=' + sid)
      .then(r => r.json())
      .then(res => {
        if (!res.data) return;
        if (res.data.unlocked) { setUnlocked(true); localStorage.setItem('wx_sim_unlocked', '1'); }
        if (res.data.found && res.data.inputs) {
          const d = res.data.inputs;
          setInputs({ rev: d.revenueK, growth: d.growthPct / 100, margin: d.marginPct / 100, burn: d.burnK, cash: d.cashK, cac: d.cac, ltm: d.ltm, horizon: d.horizonMonths });
        }
      })
      .catch(() => {});
  }, []);

  const checkIteration = useCallback(() => {
    const now = Date.now();
    if (initialRender.current) { initialRender.current = false; return true; }
    if (now - lastIterTime.current < 1200) return true;
    lastIterTime.current = now;
    if (!unlocked && iterations >= 2) { setPaywallOpen(true); return false; }
    setIterations(p => p + 1);
    return true;
  }, [unlocked, iterations]);

  const handleInput = useCallback((key: keyof SimInputs, raw: number) => {
    if (!checkIteration()) return;
    setInputs(prev => {
      const next = { ...prev, [key]: raw };
      const sid = getSessionId();
      fetch('/api/sim/run', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid, inputs: { revenueK: next.rev, growthPct: next.growth * 100, marginPct: next.margin * 100, burnK: next.burn, cashK: next.cash, cac: next.cac, ltm: next.ltm, horizonMonths: next.horizon }, outputs: {} }),
      }).catch(() => {});
      return next;
    });
  }, [checkIteration]);

  const doUnlock = async () => {
    await fetch('/api/sim/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: getSessionId() }) }).catch(() => {});
    setUnlocked(true);
    localStorage.setItem('wx_sim_unlocked', '1');
    setPaywallOpen(false);
  };

  const labels     = Array.from({ length: inputs.horizon + 1 }, (_, i) => `M${i}`);
  const revSeries  = genRevSeries(inputs);

  // Top-Line
  const cumRev        = revSeries.slice(1).reduce((a, b) => a + b, 0);
  const endRev        = revSeries[inputs.horizon];
  const mult          = endRev / inputs.rev;
  const milestoneM    = revSeries.findIndex(r => r * 12 >= 1000);
  const tlInterp      = endRev >= 500
    ? `At current growth, you reach ${simFmt(endRev * 12)} ARR by month ${inputs.horizon}. ${milestoneM > 0 && milestoneM <= inputs.horizon ? `You cross the $1M ARR milestone at month ${milestoneM}.` : ''} ${inputs.growth >= 0.1 ? 'Growth trajectory is strong — consider whether burn rate keeps pace.' : 'Consider levers to accelerate growth above 10% monthly for Series A positioning.'}`
    : `Revenue trajectory is conservative at ${(inputs.growth * 100).toFixed(1)}% monthly growth. Focus on reducing CAC or improving conversion before scaling burn.`;

  // Bottom-Line
  const contrSeries   = revSeries.map(r => r * inputs.margin);
  const netSeries     = contrSeries.map(c => c - inputs.burn);
  const breakevenM    = netSeries.findIndex(n => n >= 0);
  const endProfit     = netSeries[inputs.horizon];
  const ltvCac        = inputs.margin * inputs.ltm;
  const blInterp      = breakevenM > 0 && breakevenM <= inputs.horizon
    ? `You reach contribution break-even at month ${breakevenM}. LTV:CAC of ${ltvCac.toFixed(1)}× ${ltvCac >= 3 ? 'is strong — above the 3× threshold investors expect.' : 'is below the 3× threshold. Extend customer lifetime or reduce CAC.'}`
    : inputs.rev * inputs.margin >= inputs.burn
    ? `Already contribution-positive. End-month profit of ${simFmt(endProfit)} — consider reinvesting in growth.`
    : `Break-even not reached in this horizon. Margin × revenue must exceed burn of ${simFmt(inputs.burn)}/month.`;

  // Expansion
  const marketMult    = MARKET_MULT[expMarket] ?? 1.0;
  const modelMult     = MODEL_MULT[expModel]   ?? 1.0;
  const dealMonth     = TIME_TO_DEAL[expModel] ?? 6;
  const expRevSeries  = revSeries.map((r, i) => i < dealMonth ? 0 : r * marketMult * modelMult * Math.min(1, (i - dealMonth) / 6));
  const y2Rev         = expRevSeries[Math.min(24, inputs.horizon)] * 12;
  const paybackMs     = expCapital > 0 ? Math.ceil(expCapital / (expRevSeries.find(r => r > 0) ?? 1)) : 0;
  const expInterp     = `${expMarket} via ${expModel === 'dist' ? 'distribution' : expModel} entry. First deal expected month ${dealMonth}. Year-2 revenue potential: ${simFmt(y2Rev)}. Capital of $${expCapital}K pays back in ~${paybackMs} months.`;

  // Runway
  let cashBal = inputs.cash;
  const cashSeries: number[] = [cashBal];
  let runwayMs = inputs.horizon;
  for (let i = 1; i <= inputs.horizon; i++) {
    cashBal -= inputs.burn - revSeries[i] * inputs.margin;
    cashSeries.push(Math.max(0, cashBal));
    if (cashBal <= 0 && runwayMs === inputs.horizon) runwayMs = i;
  }
  const cashOutDate   = runwayMs < inputs.horizon
    ? new Date(Date.now() + runwayMs * 30 * 24 * 3600 * 1000).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : '> horizon';
  const burnTrend     = netSeries[inputs.horizon] > netSeries[0] ? '↓ Improving' : '↑ Worsening';
  const rwInterp      = runwayMs < inputs.horizon
    ? `Cash runs out at month ${runwayMs} (${cashOutDate}). Begin fundraising at month ${Math.max(0, runwayMs - 6)} — 6 months before the window closes.`
    : `Strong runway — ${simFmt(inputs.cash)} in bank and net burn is ${burnTrend.includes('Improving') ? 'improving' : 'worsening'}. Raise on your terms, not under pressure.`;

  // Fundraise
  const raiseStart    = Math.max(0, runwayMs - 6);
  const arrAtRaise    = (revSeries[Math.min(raiseStart, inputs.horizon)] ?? inputs.rev) * 12;
  const valMult       = arrAtRaise >= 5000 ? 18 : arrAtRaise >= 2000 ? 14 : arrAtRaise >= 500 ? 10 : 6;
  const frInterp      = `Optimal raise window: month ${raiseStart}. Projected ARR: ${simFmt(arrAtRaise)}. At ${valMult}× ARR, implied valuation is ${simFmt(arrAtRaise * valMult)}. ${arrAtRaise >= 1000 ? 'Series A territory — focus on logo quality and NRR.' : 'Seed positioning — lead with TAM and growth rate.'}`;

  // Scenario
  const bestSeries    = genRevSeries({ ...inputs, growth: inputs.growth * 1.25, margin: inputs.margin * 1.08 });
  const worstSeries   = genRevSeries({ ...inputs, growth: inputs.growth * 0.70, margin: inputs.margin * 0.90 });
  const scInterp      = `Spread at month ${inputs.horizon}: ${simFmt(bestSeries[inputs.horizon] - worstSeries[inputs.horizon])} between best and worst. Biggest lever is growth rate — a 5% monthly uplift adds ${simFmt((genRevSeries({ ...inputs, growth: inputs.growth + 0.05 })[inputs.horizon] - revSeries[inputs.horizon]))} at horizon.`;

  // Iter badge style
  const iterBadge = unlocked ? '∞ Unlocked' : `${iterations} / 2 free iterations`;
  const iterBadgeStyle = unlocked
    ? { background: 'var(--sage-pale)', borderColor: 'var(--sage)', color: 'var(--sage)' }
    : iterations >= 2
    ? { background: 'var(--rose-pale)', borderColor: 'var(--rose)', color: 'var(--rose)' }
    : { background: 'var(--gold-mist)', borderColor: 'rgba(201,151,58,.35)', color: 'var(--gold-deep)' };

  // Sub-components
  const SimRow = ({ id, lbl, val, display, min, max, step, onInput }: {
    id: string; lbl: string; val: number; display: string; min: number; max: number; step: number;
    onInput: (v: number) => void;
  }) => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14, marginBottom: 6 }}>
        <label htmlFor={id} style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 500 }}>{lbl}</label>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--gold)', fontWeight: 600 }}>{display}</span>
      </div>
      <input type="range" id={id} min={min} max={max} step={step} value={val} style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }} onInput={e => onInput(Number((e.target as HTMLInputElement).value))} />
    </>
  );

  const MetricCard = ({ lbl, val, sub }: { lbl: string; val: string; sub?: string }) => (
    <div className="dash-card">
      <div className="dc-label">{lbl}</div>
      <div style={{ fontFamily: 'var(--f-display)', fontSize: 30, color: 'var(--ink)', lineHeight: 1.1, marginTop: 2 }}>{val}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--ink-70)', marginTop: 4 }}>{sub}</div>}
    </div>
  );

  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="dash-card">
      <div className="dc-label">{title}</div>
      <div style={{ height: 260, marginTop: 12 }}>{children}</div>
    </div>
  );

  const InterpCard = ({ text, label = '◈ AI Interpretation', bg = 'var(--gold-mist)', border = 'rgba(201,151,58,.3)', labelColor = 'var(--gold-deep)' }: { text: string; label?: string; bg?: string; border?: string; labelColor?: string }) => (
    <div className="dash-card" style={{ marginTop: 16, background: bg, borderColor: border }}>
      <div className="dc-label" style={{ color: labelColor }}>{label}</div>
      <p style={{ fontSize: 14, color: 'var(--ink-70)', lineHeight: 1.7, fontStyle: 'italic' }}>&quot;{text}&quot;</p>
    </div>
  );

  const chartBase = { responsive: true as const, maintainAspectRatio: false as const };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PlatformNav active="sim" />

      <section className="module-hero">
        <div className="container">
          <div className="mh-eyebrow">Layer Ⅴ · Growth Simulator Suite™</div>
          <h1>Model your <em>future</em> — before you bet on it.</h1>
          <p>Enter your inputs once. Run any scenario: top-line growth, bottom-line, market entry, cash runway, fundraise timing. Every lever is adjustable and every output recomputes in real time.</p>
        </div>
      </section>

      {/* Sticky tab bar */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--ink-08)', position: 'sticky', top: 72, zIndex: 900 }}>
        <div className="container" style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: '16px 20px', fontSize: 13, fontWeight: activeTab === t.key ? 500 : 400, cursor: 'pointer',
                border: 'none', borderBottom: `2px solid ${activeTab === t.key ? 'var(--gold)' : 'transparent'}`,
                background: 'none', color: activeTab === t.key ? 'var(--gold-deep)' : 'var(--ink-70)',
                transition: 'var(--t)', whiteSpace: 'nowrap',
              }}
            >{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      <div className="mod-body">
        <div className="container">

          {/* Iteration badge — floating sticky above grid */}
          <div style={{
            position: 'sticky', top: 140, zIndex: 50, float: 'right',
            padding: '7px 14px', borderRadius: 'var(--r-full)', border: '1px solid',
            fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '.06em', fontWeight: 600,
            marginBottom: -36, marginRight: 8, ...iterBadgeStyle,
          }}>
            {iterBadge}
          </div>

          {/* Main 2-col grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>

            {/* Dark input panel */}
            <div style={{ position: 'sticky', top: 140 }}>
              <div style={{ background: 'var(--bg-dark)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--r-xl)', padding: 28 }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>◈ Your Inputs</div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginBottom: 18, lineHeight: 1.6 }}>Change any lever — all scenarios recompute live.</p>

                <SimRow id="sim-rev"     lbl="Monthly Revenue (USD)"       val={inputs.rev}          display={`$${inputs.rev}K`}                         min={5}   max={1000}  step={5}   onInput={v => handleInput('rev', v)}          />
                <SimRow id="sim-growth"  lbl="Monthly Growth Rate (%)"     val={inputs.growth * 100} display={`${(inputs.growth*100).toFixed(1)}%`}       min={-5}  max={30}    step={0.5} onInput={v => handleInput('growth', v / 100)} />
                <SimRow id="sim-margin"  lbl="Gross Margin (%)"            val={inputs.margin * 100} display={`${(inputs.margin*100).toFixed(0)}%`}       min={20}  max={95}    step={1}   onInput={v => handleInput('margin', v / 100)} />
                <SimRow id="sim-burn"    lbl="Monthly Burn (USD)"          val={inputs.burn}         display={`$${inputs.burn}K`}                         min={20}  max={1500}  step={10}  onInput={v => handleInput('burn', v)}         />
                <SimRow id="sim-cash"    lbl="Cash in Bank (USD)"          val={inputs.cash}         display={simFmt(inputs.cash)}                        min={100} max={15000} step={100} onInput={v => handleInput('cash', v)}         />
                <SimRow id="sim-cac"     lbl="CAC (USD)"                   val={inputs.cac}          display={`$${(inputs.cac/1000).toFixed(1)}K`}        min={100} max={15000} step={100} onInput={v => handleInput('cac', v)}          />
                <SimRow id="sim-ltm"     lbl="Customer Lifetime (months)"  val={inputs.ltm}          display={`${inputs.ltm}`}                            min={3}   max={72}    step={1}   onInput={v => handleInput('ltm', v)}          />
                <SimRow id="sim-horizon" lbl="Time Horizon (months)"       val={inputs.horizon}      display={`${inputs.horizon}`}                        min={6}   max={60}    step={3}   onInput={v => handleInput('horizon', v)}      />

                <button
                  onClick={() => setInputs(DEFAULTS)}
                  style={{ width: '100%', justifyContent: 'center', marginTop: 20, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--r-full)', border: '1px solid rgba(255,255,255,.15)', background: 'none', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
                >↺ Reset Inputs</button>
                <button
                  style={{ width: '100%', justifyContent: 'center', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--r-full)', border: '1px solid rgba(201,151,58,.35)', background: 'none', color: 'var(--gold)', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
                >◈ Save Scenario</button>
              </div>

              {/* Expansion settings (shown only on expansion tab) */}
              {activeTab === 'expansion' && (
                <div className="dash-card" style={{ marginTop: 16, padding: 24 }}>
                  <div className="dc-label" style={{ marginBottom: 14 }}>Expansion Settings</div>
                  <div className="field" style={{ marginBottom: 12 }}>
                    <label>Target Market</label>
                    <select value={expMarket} onChange={e => setExpMarket(e.target.value)}>
                      {Object.keys(MARKET_MULT).map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="field" style={{ marginBottom: 12 }}>
                    <label>Entry Model</label>
                    <select value={expModel} onChange={e => setExpModel(e.target.value)}>
                      <option value="dist">Distribution</option>
                      <option value="direct">Direct Sales</option>
                      <option value="jv">JV / Partnership</option>
                      <option value="license">Licensing</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Entry Capital ($K)</label>
                    <input type="number" value={expCapital} min={0} max={5000} onChange={e => setExpCapital(Number(e.target.value))} />
                  </div>
                </div>
              )}
            </div>

            {/* Output panel */}
            <div>

              {activeTab === 'topline' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
                    <MetricCard lbl="End-of-Horizon Revenue" val={simFmt(endRev)} sub="vs baseline" />
                    <MetricCard lbl="Cumulative Revenue" val={simFmt(cumRev)} sub="Total booked" />
                    <MetricCard lbl="Run Rate Multiple" val={`${mult.toFixed(1)}×`} sub={`Month ${inputs.horizon} vs Month 0`} />
                  </div>
                  <ChartCard title="Revenue Trajectory">
                    <Line {...chartBase} data={{ labels, datasets: [{ label: 'Revenue ($K/mo)', data: revSeries, borderColor: 'var(--gold)', backgroundColor: 'rgba(201,151,58,.08)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 }] }} options={CHART_OPTS} />
                  </ChartCard>
                  <InterpCard text={tlInterp} />
                </>
              )}

              {activeTab === 'bottomline' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
                    <MetricCard lbl="Break-Even Month" val={breakevenM > 0 && breakevenM <= inputs.horizon ? `M${breakevenM}` : 'N/A'} sub="From today" />
                    <MetricCard lbl="End-of-Horizon Profit" val={simFmt(endProfit)} sub="Monthly contribution margin" />
                    <MetricCard lbl="LTV:CAC Ratio" val={`${ltvCac.toFixed(1)}×`} sub="Target > 3.0×" />
                  </div>
                  <ChartCard title="Revenue vs Cost Trajectory">
                    <Line {...chartBase} data={{ labels, datasets: [
                      { label: 'Contribution ($K)', data: contrSeries, borderColor: 'var(--sage)', backgroundColor: 'rgba(56,178,172,.08)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 },
                      { label: 'Burn ($K)',          data: labels.map(() => inputs.burn), borderColor: 'var(--rose)', borderDash: [6, 3], tension: 0, pointRadius: 0, borderWidth: 1.5 },
                    ]}} options={CHART_OPTS} />
                  </ChartCard>
                  <InterpCard text={blInterp} label="◈ Path to Profit" bg="var(--sage-pale)" border="var(--sage)" labelColor="var(--sage)" />
                </>
              )}

              {activeTab === 'expansion' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
                    <MetricCard lbl="Time to First Deal" val={`M${dealMonth}`} sub="From launch" />
                    <MetricCard lbl="Year-2 Revenue" val={simFmt(y2Rev)} sub="Annualised" />
                    <MetricCard lbl="Capital Payback" val={`${paybackMs}mo`} sub="On entry spend" />
                  </div>
                  <ChartCard title={`Market Revenue Trajectory · ${expMarket}`}>
                    <Line {...chartBase} data={{ labels, datasets: [
                      { label: 'Domestic ($K)', data: revSeries,    borderColor: 'var(--ink-40)', tension: 0.3, pointRadius: 0, borderWidth: 1.5, borderDash: [4, 4] },
                      { label: `${expMarket} ($K)`, data: expRevSeries, borderColor: 'var(--gold)', backgroundColor: 'rgba(201,151,58,.08)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 },
                    ]}} options={CHART_OPTS} />
                  </ChartCard>
                  <InterpCard text={expInterp} />
                </>
              )}

              {activeTab === 'runway' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
                    <MetricCard lbl="Runway" val={runwayMs < inputs.horizon ? `${runwayMs}mo` : `>${inputs.horizon}mo`} sub="Until cash-out" />
                    <MetricCard lbl="Cash-Out Date" val={cashOutDate} />
                    <MetricCard lbl="Net Burn Trend" val={burnTrend} />
                  </div>
                  <ChartCard title="Cash Balance Over Time">
                    <Line {...chartBase} data={{ labels, datasets: [{ label: 'Cash Balance ($K)', data: cashSeries, borderColor: cashSeries[cashSeries.length - 1] > 0 ? 'var(--sage)' : 'var(--rose)', backgroundColor: 'rgba(56,178,172,.06)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 }]}} options={CHART_OPTS} />
                  </ChartCard>
                  <InterpCard text={rwInterp} />
                </>
              )}

              {activeTab === 'fundraise' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
                    <MetricCard lbl="Recommended Raise Start" val={`M${raiseStart}`} sub="Optimal window" />
                    <MetricCard lbl="Projected ARR" val={simFmt(arrAtRaise)} sub="At raise date" />
                    <MetricCard lbl="Valuation Multiple" val={`${valMult}×`} sub="ARR" />
                  </div>
                  <ChartCard title="Fundraise Readiness Timeline">
                    <Line {...chartBase} data={{ labels, datasets: [
                      { label: 'Revenue Trajectory ($K)', data: revSeries, borderColor: 'var(--gold)', backgroundColor: 'rgba(201,151,58,.08)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 },
                      { label: 'Raise Window', data: labels.map((_, i) => i === raiseStart ? revSeries[i] : null), borderColor: 'var(--rose)', pointRadius: 8, pointBackgroundColor: 'var(--rose)', showLine: false },
                    ]}} options={CHART_OPTS} />
                  </ChartCard>
                  <InterpCard text={frInterp} />
                </>
              )}

              {activeTab === 'scenario' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
                    <MetricCard lbl="Best Case (+25% growth)" val={simFmt(bestSeries[inputs.horizon])} sub="+8% margin" />
                    <MetricCard lbl="Base Case" val={simFmt(endRev)} sub="Current inputs" />
                    <MetricCard lbl="Worst Case (−30% growth)" val={simFmt(worstSeries[inputs.horizon])} sub="−10% margin" />
                  </div>
                  <ChartCard title="Best / Base / Worst over 36 months">
                    <Line {...chartBase} data={{ labels, datasets: [
                      { label: 'Best Case',  data: bestSeries,  borderColor: 'var(--sage)', tension: 0.3, pointRadius: 0, borderWidth: 2 },
                      { label: 'Base Case',  data: revSeries,   borderColor: 'var(--gold)', tension: 0.3, pointRadius: 0, borderWidth: 2 },
                      { label: 'Worst Case', data: worstSeries, borderColor: 'var(--rose)', tension: 0.3, pointRadius: 0, borderWidth: 2, borderDash: [5, 4] },
                    ]}} options={CHART_OPTS} />
                  </ChartCard>
                  <InterpCard text={scInterp} />
                </>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Paywall modal */}
      {paywallOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,.75)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-xl)', maxWidth: 480, width: '100%', padding: '44px 40px', position: 'relative', boxShadow: 'var(--sh-xl)', textAlign: 'center' }}>
            <button style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--ink-50)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPaywallOpen(false)}>✕</button>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>◈ Free Iterations Used</div>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 26, fontWeight: 400, marginBottom: 12 }}>
              Unlock <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>unlimited</em> scenarios.
            </h3>
            <p style={{ fontSize: 14, color: 'var(--ink-70)', lineHeight: 1.7, marginBottom: 24 }}>You&apos;ve used your 2 free runs. Unlock unlimited modelling for a one-time $10 — saved to your session forever.</p>
            <button className="btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={doUnlock}>
              Unlock for $10 — Unlimited Scenarios <span className="arr">→</span>
            </button>
            <p style={{ fontSize: 11.5, color: 'var(--ink-50)', marginTop: 12 }}>One-time · No subscription · Instant access</p>
          </div>
        </div>
      )}
    </main>
  );
}
