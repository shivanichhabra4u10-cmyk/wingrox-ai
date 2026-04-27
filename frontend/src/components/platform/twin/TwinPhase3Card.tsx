import { memo } from 'react';

type TwinPhase3CardProps = {
  d5Customers: string;
  d6Arpu: string;
  d7Leads: string;
  d8Conversion: string;
  d9Dropoff: string;
  d10GrowthRate: string;
  d11PayingShare: string;
  savingPhase3: boolean;
  onD5CustomersChange: (value: string) => void;
  onD6ArpuChange: (value: string) => void;
  onD7LeadsChange: (value: string) => void;
  onD8ConversionChange: (value: string) => void;
  onD9DropoffChange: (value: string) => void;
  onD10GrowthRateChange: (value: string) => void;
  onD11PayingShareChange: (value: string) => void;
  onSavePhase3: () => void;
};

export const TwinPhase3Card = memo(function TwinPhase3Card({
  d5Customers,
  d6Arpu,
  d7Leads,
  d8Conversion,
  d9Dropoff,
  d10GrowthRate,
  d11PayingShare,
  savingPhase3,
  onD5CustomersChange,
  onD6ArpuChange,
  onD7LeadsChange,
  onD8ConversionChange,
  onD9DropoffChange,
  onD10GrowthRateChange,
  onD11PayingShareChange,
  onSavePhase3,
}: TwinPhase3CardProps) {
  return (
    <section className="dash-card" style={{ marginTop: 20 }}>
      <div className="dc-label">Phase 3 · Demand &amp; Funnel</div>
      <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 24, marginBottom: 20 }}>Map demand and conversion health</h2>

      <div className="field">
        <label>How many active paying customers do you currently have?</label>
        <select value={d5Customers} onChange={(e) => onD5CustomersChange(e.target.value)}>
          <option value="0">0</option>
          <option value="1">1–10</option>
          <option value="2">11–30</option>
          <option value="3">31–75</option>
          <option value="4">76–150</option>
          <option value="5">151–500</option>
        </select>
      </div>

      <div className="field">
        <label>What is your average revenue per customer per month (ARPU)?</label>
        <select value={d6Arpu} onChange={(e) => onD6ArpuChange(e.target.value)}>
          <option value="0">&lt; €50</option>
          <option value="1">€50–€200</option>
          <option value="2">€200–€500</option>
          <option value="3">€500–€1,500</option>
          <option value="4">€1,500–€5,000</option>
          <option value="5">€5,000+</option>
        </select>
      </div>

      <div className="field">
        <label>How many new leads do you generate each month?</label>
        <select value={d7Leads} onChange={(e) => onD7LeadsChange(e.target.value)}>
          <option value="0">&lt; 20 leads</option>
          <option value="1">20–50 leads</option>
          <option value="2">50–150 leads</option>
          <option value="3">150–500 leads</option>
          <option value="4">500–1,500 leads</option>
          <option value="5">1,500+ leads</option>
        </select>
      </div>

      <div className="field">
        <label>What percentage of leads convert into paying customers?</label>
        <select value={d8Conversion} onChange={(e) => onD8ConversionChange(e.target.value)}>
          <option value="0">&lt; 0.5%</option>
          <option value="1">0.5–1.5%</option>
          <option value="2">1.5–3%</option>
          <option value="3">3–6%</option>
          <option value="4">6–10%</option>
          <option value="5">10%+</option>
        </select>
      </div>

      <div className="field">
        <label>Where does the majority of funnel drop-off occur?</label>
        <select value={d9Dropoff} onChange={(e) => onD9DropoffChange(e.target.value)}>
          <option value="0">Awareness → Interest</option>
          <option value="1">Interest → Engagement</option>
          <option value="2">Engagement → Qualification</option>
          <option value="3">Qualification → Proposal</option>
          <option value="4">Proposal → Close</option>
          <option value="5">Onboarding → Active Use</option>
        </select>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Customer base monthly growth rate</label>
          <select value={d10GrowthRate} onChange={(e) => onD10GrowthRateChange(e.target.value)}>
            <option value="0">Declining</option>
            <option value="1">0–3%</option>
            <option value="2">3–7%</option>
            <option value="3">7–12%</option>
            <option value="4">12–20%</option>
            <option value="5">20%+</option>
          </select>
        </div>
        <div className="field">
          <label>What % of total users are paying customers?</label>
          <select value={d11PayingShare} onChange={(e) => onD11PayingShareChange(e.target.value)}>
            <option value="0">0%</option>
            <option value="1">1–5%</option>
            <option value="2">5–10%</option>
            <option value="3">10–20%</option>
            <option value="4">20–35%</option>
            <option value="5">35%+</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--ink-08)' }}>
        <button className="btn-primary" type="button" onClick={onSavePhase3} disabled={savingPhase3}>
          {savingPhase3 ? 'Saving...' : 'Save Phase 3'} <span className="arr">→</span>
        </button>
      </div>
    </section>
  );
});
