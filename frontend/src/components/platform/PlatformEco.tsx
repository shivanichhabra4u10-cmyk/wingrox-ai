'use client';

import { useState, useEffect } from 'react';
import { PlatformNav } from './PlatformNav';
import styles from './PlatformView.module.css';

const PARTNER_TYPES = ['investor', 'distributor', 'jv', 'advisor', 'accelerator', 'operator'];
const PARTNER_LABELS: Record<string, string> = {
  investor: 'Investor', distributor: 'Distributor', jv: 'JV Partner',
  advisor: 'Advisor', accelerator: 'Accelerator', operator: 'Operator',
};
const SECTORS = ['B2B SaaS', 'Industrial / Manufacturing', 'FMCG', 'Healthcare / Pharma', 'Fintech', 'Climate / Energy', 'Consumer / D2C', 'Other'];

interface Stats { investors: number; distributors: number; experts: number; }

type Step = 'landing' | 'form' | 'done';

export function PlatformEco() {
  const [step, setStep] = useState<Step>('landing');
  const [stats, setStats] = useState<Stats>({ investors: 42, distributors: 67, experts: 120 });
  const [partnerType, setPartnerType] = useState('');
  const [form, setForm] = useState({ name: '', email: '', company: '', website: '', role: '', sector: '', stage: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');

  useEffect(() => {
    fetch('/api/eco/stats').then(r => r.json()).then(res => {
      if (res.success) setStats(res.data);
    }).catch(() => {});
  }, []);

  const handleApply = async () => {
    if (!form.name || !form.email || !form.company || !partnerType || !form.sector) {
      alert('Please fill in all required fields and select a partner type.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/eco/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, partnerType }),
      }).then(r => r.json());
      if (res.success) {
        setConfirmMsg(res.data.message);
        setStep('done');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'done') {
    return (
      <main className={styles.page}>
        <PlatformNav active="eco" />
        <div className={styles.moduleBody} style={{ minHeight: 'calc(100dvh - 72px)', display: 'flex', alignItems: 'center' }}>
          <div className={styles.container}>
            <div className={styles.resultsHero} style={{ maxWidth: 640, margin: '0 auto', padding: 48 }}>
              <div style={{ fontSize: 56, marginBottom: 14 }}>✓</div>
              <div className={styles.eyebrow}>◈ Application Submitted</div>
              <h2 style={{ marginTop: 14, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 400 }}>
                Welcome to the <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>ecosystem.</em>
              </h2>
              <p style={{ marginTop: 12, color: 'var(--ink-70)', lineHeight: 1.7, fontSize: 14 }}>{confirmMsg}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (step === 'form') {
    return (
      <main className={styles.page}>
        <PlatformNav active="eco" />
        <div className={styles.moduleBody}>
          <div className={styles.container}>
            <div className={styles.formCard} style={{ marginTop: 8 }}>
              <div className={styles.cardLabel}>Ecosystem Application</div>
              <h2 className={styles.formTitle}>Join the <em>ecosystem.</em></h2>
              <p className={styles.formDesc}>Reviewed within 48 hours. No credit card. NDA-protected by default.</p>

              <div style={{ marginBottom: 18 }}>
                <label className={styles.fieldLabel}>Partner Type *</label>
                <div className={styles.chipGroup}>
                  {PARTNER_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setPartnerType(t)}
                      style={{
                        border: `1.5px solid ${partnerType === t ? 'var(--gold)' : 'var(--ink-15)'}`,
                        borderRadius: 'var(--r-full)',
                        padding: '6px 14px',
                        fontSize: 12,
                        background: partnerType === t ? 'var(--gold-mist)' : 'var(--surface)',
                        color: partnerType === t ? 'var(--gold-deep)' : 'var(--ink-70)',
                        cursor: 'pointer',
                      }}
                    >
                      {PARTNER_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Full Name *</label>
                  <input className={styles.fieldInput} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Email *</label>
                  <input className={styles.fieldInput} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@company.com" />
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Company *</label>
                  <input className={styles.fieldInput} value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Your company name" />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Website</label>
                  <input className={styles.fieldInput} value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Your Role</label>
                  <input className={styles.fieldInput} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Founder / Partner / MD..." />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Sector Focus *</label>
                  <select className={styles.fieldInput} value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}>
                    <option value="">Select sector</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Why do you want to join? <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--ink-50)' }}>(optional)</span></label>
                <textarea
                  className={styles.fieldInput}
                  rows={3}
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="What brings you to the WinGroX ecosystem, and what are you looking to achieve?"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className={styles.ctaRow}>
                <button className={styles.buttonOutline} onClick={() => setStep('landing')}>← Back</button>
                <button
                  className={styles.buttonPrimary}
                  style={{ background: 'var(--gold)', color: '#fff', opacity: submitting ? 0.7 : 1 }}
                  onClick={handleApply}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting…' : 'Submit Application →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <PlatformNav active="eco" />

      <section className={styles.moduleHero}>
        <div className={styles.container}>
          <div className={styles.moduleEyebrow}>Ecosystem Cloud · Verified Partners</div>
          <h1 className={styles.moduleTitle}>
            Enter a curated <em>partner ecosystem,</em>
            <br />
            not a random directory.
          </h1>
          <p className={styles.moduleSub}>
            Access investors, distributors, operators, and service partners that fit your stage, sector, and current
            operating priorities. Every connection is screened for practical relevance.
          </p>
        </div>
      </section>

      <section className={styles.moduleBody}>
        <div className={styles.container}>
          <div className={styles.panelGrid}>
            <article className={styles.card}>
              <div className={styles.cardLabel}>Membership Status</div>
              <h2 style={{ marginTop: 10, fontSize: 28 }}>
                Welcome to the <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>ecosystem.</em>
              </h2>
              <p className={styles.desc} style={{ marginTop: 8 }}>
                Your application is reviewed within 48 hours. Once approved, WinGroX unlocks partner intros,
                private operator circles, and commercial readiness support.
              </p>
              <button
                onClick={() => setStep('form')}
                style={{ marginTop: 20, background: 'var(--gold)', color: '#fff', borderRadius: 'var(--r-full)', padding: '10px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Apply to Join →
              </button>
            </article>

            <article className={styles.card}>
              <div className={styles.cardLabel}>What Unlocks After Approval</div>
              <div className={styles.listItem}>
                <div className={styles.listTitle}>Investor and distributor introductions</div>
                <div className={styles.listDesc}>Warm, structured introductions based on your operating profile and intent.</div>
              </div>
              <div className={styles.listItem}>
                <div className={styles.listTitle}>Private expert network access</div>
                <div className={styles.listDesc}>Operators, advisors, and specialists aligned to your market and stage.</div>
              </div>
              <div className={styles.listItem}>
                <div className={styles.listTitle}>Execution support infrastructure</div>
                <div className={styles.listDesc}>Legal, finance, GTM, hiring, and localisation capability when needed.</div>
              </div>
            </article>
          </div>

          <div className={styles.matchGrid}>
            <article className={styles.matchCard}>
              <h3 className={styles.matchTitle}>Tier-1 Investors</h3>
              <p className={styles.matchDesc}>Funds with live thesis alignment for your stage, category, and expansion timing.</p>
              <div className={styles.matchScore}>{stats.investors} live fits</div>
            </article>
            <article className={styles.matchCard}>
              <h3 className={styles.matchTitle}>Distribution Partners</h3>
              <p className={styles.matchDesc}>Commercial operators with active access to your target customer segments.</p>
              <div className={styles.matchScore}>{stats.distributors} active nodes</div>
            </article>
            <article className={styles.matchCard}>
              <h3 className={styles.matchTitle}>Expert Operators</h3>
              <p className={styles.matchDesc}>Leaders who have already built, sold, expanded, and raised in your target contexts.</p>
              <div className={styles.matchScore}>{stats.experts}+ experts</div>
            </article>
          </div>

          <article className={styles.resultsHero}>
            <div className={styles.eyebrow}>Network Effect</div>
            <h2 className={styles.resultsCount}>
              One ecosystem, <em>multiple operating advantages.</em>
            </h2>
            <p className={styles.resultsSub}>
              The goal is not more contacts. The goal is fewer wrong moves, faster signal loops, and higher-quality
              relationships at the exact moment your company needs them.
            </p>
            <button
              onClick={() => setStep('form')}
              style={{ background: 'var(--gold)', color: '#fff', borderRadius: 'var(--r-full)', padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Join the Ecosystem →
            </button>
          </article>
        </div>
      </section>
    </main>
  );
}
