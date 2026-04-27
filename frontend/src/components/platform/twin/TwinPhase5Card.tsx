import { memo } from 'react';

type TwinPhase5CardProps = {
  d24LeadershipDepth: string;
  d25HiringVelocity: string;
  d26CrossFunctionalExecution: string;
  d27ExecutionRhythm: string;
  d28OperatingVisibility: string;
  d29PositioningClarity: string;
  d30DifferentiationStrength: string;
  d31Defensibility: string;
  d32ExpansionReadiness: string;
  d33StrategicFocus: string;
  d34RiskPreparedness: string;
  d35MustWinAlignment: string;
  savingPhase5: boolean;
  onD24LeadershipDepthChange: (value: string) => void;
  onD25HiringVelocityChange: (value: string) => void;
  onD26CrossFunctionalExecutionChange: (value: string) => void;
  onD27ExecutionRhythmChange: (value: string) => void;
  onD28OperatingVisibilityChange: (value: string) => void;
  onD29PositioningClarityChange: (value: string) => void;
  onD30DifferentiationStrengthChange: (value: string) => void;
  onD31DefensibilityChange: (value: string) => void;
  onD32ExpansionReadinessChange: (value: string) => void;
  onD33StrategicFocusChange: (value: string) => void;
  onD34RiskPreparednessChange: (value: string) => void;
  onD35MustWinAlignmentChange: (value: string) => void;
  onSavePhase5: () => void;
};

