'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { PlatformNav } from './PlatformNav';
import styles from './PlatformView.module.css';
import { PACKAGES } from './twin/packages';
import type { PackageKey } from './twin/types';
import { TwinPackageGrid } from './twin/TwinPackageGrid';
import { TwinAuthCard } from './twin/TwinAuthCard';
import { TwinPhase2Card } from './twin/TwinPhase2Card';
import { TwinPhase3Card } from './twin/TwinPhase3Card';
import { TwinPhase4Card } from './twin/TwinPhase4Card';
import { TwinPhase5Card } from './twin/TwinPhase5Card';
import { TwinPhase6Card } from './twin/TwinPhase6Card';

const TWIN_PROCESS = [
  {
    step: 'I',
    title: 'Strategic Context',
    desc: 'Clarify core profile, pain vectors, obstacles, and strategic intent that frames every output.',
  },
  {
    step: 'II',
    title: 'Screening Diagnostic',
    desc: 'Foundational questions identify sector fit, baseline maturity, and first-page constraints.',
  },
  {
    step: 'III',
    title: 'Adaptive Questionnaire',
    desc: 'A dynamic follow-up sequence adapts to your profile and focuses on what drives real outcomes.',
  },
  {
    step: 'IV',
    title: 'Digital Twin Report',
    desc: 'Comprehensive intelligence report with actionable scorecards, roadmap, and simulations.',
  },
];

const TWIN_FEATURES = [
  {
    title: 'Sector-Adaptive Screening',
    desc: '12 screening questions identify your exact sector, business model, function, and growth intent. The entire diagnostic then adapts to your profile.',
    tag: 'Adaptive',
    tone: 'var(--gold-pale)',
  },
  {
    title: 'WinGroX Pain Intelligence Hub',
    desc: 'WinGroX AI maps over 40+ pain points to your problem context and hyper-personalised diagnostic. No generic tool can match.',
    tag: 'Cause',
    tone: 'var(--teal-pale)',
  },
  {
    title: 'Full-Page Question UX',
    desc: 'One question per screen. Three-column layout with question context on left, answer choices in centre, and navigation on right. Keyboard navigable.',
    tag: 'Premium UX',
    tone: 'var(--slate-pale)',
  },
  {
    title: 'Revenue Engine Simulator',
    desc: 'Interactive sliders for leads, conversion, ARPU, retention, and cost. Revenue, profit, and 12-month trajectory update instantly. Unlimited scenarios.',
    tag: 'Live Simulation',
    tone: 'var(--sage-pale)',
  },
  {
    title: 'Constraint Identification',
    desc: 'Primary and secondary bottlenecks exposed from your data. Each constraint is linked to your declared pain areas and quantified by revenue impact.',
    tag: 'Diagnosis',
    tone: 'var(--rose-pale)',
  },
  {
    title: '5-Year Projection & Valuation',
    desc: 'Dual-scenario revenue and profit curves with sensitivity trajectory vs with improvements. Company valuation estimated using revenue multiples adjusted for growth and margin.',
    tag: 'Forward Looking',
    tone: 'var(--amber-pale)',
  },
  {
    title: 'Strategic Context Canvas',
    desc: 'Describe your priorities, pain areas, obstacles, opportunities, and focus areas using chip-based logic. Every answer is contextualised to your canvas throughout.',
    tag: 'Personalised',
    tone: 'var(--gold-pale)',
  },
  {
    title: 'AS-IS vs TO-BE Model',
    desc: 'Side-by-side comparison of current reality vs target state across revenue, margin, conversion, retention, scalability, and business model evolution.',
    tag: 'Transformation Lens',
    tone: 'var(--teal-pale)',
  },
  {
    title: 'Prioritised Action Roadmap',
    desc: 'Three-phase 30-60-90 plan built from your focus areas and growth metrics. Each action linked to expected impact and strategic priority.',
    tag: 'Actionable',
    tone: 'var(--slate-pale)',
  },
];

