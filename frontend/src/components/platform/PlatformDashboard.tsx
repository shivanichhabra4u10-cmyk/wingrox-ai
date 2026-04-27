import Link from 'next/link';
import { PlatformNav } from './PlatformNav';
import styles from './PlatformView.module.css';

export function PlatformDashboard() {
  return (
    <main className={styles.page}>
      <PlatformNav active="dashboard" />

      <section className="dash-wrap">
        <div className="container">
          <header className="dash-header">
            <div>
              <h1 className="dash-greeting">
                Welcome back, <em>Founder</em>
              </h1>
              <p className="dash-sub">Your Growth Intelligence OS · Last updated just now</p>
            </div>
            <div className="dash-actions">
              <Link href="/sim" className="btn-outline btn-sm">
                Run Simulator
              </Link>
              <Link href="/match" className="btn-primary btn-sm">
                View Matches
              </Link>
            </div>
          </header>

          <div className="dash-metric-row">
            <div className="dm-cell">
              <div className="dm-val a">64</div>
              <div className="dm-lbl">Twin Score</div>
            </div>
            <div className="dm-cell">
              <div className="dm-val a" style={{ fontSize: 20 }}>
                Experimenter
              </div>
              <div className="dm-lbl">Cluster Stage</div>
            </div>
            <div className="dm-cell">
              <div className="dm-val g">42</div>
              <div className="dm-lbl">Matches</div>
            </div>
            <div className="dm-cell">
              <div className="dm-val">€180K</div>
              <div className="dm-lbl">Pipeline Est.</div>
            </div>
            <div className="dm-cell">
              <div className="dm-val r" style={{ fontSize: 20 }}>
                Demand
              </div>
              <div className="dm-lbl">Primary Constraint</div>
            </div>
          </div>

          <div className="dash-grid">
            <div className="dash-card">
              <div className="dc-label">Growth Intelligence Overview</div>
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32, alignItems: 'center' }}>
                <div className="score-big">
                  <svg viewBox="0 0 160 160" width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="80" cy="80" r="68" fill="none" stroke="var(--ink-08)" strokeWidth="10" />
                    <circle
                      cx="80"
                      cy="80"
                      r="68"
                      fill="none"
                      stroke="url(#dg-dashboard)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray="427"
                      strokeDashoffset="154"
                    />
                    <defs>
                      <linearGradient id="dg-dashboard" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c9973a" />
                        <stop offset="100%" stopColor="#e8b85a" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="score-big-val">
                    <div className="sbv-num">64</div>
                    <div className="sbv-denom">/100</div>
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: 22, marginBottom: 10 }}>
                    You&apos;re at the <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Experimenter</em> stage.
                  </h3>
                  <p style={{ fontSize: 13.5, color: 'var(--ink-70)', lineHeight: 1.7, marginBottom: 14 }}>
                    Your Digital Twin is capable of entering Europe, but conversion depends on how structured your next 90 days are. Focus on demand pipeline, partner readiness, and value proposition sharpening.
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className="chip active" style={{ cursor: 'default' }}>
                      Primary Gap: Demand Pipeline
                    </span>
                    <span className="chip active" style={{ cursor: 'default' }}>
                      Top Lever: Conversion
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--ink-08)' }}>
                <div className="dc-label" style={{ marginBottom: 14 }}>
                  Readiness Dimensions
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                  <div className="hc-bar-row">
                    <span className="hc-bar-lbl" style={{ fontSize: 12.5 }}>
                      Demand
                    </span>
                    <div className="hc-bar-tr">
                      <div className="hc-bar-fl" style={{ width: '58%', background: 'var(--rose)' }} />
                    </div>
                    <span className="hc-bar-v">58</span>
                  </div>
                  <div className="hc-bar-row">
                    <span className="hc-bar-lbl" style={{ fontSize: 12.5 }}>
                      Strategy
                    </span>
                    <div className="hc-bar-tr">
                      <div className="hc-bar-fl" style={{ width: '62%', background: 'var(--amber)' }} />
                    </div>
                    <span className="hc-bar-v">62</span>
                  </div>
                  <div className="hc-bar-row">
                    <span className="hc-bar-lbl" style={{ fontSize: 12.5 }}>
                      Competition
                    </span>
                    <div className="hc-bar-tr">
                      <div className="hc-bar-fl" style={{ width: '60%', background: 'var(--amber)' }} />
                    </div>
                    <span className="hc-bar-v">60</span>
                  </div>
                  <div className="hc-bar-row">
                    <span className="hc-bar-lbl" style={{ fontSize: 12.5 }}>
                      Economics
                    </span>
                    <div className="hc-bar-tr">
                      <div className="hc-bar-fl" style={{ width: '66%', background: 'var(--gold)' }} />
                    </div>
                    <span className="hc-bar-v">66</span>
                  </div>
                  <div className="hc-bar-row">
                    <span className="hc-bar-lbl" style={{ fontSize: 12.5 }}>
                      Customer
                    </span>
                    <div className="hc-bar-tr">
                      <div className="hc-bar-fl" style={{ width: '59%', background: 'var(--rose)' }} />
                    </div>
                    <span className="hc-bar-v">59</span>
                  </div>
                  <div className="hc-bar-row">
                    <span className="hc-bar-lbl" style={{ fontSize: 12.5 }}>
                      Execution
                    </span>
                    <div className="hc-bar-tr">
                      <div className="hc-bar-fl" style={{ width: '70%', background: 'var(--sage)' }} />
                    </div>
                    <span className="hc-bar-v">70</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dash-card">
              <div className="dc-label">Recommended Next Actions</div>
              <div className="qa-grid">
                <Link href="/match" className="qa-tile">
                  <div className="qa-icon">&#129309;</div>
                  <div className="qa-title">Review 42 Matches</div>
                  <div className="qa-desc">Book Discovery Call</div>
                </Link>
                <Link href="/sim" className="qa-tile">
                  <div className="qa-icon">&#128202;</div>
                  <div className="qa-title">Model Revenue</div>
                  <div className="qa-desc">+2× scenario</div>
                </Link>
                <Link href="/expansion" className="qa-tile">
                  <div className="qa-icon">&#127757;</div>
                  <div className="qa-title">Enter Germany</div>
                  <div className="qa-desc">Top-ranked country</div>
                </Link>
                <Link href="/hub" className="qa-tile">
                  <div className="qa-icon">&#128218;</div>
                  <div className="qa-title">Read Playbook</div>
                  <div className="qa-desc">Distribution partnerships</div>
                </Link>
              </div>
            </div>
          </div>

          <div className="dash-grid">
            <div className="dash-card">
              <div className="dc-label">Personalised Insights Feed</div>
              <div className="feed-item">
                <div className="fi-icon insight">&#9672;</div>
                <div>
                  <div className="fi-title">3 new playbooks matched to your GTM needs</div>
                  <div className="fi-desc">
                    Distribution-led entry for industrial SaaS in Germany and 2 others just published in the Intelligence Hub.
                  </div>
                  <div className="fi-time">15 minutes ago · Intelligence Hub</div>
                </div>
              </div>
              <div className="feed-item">
                <div className="fi-icon match">&#9672;</div>
                <div>
                  <div className="fi-title">7 new matches added in last 48 hours</div>
                  <div className="fi-desc">Including 2 Tier-1 VCs in London and 3 industrial distributors in DACH region.</div>
                  <div className="fi-time">2 hours ago · Match Engine</div>
                </div>
              </div>
              <div className="feed-item">
                <div className="fi-icon milestone">&#9672;</div>
                <div>
                  <div className="fi-title">You&apos;re now expansion-ready for Netherlands</div>
                  <div className="fi-desc">
                    Your recent answers unlocked Netherlands as a viable secondary entry market (fit score: 78/100).
                  </div>
                  <div className="fi-time">Yesterday · Expansion Engine</div>
                </div>
              </div>
              <div className="feed-item">
                <div className="fi-icon alert">&#9672;</div>
                <div>
                  <div className="fi-title">Risk alert: Demand pipeline below threshold</div>
                  <div className="fi-desc">
                    Your demand score of 58 is the #1 blocker to first deal. Recommendation: Run 15 structured EU prospect calls in next 30 days.
                  </div>
                  <div className="fi-time">Yesterday · AI Advisor</div>
                </div>
              </div>
            </div>

            <aside className="dash-card">
              <div className="dc-label">AI Advisor · Ask Anything</div>
              <div style={{ background: 'var(--bg-warm)', borderRadius: 'var(--r)', padding: 20, marginBottom: 14 }}>
                <div
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 10,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    color: 'var(--gold-deep)',
                    marginBottom: 8,
                  }}
                >
                  &#9672; This Week&apos;s AI Insight
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--ink-70)', fontStyle: 'italic' }}>
                  Your conversion rate of 5% on 500 leads is leaving €180K/month on the table. Improving conversion by just 30%, from 5% to 6.5%, adds €54K monthly with zero new leads required. Focus here before spending more on acquisition.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="qa-tile" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div className="qa-title">What should I do next?</div>
                  <div className="qa-desc">Top 3 prioritised actions</div>
                </button>
                <button className="qa-tile" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div className="qa-title">Which country first?</div>
                  <div className="qa-desc">Country fit analysis</div>
                </button>
                <button className="qa-tile" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div className="qa-title">Why are deals stalling?</div>
                  <div className="qa-desc">Funnel leakage diagnosis</div>
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
