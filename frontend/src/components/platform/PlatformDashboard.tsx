'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PlatformNav } from './PlatformNav';
import shared from './PlatformView.module.css';
import dash from './PlatformDashboard.module.css';

interface DashboardMetric {
  value: string;
  label: string;
  variant?: 'default' | 'good' | 'alert' | 'accent';
}

interface ReadinessDimension {
  name: string;
  score: number;
  color: string;
}

interface FeedItem {
  type: 'insight' | 'match' | 'milestone' | 'alert';
  title: string;
  description: string;
  time: string;
  source: string;
}

interface DashboardData {
  overallScore: number;
  clusterStage: string;
  headline: string;
  summary: string;
  primaryGap: string;
  topLever: string;
  topCountry: string;
  weeklyInsight: string;
  metrics: DashboardMetric[];
  readiness: ReadinessDimension[];
  feed: FeedItem[];
}

const DEFAULT: DashboardData = {
  overallScore: 64,
  clusterStage: 'Experimenter',
  headline: 'You\'re at the <em style="color:var(--gold);font-style:italic">Experimenter</em> stage.',
  summary: 'Your Digital Twin is capable of entering Europe — but conversion depends on how structured your next 90 days are. Focus on demand pipeline, partner readiness, and value proposition sharpening.',
  primaryGap: 'Demand Pipeline',
  topLever: 'Conversion',
  topCountry: 'Germany',
  weeklyInsight: 'Your conversion rate of 5% on 500 leads is leaving €180K/month on the table. Improving conversion by just 30% — from 5% to 6.5% — adds €54K monthly with zero new leads required.',
  metrics: [
    { value: '64',           label: 'Twin Score',         variant: 'accent' },
    { value: 'Experimenter', label: 'Cluster Stage',      variant: 'accent' },
    { value: '42',           label: 'Matches',            variant: 'good'   },
    { value: '€180K',        label: 'Pipeline Est.'                         },
    { value: 'Demand',       label: 'Primary Constraint', variant: 'alert'  },
  ],
  readiness: [
    { name: 'Demand',      score: 58, color: 'var(--rose)'  },
    { name: 'Strategy',    score: 62, color: 'var(--amber)' },
    { name: 'Competition', score: 60, color: 'var(--amber)' },
    { name: 'Economics',   score: 66, color: 'var(--gold)'  },
    { name: 'Customer',    score: 59, color: 'var(--rose)'  },
    { name: 'Execution',   score: 70, color: 'var(--sage)'  },
  ],
  feed: [
    { type: 'insight',   title: '3 new playbooks matched to your GTM needs',   description: '"Distribution-led entry for industrial SaaS in Germany" and 2 others just published in the Intelligence Hub.', time: '15 minutes ago', source: 'Intelligence Hub'  },
    { type: 'match',     title: '7 new matches added in last 48 hours',         description: 'Including 2 Tier-1 VCs in London and 3 industrial distributors in DACH region.',                              time: '2 hours ago',    source: 'Match Engine'     },
    { type: 'milestone', title: "You're now expansion-ready for Netherlands",   description: 'Your recent answers unlocked Netherlands as a viable secondary entry market (fit score: 78/100).',             time: 'Yesterday',      source: 'Expansion Engine' },
    { type: 'alert',     title: 'Risk alert: Demand pipeline below threshold',  description: 'Your demand score of 58 is the #1 blocker to first deal. Run 15 structured EU prospect calls in 30 days.',     time: 'Yesterday',      source: 'AI Advisor'       },
  ],
};

const CIRC = 427;

function metricColor(variant?: string): string {
  if (variant === 'accent') return shared.metricMainGold;
  if (variant === 'good')   return shared.metricMainSage;
  if (variant === 'alert')  return shared.metricMainRose;
  return '';
}

