import { memo } from 'react';

type TwinPhase2CardProps = {
  companyName: string;
  companyWebsite: string;
  companyCountry: string;
  companyIndustry: string;
  companyStage: string;
  d1Revenue: string;
  d2Growth: string;
  d3Recurring: string;
  d4Mix: string;
  savingProgress: boolean;
  onCompanyNameChange: (value: string) => void;
  onCompanyWebsiteChange: (value: string) => void;
  onCompanyCountryChange: (value: string) => void;
  onCompanyIndustryChange: (value: string) => void;
  onCompanyStageChange: (value: string) => void;
  onD1RevenueChange: (value: string) => void;
  onD2GrowthChange: (value: string) => void;
  onD3RecurringChange: (value: string) => void;
  onD4MixChange: (value: string) => void;
  onSaveProgress: () => void;
};

export const TwinPhase2Card = memo(function TwinPhase2Card({
  companyName,
  companyWebsite,
  companyCountry,
  companyIndustry,
  companyStage,
  d1Revenue,
  d2Growth,
  d3Recurring,
  d4Mix,
  savingProgress,
  onCompanyNameChange,
  onCompanyWebsiteChange,
  onCompanyCountryChange,
  onCompanyIndustryChange,
  onCompanyStageChange,
  onD1RevenueChange,
  onD2GrowthChange,
  onD3RecurringChange,
  onD4MixChange,
  onSaveProgress,
}: TwinPhase2CardProps) {
  return (
    <section className="dash-card" style={{ marginTop: 20 }}>
      <div className="dc-label">Phase 2 · Company + Baseline Diagnostic</div>
      <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 24, marginBottom: 20 }}>Tell us about your organisation</h2>

      <div className="field-row">
        <div className="field">
          <label>Company Name</label>
          <input value={companyName} onChange={(e) => onCompanyNameChange(e.target.value)} />
        </div>
        <div className="field">
          <label>Website</label>
          <input value={companyWebsite} onChange={(e) => onCompanyWebsiteChange(e.target.value)} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Country</label>
          <select value={companyCountry} onChange={(e) => onCompanyCountryChange(e.target.value)}>
            <option>India</option>
            <option>United Kingdom</option>
            <option>Germany</option>
            <option>Netherlands</option>
            <option>United States</option>
            <option>Singapore</option>
          </select>
        </div>
        <div className="field">
          <label>Industry</label>
          <select value={companyIndustry} onChange={(e) => onCompanyIndustryChange(e.target.value)}>
            <option>Technology / SaaS / Software</option>
            <option>Marketplace / Platform</option>
            <option>Consumer / D2C / E-commerce</option>
            <option>Fintech / Financial Services</option>
            <option>Healthcare / MedTech / Pharma</option>
          </select>
        </div>
        <div className="field">
          <label>Stage</label>
          <select value={companyStage} onChange={(e) => onCompanyStageChange(e.target.value)}>
            <option>Pre-Revenue</option>
            <option>Early Revenue</option>
            <option>Growth Stage</option>
            <option>Scale Stage</option>
          </select>
        </div>
      </div>

      <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 18, margin: '20px 0 14px', color: 'var(--ink)' }}>Revenue Baseline (Part 1)</h3>

      <div className="field">
        <label>What is your approximate monthly revenue?</label>
        <select value={d1Revenue} onChange={(e) => onD1RevenueChange(e.target.value)}>
          <option value="0">No revenue</option>
          <option value="1">&lt; €5K</option>
          <option value="2">€5K–€20K</option>
          <option value="3">€20K–€50K</option>
          <option value="4">€50K–€100K</option>
          <option value="5">€100K–€250K</option>
        </select>
      </div>

      <div className="field">
        <label>How has revenue changed in the last 6 months?</label>
        <select value={d2Growth} onChange={(e) => onD2GrowthChange(e.target.value)}>
          <option value="0">Declining</option>
          <option value="1">Flat</option>
          <option value="2">0–10% growth</option>
          <option value="3">10–30% growth</option>
          <option value="4">30–70% growth</option>
          <option value="5">70%+ growth</option>
        </select>
      </div>

      <div className="field">
        <label>What percentage of revenue is predictable / recurring?</label>
        <select value={d3Recurring} onChange={(e) => onD3RecurringChange(e.target.value)}>
          <option value="0">0–10%</option>
          <option value="1">10–25%</option>
          <option value="2">25–40%</option>
          <option value="3">40–55%</option>
          <option value="4">55–70%</option>
          <option value="5">70%+</option>
        </select>
      </div>

      <div className="field">
        <label>What is your primary revenue structure?</label>
        <select value={d4Mix} onChange={(e) => onD4MixChange(e.target.value)}>
          <option value="0">Fully one-time</option>
          <option value="1">Mostly one-time</option>
          <option value="2">Balanced</option>
          <option value="3">Mostly recurring</option>
          <option value="4">Fully recurring</option>
          <option value="5">Multi-stream</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--ink-08)' }}>
        <button className="btn-primary" type="button" onClick={onSaveProgress} disabled={savingProgress}>
          {savingProgress ? 'Saving...' : 'Save Progress'} <span className="arr">→</span>
        </button>
      </div>
    </section>
  );
});
