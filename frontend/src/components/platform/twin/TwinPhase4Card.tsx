import { memo } from 'react';

type TwinPhase4CardProps = {
  d12Cac: string;
  d13CacEfficiency: string;
  d14Retention: string;
  d15Lifetime: string;
  d16ReferralRate: string;
  d17RevenueConcentration: string;
  d18Cost: string;
  d19CostDriver: string;
  d20FixedCost: string;
  d21ScalingBehavior: string;
  d22Profitability: string;
  d23GrossMargin: string;
  savingPhase4: boolean;
  onD12CacChange: (value: string) => void;
  onD13CacEfficiencyChange: (value: string) => void;
  onD14RetentionChange: (value: string) => void;
  onD15LifetimeChange: (value: string) => void;
  onD16ReferralRateChange: (value: string) => void;
  onD17RevenueConcentrationChange: (value: string) => void;
  onD18CostChange: (value: string) => void;
  onD19CostDriverChange: (value: string) => void;
  onD20FixedCostChange: (value: string) => void;
  onD21ScalingBehaviorChange: (value: string) => void;
  onD22ProfitabilityChange: (value: string) => void;
  onD23GrossMarginChange: (value: string) => void;
  onSavePhase4: () => void;
};

export const TwinPhase4Card = memo(function TwinPhase4Card({
  d12Cac,
  d13CacEfficiency,
  d14Retention,
  d15Lifetime,
  d16ReferralRate,
  d17RevenueConcentration,
  d18Cost,
  d19CostDriver,
  d20FixedCost,
  d21ScalingBehavior,
  d22Profitability,
  d23GrossMargin,
  savingPhase4,
  onD12CacChange,
  onD13CacEfficiencyChange,
  onD14RetentionChange,
  onD15LifetimeChange,
  onD16ReferralRateChange,
  onD17RevenueConcentrationChange,
  onD18CostChange,
  onD19CostDriverChange,
  onD20FixedCostChange,
  onD21ScalingBehaviorChange,
  onD22ProfitabilityChange,
  onD23GrossMarginChange,
  onSavePhase4,
}: TwinPhase4CardProps) {
  return (
    <section className="dash-card" style={{ marginTop: 20 }}>
      <div className="dc-label">Phase 4 · Economics + Cost/Profit</div>
      <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 24, marginBottom: 20 }}>Assess customer economics and profitability trajectory</h2>

      <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 18, margin: '20px 0 14px' }}>Customer Economics</h3>

      <div className="field">
        <label>Average customer acquisition cost (CAC)</label>
        <select value={d12Cac} onChange={(e) => onD12CacChange(e.target.value)}>
          <option value="0">&lt; €50</option>
          <option value="1">€50–€200</option>
          <option value="2">€200–€500</option>
          <option value="3">€500–€1,500</option>
          <option value="4">€1,500–€5,000</option>
          <option value="5">€5,000+</option>
        </select>
      </div>

      <div className="field">
        <label>How does CAC compare to average customer revenue?</label>
        <select value={d13CacEfficiency} onChange={(e) => onD13CacEfficiencyChange(e.target.value)}>
          <option value="0">CAC &gt; 2x annual revenue</option>
          <option value="1">CAC = 1–2x annual revenue</option>
          <option value="2">CAC = 6–12 months revenue</option>
          <option value="3">CAC = 3–6 months revenue</option>
          <option value="4">CAC = 1–3 months revenue</option>
          <option value="5">CAC &lt; 1 month revenue</option>
        </select>
      </div>

      <div className="field-row">
        <div className="field">
          <label>6-month retention rate</label>
          <select value={d14Retention} onChange={(e) => onD14RetentionChange(e.target.value)}>
            <option value="0">&lt; 20%</option>
            <option value="1">20–35%</option>
            <option value="2">35–50%</option>
            <option value="3">50–60%</option>
            <option value="4">60–70%</option>
            <option value="5">70%+</option>
          </select>
        </div>
        <div className="field">
          <label>Average customer lifetime</label>
          <select value={d15Lifetime} onChange={(e) => onD15LifetimeChange(e.target.value)}>
            <option value="0">One-time only</option>
            <option value="1">&lt; 3 months</option>
            <option value="2">3–6 months</option>
            <option value="3">6–12 months</option>
            <option value="4">1–2 years</option>
            <option value="5">2+ years</option>
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Referral / word-of-mouth share of new customers</label>
          <select value={d16ReferralRate} onChange={(e) => onD16ReferralRateChange(e.target.value)}>
            <option value="0">0–5%</option>
            <option value="1">5–15%</option>
            <option value="2">15–25%</option>
            <option value="3">25–40%</option>
            <option value="4">40–55%</option>
            <option value="5">55%+</option>
          </select>
        </div>
        <div className="field">
          <label>Revenue concentration from top 3 customers</label>
          <select value={d17RevenueConcentration} onChange={(e) => onD17RevenueConcentrationChange(e.target.value)}>
            <option value="0">&gt; 80%</option>
            <option value="1">60–80%</option>
            <option value="2">40–60%</option>
            <option value="3">25–40%</option>
            <option value="4">15–25%</option>
            <option value="5">&lt; 15%</option>
          </select>
        </div>
      </div>

      <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 18, margin: '20px 0 14px' }}>Cost, Profitability &amp; Margin</h3>

      <div className="field">
        <label>Total monthly operating cost (burn rate)</label>
        <select value={d18Cost} onChange={(e) => onD18CostChange(e.target.value)}>
          <option value="0">&lt; €10K</option>
          <option value="1">€10K–€30K</option>
          <option value="2">€30K–€60K</option>
          <option value="3">€60K–€120K</option>
          <option value="4">€120K–€250K</option>
          <option value="5">€250K+</option>
        </select>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Largest cost driver</label>
          <select value={d19CostDriver} onChange={(e) => onD19CostDriverChange(e.target.value)}>
            <option value="0">Salaries and people costs</option>
            <option value="1">Marketing and paid acquisition</option>
            <option value="2">Technology and infrastructure</option>
            <option value="3">Product and R&amp;D</option>
            <option value="4">Operations and logistics</option>
            <option value="5">Partner/vendor costs</option>
          </select>
        </div>
        <div className="field">
          <label>% of total costs that are fixed</label>
          <select value={d20FixedCost} onChange={(e) => onD20FixedCostChange(e.target.value)}>
            <option value="0">&lt; 10%</option>
            <option value="1">10–25%</option>
            <option value="2">25–40%</option>
            <option value="3">40–55%</option>
            <option value="4">55–70%</option>
            <option value="5">70%+</option>
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>How costs scale as revenue grows</label>
          <select value={d21ScalingBehavior} onChange={(e) => onD21ScalingBehaviorChange(e.target.value)}>
            <option value="0">Costs grow faster than revenue</option>
            <option value="1">Costs grow at same rate</option>
            <option value="2">Costs grow slightly slower</option>
            <option value="3">Costs grow significantly slower</option>
            <option value="4">Mostly fixed, leverage improving</option>
            <option value="5">Near-zero marginal cost</option>
          </select>
        </div>
        <div className="field">
          <label>Current profitability position</label>
          <select value={d22Profitability} onChange={(e) => onD22ProfitabilityChange(e.target.value)}>
            <option value="0">Burning cash (&gt; 50% loss)</option>
            <option value="1">Burning cash (20–50% loss)</option>
            <option value="2">Burning cash (&lt; 20% loss)</option>
            <option value="3">Around break-even</option>
            <option value="4">Profit margin 1–10%</option>
            <option value="5">Profit margin 10%+</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label>Approximate gross margin</label>
        <select value={d23GrossMargin} onChange={(e) => onD23GrossMarginChange(e.target.value)}>
          <option value="0">Negative gross margin</option>
          <option value="1">0–10%</option>
          <option value="2">10–20%</option>
          <option value="3">20–30%</option>
          <option value="4">30–40%</option>
          <option value="5">40%+</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--ink-08)' }}>
        <button className="btn-primary" type="button" onClick={onSavePhase4} disabled={savingPhase4}>
          {savingPhase4 ? 'Saving...' : 'Save Phase 4'} <span className="arr">→</span>
        </button>
      </div>
    </section>
  );
});