export function PlatformTwin() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<PackageKey>('nucleus');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [showNativeStep2, setShowNativeStep2] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyCountry, setCompanyCountry] = useState('India');
  const [companyIndustry, setCompanyIndustry] = useState('Technology / SaaS / Software');
  const [companyStage, setCompanyStage] = useState('Early Revenue');
  const [d1Revenue, setD1Revenue] = useState('3');
  const [d2Growth, setD2Growth] = useState('3');
  const [d3Recurring, setD3Recurring] = useState('3');
  const [d4Mix, setD4Mix] = useState('3');
  const [phase2Saved, setPhase2Saved] = useState(false);
  const [savingPhase3, setSavingPhase3] = useState(false);
  const [d5Customers, setD5Customers] = useState('4');
  const [d6Arpu, setD6Arpu] = useState('3');
  const [d7Leads, setD7Leads] = useState('3');
  const [d8Conversion, setD8Conversion] = useState('3');
  const [d9Dropoff, setD9Dropoff] = useState('4');
  const [d10GrowthRate, setD10GrowthRate] = useState('4');
  const [d11PayingShare, setD11PayingShare] = useState('3');
  const [phase3Saved, setPhase3Saved] = useState(false);
  const [savingPhase4, setSavingPhase4] = useState(false);
  const [d12Cac, setD12Cac] = useState('3');
  const [d13CacEfficiency, setD13CacEfficiency] = useState('4');
  const [d14Retention, setD14Retention] = useState('5');
  const [d15Lifetime, setD15Lifetime] = useState('4');
  const [d16ReferralRate, setD16ReferralRate] = useState('3');
  const [d17RevenueConcentration, setD17RevenueConcentration] = useState('4');
  const [d18Cost, setD18Cost] = useState('3');
  const [d19CostDriver, setD19CostDriver] = useState('0');
  const [d20FixedCost, setD20FixedCost] = useState('3');
  const [d21ScalingBehavior, setD21ScalingBehavior] = useState('3');
  const [d22Profitability, setD22Profitability] = useState('4');
  const [d23GrossMargin, setD23GrossMargin] = useState('5');
  const [phase4Saved, setPhase4Saved] = useState(false);
  const [savingPhase5, setSavingPhase5] = useState(false);
  const [phase5Saved, setPhase5Saved] = useState(false);
  const [d24LeadershipDepth, setD24LeadershipDepth] = useState('3');
  const [d25HiringVelocity, setD25HiringVelocity] = useState('3');
  const [d26CrossFunctionalExecution, setD26CrossFunctionalExecution] = useState('3');
  const [d27ExecutionRhythm, setD27ExecutionRhythm] = useState('4');
  const [d28OperatingVisibility, setD28OperatingVisibility] = useState('3');
  const [d29PositioningClarity, setD29PositioningClarity] = useState('4');
  const [d30DifferentiationStrength, setD30DifferentiationStrength] = useState('3');
  const [d31Defensibility, setD31Defensibility] = useState('3');
  const [d32ExpansionReadiness, setD32ExpansionReadiness] = useState('3');
  const [d33StrategicFocus, setD33StrategicFocus] = useState('4');
  const [d34RiskPreparedness, setD34RiskPreparedness] = useState('3');
  const [d35MustWinAlignment, setD35MustWinAlignment] = useState('4');
  const [completingAssessment, setCompletingAssessment] = useState(false);
  const [completedAssessmentId, setCompletedAssessmentId] = useState<string | null>(null);
  const [completionPriority, setCompletionPriority] = useState('Revenue acceleration');
  const [completionHorizon, setCompletionHorizon] = useState('12 months');
  const [completionNotes, setCompletionNotes] = useState('');

  const selected = useMemo(
    () => PACKAGES.find((p) => p.key === selectedPackage) ?? PACKAGES[0],
    [selectedPackage],
  );

  const allAnswers = useMemo(
    () => ({
      D1: Number(d1Revenue),
      D2: Number(d2Growth),
      D3: Number(d3Recurring),
      D4: Number(d4Mix),
      D5: Number(d5Customers),
      D6: Number(d6Arpu),
      D7: Number(d7Leads),
      D8: Number(d8Conversion),
      D9: Number(d9Dropoff),
      D10: Number(d10GrowthRate),
      D11: Number(d11PayingShare),
      D12: Number(d12Cac),
      D13: Number(d13CacEfficiency),
      D14: Number(d14Retention),
      D15: Number(d15Lifetime),
      D16: Number(d16ReferralRate),
      D17: Number(d17RevenueConcentration),
      D18: Number(d18Cost),
      D19: Number(d19CostDriver),
      D20: Number(d20FixedCost),
      D21: Number(d21ScalingBehavior),
      D22: Number(d22Profitability),
      D23: Number(d23GrossMargin),
      D24: Number(d24LeadershipDepth),
      D25: Number(d25HiringVelocity),
      D26: Number(d26CrossFunctionalExecution),
      D27: Number(d27ExecutionRhythm),
      D28: Number(d28OperatingVisibility),
      D29: Number(d29PositioningClarity),
      D30: Number(d30DifferentiationStrength),
      D31: Number(d31Defensibility),
      D32: Number(d32ExpansionReadiness),
      D33: Number(d33StrategicFocus),
      D34: Number(d34RiskPreparedness),
      D35: Number(d35MustWinAlignment),
    }),
    [
      d1Revenue,
      d2Growth,
      d3Recurring,
      d4Mix,
      d5Customers,
      d6Arpu,
      d7Leads,
      d8Conversion,
      d9Dropoff,
      d10GrowthRate,
      d11PayingShare,
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
    ],
  );

  const buildAnswers = (maxQuestion: number) => {
    return Object.fromEntries(
      Object.entries(allAnswers).filter(([key]) => {
        const index = Number(key.replace('D', ''));
        return Number.isFinite(index) && index <= maxQuestion;
      }),
    );
  };

  async function handleSendOtp() {
    const emailParse = z.string().email().safeParse(email.trim());
    if (!emailParse.success) {
      setError('Please enter a valid work email.');
      return;
    }

    setError(null);
    setNotice(null);
    setSending(true);

    try {
      const res = await apiClient.sendTwinOtp({
        email: emailParse.data,
        packageKey: selectedPackage,
      });

      setOtpSent(true);
      if (res?.data?.demoOtp) {
        setNotice(`Development OTP: ${res.data.demoOtp}`);
      } else {
        setNotice('A 6-digit access code has been sent to your email.');
      }
    } catch (err) {
      setError('Could not send OTP right now. Please try again.');
    } finally {
      setSending(false);
    }
  }

  async function handleVerifyOtp() {
    const code = otpCode.replace(/\s/g, '');
    const codeParse = z.string().regex(/^\d{6}$/).safeParse(code);
    if (!codeParse.success) {
      setError('OTP must be exactly 6 digits.');
      return;
    }

    setError(null);
    setNotice(null);
    setVerifying(true);

    try {
      const res = await apiClient.verifyTwinOtp({
        email: email.trim(),
        code,
      });

      const token = res?.data?.sessionToken as string | undefined;
      if (!token) {
        setError('OTP verified but no session token returned.');
        return;
      }

      setSessionToken(token);
      setShowNativeStep2(true);
      setNotice('Identity verified. Continue with company context and baseline diagnostic.');
    } catch (err) {
      setError('OTP verification failed. Please use the latest code and try again.');
    } finally {
      setVerifying(false);
    }
  }

  async function handleSaveProgress() {
    if (!sessionToken) {
      setError('Session expired. Please verify OTP again.');
      return;
    }

    const nameCheck = z.string().min(2).safeParse(companyName.trim());
    if (!nameCheck.success) {
      setError('Please enter a valid company name.');
      return;
    }

    setError(null);
    setNotice(null);
    setSavingProgress(true);

    try {
      await apiClient.saveTwinProgress({
        sessionToken,
        packageKey: selectedPackage,
        company: {
          name: companyName.trim(),
          email: email.trim(),
          website: companyWebsite.trim(),
          country: companyCountry,
          industry: companyIndustry,
          stage: companyStage,
        },
        answers: buildAnswers(4),
        metadata: {
          source: 'native-twin-phase2',
          phase: 'phase2-company-and-baseline',
        },
      });

      setPhase2Saved(true);
      setNotice('Progress saved to database. You can now continue with full diagnostic safely.');
    } catch {
      setError('Could not save progress right now. Please try again.');
    } finally {
      setSavingProgress(false);
    }
  }

  async function handleSavePhase3() {
    if (!sessionToken) {
      setError('Session expired. Please verify OTP again.');
      return;
    }

    setError(null);
    setNotice(null);
    setSavingPhase3(true);

    try {
      await apiClient.saveTwinProgress({
        sessionToken,
        packageKey: selectedPackage,
        company: {
          name: companyName.trim(),
          email: email.trim(),
          website: companyWebsite.trim(),
          country: companyCountry,
          industry: companyIndustry,
          stage: companyStage,
        },
        answers: buildAnswers(11),
        metadata: {
          source: 'native-twin-phase3',
          phase: 'phase3-demand-and-funnel',
        },
      });

      setPhase3Saved(true);
      setNotice('Phase 3 progress saved to database successfully.');
    } catch {
      setError('Could not save phase 3 progress right now. Please try again.');
    } finally {
      setSavingPhase3(false);
    }
  }

  async function handleSavePhase4() {
    if (!sessionToken) {
      setError('Session expired. Please verify OTP again.');
      return;
    }

    setError(null);
    setNotice(null);
    setSavingPhase4(true);

    try {
      await apiClient.saveTwinProgress({
        sessionToken,
        packageKey: selectedPackage,
        company: {
          name: companyName.trim(),
          email: email.trim(),
          website: companyWebsite.trim(),
          country: companyCountry,
          industry: companyIndustry,
          stage: companyStage,
        },
        answers: buildAnswers(23),
        metadata: {
          source: 'native-twin-phase4',
          phase: 'phase4-economics-and-cost',
        },
      });

      setPhase4Saved(true);
      setNotice('Phase 4 progress saved to database successfully.');
    } catch {
      setError('Could not save phase 4 progress right now. Please try again.');
    } finally {
      setSavingPhase4(false);
    }
  }

  async function handleSavePhase5() {
    if (!sessionToken) {
      setError('Session expired. Please verify OTP again.');
      return;
    }

    setError(null);
    setNotice(null);
    setSavingPhase5(true);

    try {
      await apiClient.saveTwinProgress({
        sessionToken,
        packageKey: selectedPackage,
        company: {
          name: companyName.trim(),
          email: email.trim(),
          website: companyWebsite.trim(),
          country: companyCountry,
          industry: companyIndustry,
          stage: companyStage,
        },
        answers: buildAnswers(35),
        metadata: {
          source: 'native-twin-phase5',
          phase: 'phase5-team-capacity-strategy',
        },
      });

      setPhase5Saved(true);
      setNotice('Phase 5 progress saved to database successfully.');
    } catch {
      setError('Could not save phase 5 progress right now. Please try again.');
    } finally {
      setSavingPhase5(false);
    }
  }

  async function handleCompleteAssessment() {
    if (!sessionToken) {
      setError('Session expired. Please verify OTP again.');
      return;
    }

    setError(null);
    setNotice(null);
    setCompletingAssessment(true);

    try {
      const res = await apiClient.completeTwinAssessment({
        sessionToken,
        packageKey: selectedPackage,
        company: {
          name: companyName.trim(),
          email: email.trim(),
          website: companyWebsite.trim(),
          country: companyCountry,
          industry: companyIndustry,
          stage: companyStage,
        },
        answers: buildAnswers(35),
        report: {
          summary: {
            strategicPriority: completionPriority,
            planningHorizon: completionHorizon,
            notes: completionNotes.trim(),
          },
          nativeFlow: {
            completedThroughQuestion: 35,
            phase: 'phase6-completion',
          },
        },
        metadata: {
          source: 'native-twin-phase6',
          phase: 'phase6-complete-assessment',
          completionPriority,
          completionHorizon,
        },
      });

      const assessmentId = (res?.data?.id as string | undefined) ?? null;
      setCompletedAssessmentId(assessmentId);
      setNotice('Assessment completed and stored in database.');
    } catch {
      setError('Could not complete the assessment right now. Please try again.');
    } finally {
      setCompletingAssessment(false);
    }
  }

  return (
    <main className={styles.page}>
      <PlatformNav active="twin" />

      <section className="twin-hero-split">
        <div className="container twin-hero-grid">
          <div className="twin-hero-left">
            <div className="eyebrow">AI Powered Diagnostic Platform · 2025</div>
            <h1 className="twin-split-title">
              Mirror Your <em>Organisation.</em>
              <br />
              Simulate Your <em className="teal">Future.</em>
            </h1>
            <p className="twin-split-sub">
              Most organisations do not fail from lack of effort. They fail because nobody can see clearly which lever to pull,
              which bottleneck to break, and which decision will matter most. This platform changes that.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                className="btn-primary"
                onClick={() => document.getElementById('twin-packages')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Intelligence Packages <span className="arr">&#8594;</span>
              </button>
              <button
                className="btn-outline"
                onClick={() => document.getElementById('twin-method')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn How
              </button>
            </div>
          </div>

          <div className="twin-hero-right">
            <div className="twin-stat-grid">
              <article className="twin-stat-card">
                <div className="twin-stat-val">77+</div>
                <div className="twin-stat-lbl">Diagnostic Variables</div>
                <div className="twin-stat-sub">Structured intelligence across every dimension of your business.</div>
              </article>
              <article className="twin-stat-card">
                <div className="twin-stat-val">AI</div>
                <div className="twin-stat-lbl">Pain Intelligence Hub</div>
                <div className="twin-stat-sub">Maps your problems to personalised diagnostics in real time.</div>
              </article>
              <article className="twin-stat-card">
                <div className="twin-stat-val">24</div>
                <div className="twin-stat-lbl">Report Sections</div>
                <div className="twin-stat-sub">From screening insight to 5-year projection and valuation timeline.</div>
              </article>
              <article className="twin-stat-card">
                <div className="twin-stat-val">5yr</div>
                <div className="twin-stat-lbl">Projection Horizon</div>
                <div className="twin-stat-sub">Dual-scenario projection from your actual diagnostic data.</div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="twin-method" className="twin-method-section">
        <div className="container twin-method-grid">
          <div>
            <div className="section-label">About The Platform</div>
            <h2 className="twin-method-title">
              Built on the same frameworks as <em>top-tier strategy firms</em> and adapted for speed.
            </h2>
            <p className="twin-method-copy">
              Elite consulting combines structured data collection with expert interpretation. This platform replicates that process,
              but with AI acceleration for the data stage. All interpretation remains yours.
            </p>
            <ul className="twin-method-list">
              <li>
                <strong>Revenue Decomposition</strong>
                <span>Leads x Conversion x ARPU, with segmentation and impact.</span>
              </li>
              <li>
                <strong>Theory of Constraints</strong>
                <span>Primary and secondary bottlenecks identified and quantified.</span>
              </li>
              <li>
                <strong>TAM Heuristics Engine</strong>
                <span>CAC:LTV stress-tested from ranges, not averages.</span>
              </li>
              <li>
                <strong>What/How/When Intelligence Hub</strong>
                <span>What this means, where to act, and how to prioritise execution.</span>
              </li>
            </ul>
          </div>

          <article className="twin-bars-card">
            <div className="twin-bars-head">Diagnostic Coverage by Layer</div>
            <div className="twin-bars-wrap">
              {[
                ['Revenue Engine', 88, 'var(--gold)'],
                ['Cost & Profit', 82, 'var(--teal)'],
                ['Team & Capacity', 78, 'var(--slate)'],
                ['Strategic Fit', 73, 'var(--sage)'],
                ['Market Position', 69, 'var(--rose)'],
                ['AI Interpretation', 86, 'var(--amber)'],
              ].map(([label, value, color]) => (
                <div key={String(label)} className="twin-bar-row">
                  <span>{label}</span>
                  <div className="twin-bar-track">
                    <div style={{ width: `${value}%`, background: String(color) }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="twin-process-section">
        <div className="container">
          <div className="section-label">The Process</div>
          <h2 className="twin-process-title">Four steps from input to intelligence.</h2>
          <div className="twin-process-grid">
            {TWIN_PROCESS.map((item, idx) => (
              <article key={item.step} className="twin-process-item">
                <div className="twin-process-circle">{item.step}</div>
                {idx < TWIN_PROCESS.length - 1 ? <div className="twin-process-line" /> : null}
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="twin-features-section">
        <div className="container">
          <div className="section-label">Platform Features</div>
          <h2 className="twin-features-title">
            Everything a strategy consultant
            <br />
            would build, in one platform.
          </h2>
          <p className="twin-features-sub">
            Each feature is purpose-built to answer a specific leadership question. No padding. No generic insights.
          </p>

          <div className="twin-feature-grid">
            {TWIN_FEATURES.map((feature) => (
              <article key={feature.title} className="twin-feature-card">
                <div className="mc-icon-wrap" style={{ background: feature.tone }}>
                  &#9672;
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
                <span style={{ background: feature.tone }}>{feature.tag}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="twin-bottom-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>
            Ready to see your organisation <em>clearly?</em>
          </h2>
          <p>
            Start with your strategic context and build a complete digital mirror of your business in minutes.
          </p>
          <button
            className="btn-gold"
            onClick={() => document.getElementById('twin-packages')?.scrollIntoView({ behavior: 'smooth' })}
          >
            View Intelligence Packages <span className="arr">&#8594;</span>
          </button>
        </div>
      </section>

      <section className={styles.twinHero}>
        <div className={styles.container}>
          <div className={styles.twinEyebrow}>Intelligence Packages</div>
          <h1 className={styles.twinTitle}>
            Choose your package and <em>start the diagnostic.</em>
          </h1>
          <p className={styles.twinSub}>
            Select the depth of analysis you want. Your package controls the breadth of questions,
            report granularity, and consultation support.
          </p>
        </div>
      </section>

      <section id="twin-packages" className={styles.twinPackagesSection}>
        <div className={styles.container}>
          <TwinPackageGrid
            packages={PACKAGES}
            selectedPackage={selectedPackage}
            onSelectPackage={setSelectedPackage}
          />

          <TwinAuthCard
            packageName={selected.name}
            email={email}
            otpCode={otpCode}
            otpSent={otpSent}
            sending={sending}
            verifying={verifying}
            error={error}
            notice={notice}
            sessionToken={sessionToken}
            onEmailChange={setEmail}
            onOtpChange={setOtpCode}
            onSendOtp={handleSendOtp}
            onVerifyOtp={handleVerifyOtp}
          />

          {showNativeStep2 ? (
            <TwinPhase2Card
              companyName={companyName}
              companyWebsite={companyWebsite}
              companyCountry={companyCountry}
              companyIndustry={companyIndustry}
              companyStage={companyStage}
              d1Revenue={d1Revenue}
              d2Growth={d2Growth}
              d3Recurring={d3Recurring}
              d4Mix={d4Mix}
              savingProgress={savingProgress}
              onCompanyNameChange={setCompanyName}
              onCompanyWebsiteChange={setCompanyWebsite}
              onCompanyCountryChange={setCompanyCountry}
              onCompanyIndustryChange={setCompanyIndustry}
              onCompanyStageChange={setCompanyStage}
              onD1RevenueChange={setD1Revenue}
              onD2GrowthChange={setD2Growth}
              onD3RecurringChange={setD3Recurring}
              onD4MixChange={setD4Mix}
              onSaveProgress={handleSaveProgress}
            />
          ) : null}

          {showNativeStep2 && phase2Saved ? (
            <TwinPhase3Card
              d5Customers={d5Customers}
              d6Arpu={d6Arpu}
              d7Leads={d7Leads}
              d8Conversion={d8Conversion}
              d9Dropoff={d9Dropoff}
              d10GrowthRate={d10GrowthRate}
              d11PayingShare={d11PayingShare}
              savingPhase3={savingPhase3}
              onD5CustomersChange={setD5Customers}
              onD6ArpuChange={setD6Arpu}
              onD7LeadsChange={setD7Leads}
              onD8ConversionChange={setD8Conversion}
              onD9DropoffChange={setD9Dropoff}
              onD10GrowthRateChange={setD10GrowthRate}
              onD11PayingShareChange={setD11PayingShare}
              onSavePhase3={handleSavePhase3}
            />
          ) : null}

          {showNativeStep2 && phase3Saved ? (
            <TwinPhase4Card
              d12Cac={d12Cac}
              d13CacEfficiency={d13CacEfficiency}
              d14Retention={d14Retention}
              d15Lifetime={d15Lifetime}
              d16ReferralRate={d16ReferralRate}
              d17RevenueConcentration={d17RevenueConcentration}
              d18Cost={d18Cost}
              d19CostDriver={d19CostDriver}
              d20FixedCost={d20FixedCost}
              d21ScalingBehavior={d21ScalingBehavior}
              d22Profitability={d22Profitability}
              d23GrossMargin={d23GrossMargin}
              savingPhase4={savingPhase4}
              onD12CacChange={setD12Cac}
              onD13CacEfficiencyChange={setD13CacEfficiency}
              onD14RetentionChange={setD14Retention}
              onD15LifetimeChange={setD15Lifetime}
              onD16ReferralRateChange={setD16ReferralRate}
              onD17RevenueConcentrationChange={setD17RevenueConcentration}
              onD18CostChange={setD18Cost}
              onD19CostDriverChange={setD19CostDriver}
              onD20FixedCostChange={setD20FixedCost}
              onD21ScalingBehaviorChange={setD21ScalingBehavior}
              onD22ProfitabilityChange={setD22Profitability}
              onD23GrossMarginChange={setD23GrossMargin}
              onSavePhase4={handleSavePhase4}
            />
          ) : null}

          {showNativeStep2 && phase4Saved ? (
            <TwinPhase5Card
              d24LeadershipDepth={d24LeadershipDepth}
              d25HiringVelocity={d25HiringVelocity}
              d26CrossFunctionalExecution={d26CrossFunctionalExecution}
              d27ExecutionRhythm={d27ExecutionRhythm}
              d28OperatingVisibility={d28OperatingVisibility}
              d29PositioningClarity={d29PositioningClarity}
              d30DifferentiationStrength={d30DifferentiationStrength}
              d31Defensibility={d31Defensibility}
              d32ExpansionReadiness={d32ExpansionReadiness}
              d33StrategicFocus={d33StrategicFocus}
              d34RiskPreparedness={d34RiskPreparedness}
              d35MustWinAlignment={d35MustWinAlignment}
              savingPhase5={savingPhase5}
              onD24LeadershipDepthChange={setD24LeadershipDepth}
              onD25HiringVelocityChange={setD25HiringVelocity}
              onD26CrossFunctionalExecutionChange={setD26CrossFunctionalExecution}
              onD27ExecutionRhythmChange={setD27ExecutionRhythm}
              onD28OperatingVisibilityChange={setD28OperatingVisibility}
              onD29PositioningClarityChange={setD29PositioningClarity}
              onD30DifferentiationStrengthChange={setD30DifferentiationStrength}
              onD31DefensibilityChange={setD31Defensibility}
              onD32ExpansionReadinessChange={setD32ExpansionReadiness}
              onD33StrategicFocusChange={setD33StrategicFocus}
              onD34RiskPreparednessChange={setD34RiskPreparedness}
              onD35MustWinAlignmentChange={setD35MustWinAlignment}
              onSavePhase5={handleSavePhase5}
            />
          ) : null}

          {showNativeStep2 && phase5Saved ? (
            <TwinPhase6Card
              completionPriority={completionPriority}
              completionHorizon={completionHorizon}
              completionNotes={completionNotes}
              completingAssessment={completingAssessment}
              completedAssessmentId={completedAssessmentId}
              onCompletionPriorityChange={setCompletionPriority}
              onCompletionHorizonChange={setCompletionHorizon}
              onCompletionNotesChange={setCompletionNotes}
              onCompleteAssessment={handleCompleteAssessment}
              onGoDashboard={() => router.push('/dashboard')}
              onOpenReports={() => router.push('/reports')}
              onStartNew={() => router.push('/twin')}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}