export const TwinPhase5Card = memo(function TwinPhase5Card({
  d24LeadershipDepth,
  d25HiringVelocity,
  d26CrossFunctionalExecution,
  d27ExecutionRhythm,
  d28OperatingVisibility,
  d29PositioningClarity,
  d30DifferentiationStrength,
  d31Defensibility,
  d32ExpansionReadiness,
  d33StrategicFocus,
  d34RiskPreparedness,
  d35MustWinAlignment,
  savingPhase5,
  onD24LeadershipDepthChange,
  onD25HiringVelocityChange,
  onD26CrossFunctionalExecutionChange,
  onD27ExecutionRhythmChange,
  onD28OperatingVisibilityChange,
  onD29PositioningClarityChange,
  onD30DifferentiationStrengthChange,
  onD31DefensibilityChange,
  onD32ExpansionReadinessChange,
  onD33StrategicFocusChange,
  onD34RiskPreparednessChange,
  onD35MustWinAlignmentChange,
  onSavePhase5,
}: TwinPhase5CardProps) {
  return (
    <section className="dash-card" style={{ marginTop: 20 }}>
      <div className="dc-label">Phase 5 · Team, Capacity, Strategy &amp; Must-Win</div>
      <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 24, marginBottom: 20 }}>Evaluate execution capability and strategic control</h2>

      <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 18, margin: '20px 0 14px' }}>Team &amp; Execution Capacity</h3>

      <div className="field">
        <label>How strong is your leadership bench for the next growth stage?</label>
        <select value={d24LeadershipDepth} onChange={(e) => onD24LeadershipDepthChange(e.target.value)}>
          <option value="0">Founder only, no leadership layer</option>
          <option value="1">1-2 managers, still founder-dependent</option>
          <option value="2">Functional leads in some teams</option>
          <option value="3">Reliable leadership in core functions</option>
          <option value="4">Strong second line and ownership depth</option>
          <option value="5">Board-ready leadership bench across the company</option>
        </select>
      </div>

      <div className="field">
        <label>How quickly can you hire critical roles when needed?</label>
        <select value={d25HiringVelocity} onChange={(e) => onD25HiringVelocityChange(e.target.value)}>
          <option value="0">Mostly unable to fill key roles</option>
          <option value="1">Typically 6+ months</option>
          <option value="2">3-6 months</option>
          <option value="3">2-3 months</option>
          <option value="4">4-8 weeks</option>
          <option value="5">Under 4 weeks with strong pipeline</option>
        </select>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Cross-functional execution quality</label>
          <select value={d26CrossFunctionalExecution} onChange={(e) => onD26CrossFunctionalExecutionChange(e.target.value)}>
            <option value="0">Siloed teams, high friction</option>
            <option value="1">Ad-hoc collaboration only</option>
            <option value="2">Periodic coordination, inconsistent outcomes</option>
            <option value="3">Regular collaboration with moderate discipline</option>
            <option value="4">Strong cross-functional rituals and accountability</option>
            <option value="5">Highly integrated, fast and predictable execution</option>
          </select>
        </div>
        <div className="field">
          <label>Execution rhythm and operating cadence</label>
          <select value={d27ExecutionRhythm} onChange={(e) => onD27ExecutionRhythmChange(e.target.value)}>
            <option value="0">No clear cadence</option>
            <option value="1">Infrequent planning cycles</option>
            <option value="2">Quarterly planning, weak follow-through</option>
            <option value="3">Monthly reviews with active tracking</option>
            <option value="4">Weekly operating rhythm with owners and KPIs</option>
            <option value="5">Real-time operating system with rapid decisions</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label>Visibility into delivery, quality, and bottlenecks</label>
        <select value={d28OperatingVisibility} onChange={(e) => onD28OperatingVisibilityChange(e.target.value)}>
          <option value="0">Mostly blind, retrospective only</option>
          <option value="1">Manual updates, unreliable reporting</option>
          <option value="2">Partial dashboards for some teams</option>
          <option value="3">Good visibility in core workflows</option>
          <option value="4">Comprehensive dashboards with trend alerts</option>
          <option value="5">Predictive monitoring and early-warning controls</option>
        </select>
      </div>

      <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 18, margin: '20px 0 14px' }}>Strategy &amp; Must-Win Alignment</h3>

      <div className="field">
        <label>How clear is your strategic positioning in target markets?</label>
        <select value={d29PositioningClarity} onChange={(e) => onD29PositioningClarityChange(e.target.value)}>
          <option value="0">No clear positioning</option>
          <option value="1">Broad claims, hard to differentiate</option>
          <option value="2">Some segment focus, weak narrative</option>
          <option value="3">Clear positioning for primary segment</option>
          <option value="4">Strong positioning validated by customers</option>
          <option value="5">Category-defining position with market pull</option>
        </select>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Strength of differentiation vs alternatives</label>
          <select value={d30DifferentiationStrength} onChange={(e) => onD30DifferentiationStrengthChange(e.target.value)}>
            <option value="0">Commoditized, hard to justify premium</option>
            <option value="1">Minor differences only</option>
            <option value="2">Some differentiated capabilities</option>
            <option value="3">Clear differentiators in key buying criteria</option>
            <option value="4">Compelling differentiation with win-rate impact</option>
            <option value="5">Structural advantage competitors cannot match</option>
          </select>
        </div>
        <div className="field">
          <label>Defensibility / moat strength</label>
          <select value={d31Defensibility} onChange={(e) => onD31DefensibilityChange(e.target.value)}>
            <option value="0">No moat, easy to replicate</option>
            <option value="1">Weak moat (brand only)</option>
            <option value="2">Moderate moat (process + know-how)</option>
            <option value="3">Strong moat in one dimension</option>
            <option value="4">Multi-layer moat (data, integration, network)</option>
            <option value="5">Compounding moat with durable advantage</option>
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Readiness for new market or segment expansion</label>
          <select value={d32ExpansionReadiness} onChange={(e) => onD32ExpansionReadinessChange(e.target.value)}>
            <option value="0">Not ready</option>
            <option value="1">Early exploration only</option>
            <option value="2">Some experiments running</option>
            <option value="3">Validated pilot readiness</option>
            <option value="4">Clear expansion playbook and owners</option>
            <option value="5">Expansion-ready with repeatable model</option>
          </select>
        </div>
        <div className="field">
          <label>Strategic focus and ability to say no</label>
          <select value={d33StrategicFocus} onChange={(e) => onD33StrategicFocusChange(e.target.value)}>
            <option value="0">Highly scattered priorities</option>
            <option value="1">Too many priorities, low throughput</option>
            <option value="2">Some prioritization but frequent context switching</option>
            <option value="3">Focused on a few strategic outcomes</option>
            <option value="4">Disciplined prioritization with trade-off rigor</option>
            <option value="5">Exceptional focus, fast resource reallocation</option>
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Preparedness for downside risks and shocks</label>
          <select value={d34RiskPreparedness} onChange={(e) => onD34RiskPreparednessChange(e.target.value)}>
            <option value="0">No contingency planning</option>
            <option value="1">Limited reactive planning</option>
            <option value="2">Basic risk register, rarely used</option>
            <option value="3">Active risk planning for major scenarios</option>
            <option value="4">Scenario-based planning with response owners</option>
            <option value="5">Operational resilience and tested playbooks</option>
          </select>
        </div>
        <div className="field">
          <label>Alignment on must-win battles for next 12 months</label>
          <select value={d35MustWinAlignment} onChange={(e) => onD35MustWinAlignmentChange(e.target.value)}>
            <option value="0">No alignment on priorities</option>
            <option value="1">Loose alignment, frequent conflict</option>
            <option value="2">Partial alignment across leadership</option>
            <option value="3">Clear priorities with active ownership</option>
            <option value="4">Strong company-wide alignment on must-wins</option>
            <option value="5">Exceptional alignment and execution discipline</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--ink-08)' }}>
        <button className="btn-primary" type="button" onClick={onSavePhase5} disabled={savingPhase5}>
          {savingPhase5 ? 'Saving...' : 'Save Phase 5'} <span className="arr">→</span>
        </button>
      </div>
    </section>
  );
});