function feedIconClass(type: FeedItem['type']): string {
  if (type === 'match')     return `${dash.fiIcon} ${dash.fiIconMatch}`;
  if (type === 'milestone') return `${dash.fiIcon} ${dash.fiIconMilestone}`;
  if (type === 'alert')     return `${dash.fiIcon} ${dash.fiIconAlert}`;
  return dash.fiIcon;
}

export function PlatformDashboard() {
  const router                    = useRouter();
  const [data, setData]           = useState<DashboardData>(DEFAULT);
  const [barsVisible, setBars]    = useState(false);
  const ringRef                   = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const aid = localStorage.getItem('wg_assessment_id');
    const url = '/api/dashboard/overview' + (aid ? `?assessmentId=${aid}` : '');
    fetch(url)
      .then(r => r.json())
      .then(res => { if (res.data) setData(res.data); })
      .catch(() => {})
      .finally(() => {
        setBars(true);
        setTimeout(() => {
          if (!ringRef.current) return;
          const offset = CIRC - (CIRC * (data.overallScore / 100));
          ringRef.current.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)';
          ringRef.current.setAttribute('stroke-dashoffset', String(offset));
        }, 80);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-animate ring if data updates from API response
  useEffect(() => {
    if (!barsVisible || !ringRef.current) return;
    const offset = CIRC - (CIRC * (data.overallScore / 100));
    ringRef.current.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)';
    ringRef.current.setAttribute('stroke-dashoffset', String(offset));
  }, [data.overallScore, barsVisible]);

  return (
    <main className={shared.page}>
      <PlatformNav active="dashboard" />

      <div className={shared.dashWrap}>
        <div className={shared.container}>

          {/* ── Header ─────────────────────────────────── */}
          <div className={shared.dashHeader}>
            <div>
              <div className={shared.dashGreeting}>
                Welcome back, <em>Founder</em>
              </div>
              <div className={shared.dashSub}>
                Your Growth Intelligence OS · Last updated just now
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className={shared.buttonOutline}
                style={{ fontSize: 12, padding: '7px 14px' }}
                onClick={() => router.push('/sim')}
              >
                Run Simulator
              </button>
              <button
                className={shared.buttonPrimary}
                style={{ fontSize: 12, padding: '7px 14px' }}
                onClick={() => router.push('/match')}
              >
                View Matches
              </button>
            </div>
          </div>

          {/* ── Metric Strip ────────────────────────────── */}
          <div className={shared.metricRow}>
            {data.metrics.map((m, i) => (
              <div key={i} className={shared.metricCell}>
                <div
                  className={`${shared.metricMain} ${metricColor(m.variant)}`}
                  style={i === 1 || i === 4 ? { fontSize: 20 } : undefined}
                >
                  {m.value}
                </div>
                <div className={shared.metricSmall}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* ── Row 1: Overview + Quick Actions ─────────── */}
          <div className={`${shared.dashGrid} ${dash.dashGridSpaced}`}>

            {/* Growth Intelligence Overview */}
            <div className={dash.dashCard}>
              <div className={shared.cardLabel}>Growth Intelligence Overview</div>

              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32, alignItems: 'center' }}>
                {/* Score Ring */}
                <div className={dash.scoreBig}>
                  <svg viewBox="0 0 160 160" width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="80" cy="80" r="68" fill="none" stroke="var(--ink-08)" strokeWidth="10" />
                    <defs>
                      <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c9973a" />
                        <stop offset="100%" stopColor="#e8b85a" />
                      </linearGradient>
                    </defs>
                    <circle
                      ref={ringRef}
                      cx="80" cy="80" r="68"
                      fill="none"
                      stroke="url(#dashGrad)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={CIRC}
                      strokeDashoffset={CIRC}
                    />
                  </svg>
                  <div className={dash.scoreBigVal}>
                    <div className={dash.sbvNum}>{data.overallScore}</div>
                    <div className={dash.sbvDenom}>/100</div>
                  </div>
                </div>

                {/* Headline + Chips */}
                <div>
                  <h3
                    dangerouslySetInnerHTML={{ __html: data.headline }}
                    style={{ fontSize: 22, marginBottom: 10 }}
                  />
                  <p style={{ fontSize: 13.5, color: 'var(--ink-70)', lineHeight: 1.7, marginBottom: 14 }}>
                    {data.summary}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className={`${shared.chip} ${dash.chipActive}`}>
                      Primary Gap: {data.primaryGap}
                    </span>
                    <span className={`${shared.chip} ${dash.chipActive}`}>
                      Top Lever: {data.topLever}
                    </span>
                  </div>
                </div>
              </div>

              {/* Readiness Bars */}
              <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--ink-08)' }}>
                <div className={shared.cardLabel} style={{ marginBottom: 14 }}>Readiness Dimensions</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                  {data.readiness.map(dim => (
                    <div key={dim.name} className={dash.hcBarRow}>
                      <span className={dash.hcBarLbl}>{dim.name}</span>
                      <div className={dash.hcBarTr}>
                        <div
                          className={dash.hcBarFl}
                          style={{
                            width: barsVisible ? `${dim.score}%` : '0%',
                            background: dim.color,
                          }}
                        />
                      </div>
                      <span className={dash.hcBarV}>{dim.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Next Actions */}
            <div className={dash.dashCard}>
              <div className={shared.cardLabel}>Recommended Next Actions</div>
              <div className={dash.qaGrid}>
                <button className={dash.qaTile} onClick={() => router.push('/match')}>
                  <div className={dash.qaIcon}>🤝</div>
                  <div className={dash.qaTitle}>Review {data.metrics[2]?.value ?? '42'} Matches</div>
                  <div className={dash.qaDesc}>Book Discovery Call</div>
                </button>
                <button className={dash.qaTile} onClick={() => router.push('/sim')}>
                  <div className={dash.qaIcon}>📊</div>
                  <div className={dash.qaTitle}>Model Revenue</div>
                  <div className={dash.qaDesc}>+2× scenario</div>
                </button>
                <button className={dash.qaTile} onClick={() => router.push('/expansion')}>
                  <div className={dash.qaIcon}>🌍</div>
                  <div className={dash.qaTitle}>Enter {data.topCountry}</div>
                  <div className={dash.qaDesc}>Top-ranked country</div>
                </button>
                <button className={dash.qaTile} onClick={() => router.push('/hub')}>
                  <div className={dash.qaIcon}>📚</div>
                  <div className={dash.qaTitle}>Read Playbook</div>
                  <div className={dash.qaDesc}>Distribution partnerships</div>
                </button>
              </div>
            </div>
          </div>

          {/* ── Row 2: Feed + AI Advisor ─────────────────── */}
          <div className={shared.dashGrid}>

            {/* Personalised Insights Feed */}
            <div className={dash.dashCard}>
              <div className={shared.cardLabel}>Personalised Insights Feed</div>
              {data.feed.map((item, i) => (
                <div key={i} className={dash.feedItem}>
                  <div className={feedIconClass(item.type)}>◈</div>
                  <div>
                    <div className={dash.fiTitle}>{item.title}</div>
                    <div className={dash.fiDesc}>{item.description}</div>
                    <div className={dash.fiTime}>{item.time} · {item.source}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Advisor */}
            <div className={dash.dashCard}>
              <div className={shared.cardLabel}>AI Advisor · Ask Anything</div>
              <div className={dash.aiInsightBox}>
                <div className={dash.aiInsightLabel}>◈ This Week's AI Insight</div>
                <p className={dash.aiInsightText}>"{data.weeklyInsight}"</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { title: 'What should I do next?',  desc: 'Top 3 prioritised actions' },
                  { title: 'Which country first?',    desc: 'Country fit analysis'       },
                  { title: 'Why are deals stalling?', desc: 'Funnel leakage diagnosis'   },
                ].map(q => (
                  <button key={q.title} className={dash.aiTile}>
                    <div className={dash.qaTitle}>{q.title}</div>
                    <div className={dash.qaDesc}>{q.desc}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
