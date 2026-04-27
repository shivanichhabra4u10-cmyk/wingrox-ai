import Link from 'next/link';
import { PlatformNav } from './PlatformNav';
import styles from './PlatformView.module.css';

const LAYERS = [
  {
    num: 'I',
    engine: 'DIGITAL TWIN ENGINE',
    title: 'Identity & Twin',
    desc: 'Company profile, capability mapping, pain intelligence, competitive benchmarking.',
    href: '/twin',
  },
  {
    num: 'II',
    engine: 'EXPANSION ENGINE',
    title: 'Scale Navigator',
    desc: 'Readiness scoring, country comparison, GTM strategy, regulatory mapping.',
    href: '/expansion',
  },
  {
    num: 'III',
    engine: 'MATCH INTELLIGENCE',
    title: 'Matchmaking',
    desc: 'Investors, distributors, JV partners matched by compatibility and probability.',
    href: '/match',
  },
  {
    num: 'IV',
    engine: 'INTELLIGENCE HUB',
    title: 'Knowledge Hub',
    desc: 'Personalised playbooks and market intel with AI-generated what this means for you.',
    href: '/hub',
  },
  {
    num: 'V',
    engine: 'SIMULATOR SUITE',
    title: 'Simulators',
    desc: 'Market potential, profitability, risk, success probability, all modellable in real time.',
    href: '/sim',
  },
];

const FEATURES = [
  {
    title: 'Adaptive Diagnostic',
    desc: '77+ questions that reshape based on your sector, model, stage, and intent. Followed by an AI layer that asks what fixed questions miss.',
    cta: 'Build Your Twin',
    href: '/twin',
    accent: 'var(--gold)',
    iconBg: 'var(--gold-mist)',
  },
  {
    title: 'Country Radar',
    desc: 'Market attractiveness, regulatory complexity, entry pathways, distributor-led to JV to direct entry. Modelled against your profile.',
    cta: 'Explore Markets',
    href: '/expansion',
    accent: 'var(--teal)',
    iconBg: 'var(--teal-pale)',
  },
  {
    title: 'Match Intelligence',
    desc: 'AI-scored matches with investors, distributors, JV partners. See count and heatmap first, unlock via free Discovery Call.',
    cta: 'See Your Matches',
    href: '/match',
    accent: 'var(--slate)',
    iconBg: 'var(--slate-pale)',
  },
  {
    title: 'Growth Simulators',
    desc: 'Revenue, profitability, expansion risk, success probability. Adjust levers and see 12-month and 5-year trajectories update instantly.',
    cta: 'Run Simulations',
    href: '/sim',
    accent: 'var(--sage)',
    iconBg: 'var(--sage-pale)',
  },
  {
    title: 'Intelligence Hub',
    desc: 'Personalised playbooks and market intel. Every piece answers what this means for you, and what you should do about it.',
    cta: 'Open Hub',
    href: '/hub',
    accent: 'var(--amber)',
    iconBg: 'var(--amber-pale)',
  },
  {
    title: 'Ecosystem Cloud',
    desc: 'Become a partner: investor, distributor, consultant, accelerator. Legally compliant onboarding with NDA and digital signature.',
    cta: 'Join the Cloud',
    href: '/eco',
    accent: 'var(--rose)',
    iconBg: 'var(--rose-pale)',
  },
];

const JOURNEY = [
  {
    step: '1',
    title: 'Land & Commit',
    desc: 'Understand the WinGroX premise. Decide to build your Growth Intelligence in under 30 minutes.',
  },
  {
    step: '2',
    title: 'Build Your Twin',
    desc: 'Company profile, capabilities, pain areas, goals, the foundation for every intelligent output after.',
  },
  {
    step: '3',
    title: 'See Your Dashboard',
    desc: 'Twin Score, Expansion Readiness, Match Potential, Insights Feed, Recommended Actions, live.',
  },
  {
    step: '4',
    title: 'Explore & Execute',
    desc: 'Run simulators, unlock matches via Discovery Call, track your growth score weekly.',
  },
];

export function PlatformHome() {
  return (
    <main className={styles.page}>
      <PlatformNav active="home" />

      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <div className={styles.eyebrow}>The World&apos;s First Growth Intelligence OS</div>
              <h1 className={styles.heroTitle}>
                Understand your business.
                <br />
                <em>Simulate</em> your future.
                <br />
                Find your <em>people.</em>
              </h1>
              <p className={styles.heroSub}>
                WinGroX AI is the first unified platform where founders build a digital twin of their business, assess global
                expansion readiness, match with investors and partners, and simulate growth - all in one intelligent ecosystem.
              </p>
              <p className={styles.heroTagline}>McKinsey meets Y Combinator meets PitchBook - with AI at the core.</p>

              <div className={styles.heroMetrics}>
                <div>
                  <div className={styles.metricValue}>5</div>
                  <div className={styles.metricLabel}>Core Layers</div>
                </div>
                <div>
                  <div className={styles.metricValue}>
                    77<em>+</em>
                  </div>
                  <div className={styles.metricLabel}>Diagnostic Variables</div>
                </div>
                <div>
                  <div className={styles.metricValue}>
                    48<em>+</em>
                  </div>
                  <div className={styles.metricLabel}>Countries Mapped</div>
                </div>
                <div>
                  <div className={styles.metricValue}>
                    340<em>+</em>
                  </div>
                  <div className={styles.metricLabel}>Companies Modelled</div>
                </div>
              </div>
            </div>

            <aside className={styles.card}>
              <div className={styles.cardLabel}>Sample · Growth Intelligence Snapshot</div>
              <div className={styles.scoreRow}>
                <div className={styles.scoreCircle}>64</div>
                <div>
                  <span className={styles.cluster}>Experimenter Stage</span>
                  <p className={styles.desc}>Ready to enter Europe - structured execution required for first deal conversion.</p>
                </div>
              </div>
              <div className={styles.bars}>
                <div className={styles.barRow}>
                  <span>Digital Twin</span>
                  <div className={styles.track}>
                    <div className={styles.fill} style={{ width: '72%', background: 'var(--gold)' }} />
                  </div>
                  <span>72</span>
                </div>
                <div className={styles.barRow}>
                  <span>Expansion</span>
                  <div className={styles.track}>
                    <div className={styles.fill} style={{ width: '64%', background: 'var(--teal)' }} />
                  </div>
                  <span>64</span>
                </div>
                <div className={styles.barRow}>
                  <span>Match Potential</span>
                  <div className={styles.track}>
                    <div className={styles.fill} style={{ width: '81%', background: 'var(--sage)' }} />
                  </div>
                  <span>81</span>
                </div>
                <div className={styles.barRow}>
                  <span>Deal Readiness</span>
                  <div className={styles.track}>
                    <div className={styles.fill} style={{ width: '58%', background: 'var(--slate)' }} />
                  </div>
                  <span>58</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="layers" style={{ padding: '110px 0', background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 64px' }}>
            <div className="section-label" style={{ justifyContent: 'center', display: 'inline-flex' }}>
              Platform Architecture
            </div>
            <h2 style={{ fontSize: 'clamp(32px,4.5vw,52px)', marginBottom: 16 }}>
              Five intelligent layers,
              <br />
              one <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>unified ecosystem.</em>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ink-70)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
              Each layer builds on the one before. Together, they create the most complete operating system for founder decision-making ever built.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5,1fr)',
              gap: 0,
              position: 'relative',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: 36,
                left: '8%',
                right: '8%',
                height: 1,
                background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
              }}
            />
            {LAYERS.map((layer) => (
              <Link
                key={layer.num}
                href={layer.href}
                style={{
                  padding: '0 20px',
                  textAlign: 'center',
                  position: 'relative',
                  zIndex: 1,
                  transition: 'transform .3s',
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'var(--surface)',
                    border: '2px solid var(--gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--f-display)',
                    fontSize: 22,
                    color: 'var(--gold)',
                    margin: '0 auto 22px',
                  }}
                >
                  {layer.num}
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gold-deep)', marginBottom: 10 }}>
                  {layer.engine}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>{layer.title}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-70)', lineHeight: 1.65 }}>{layer.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '110px 0', background: 'var(--bg-warm)' }}>
        <div className="container">
          <div className="section-label">Featured Capabilities</div>
          <h2 style={{ fontSize: 'clamp(30px,4vw,46px)', marginBottom: 14 }}>
            Built for founders who want
            <br />
            <em style={{ fontStyle: 'italic' }}>signal, not noise.</em>
          </h2>
          <p style={{ fontSize: 15, color: 'var(--ink-70)', maxWidth: 540, lineHeight: 1.7 }}>
            Every feature solves a specific leadership question. No padding. No generic dashboards.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginTop: 52 }}>
            {FEATURES.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="module-card"
                style={{
                  ['--accent' as string]: feature.accent,
                  ['--icon-bg' as string]: feature.iconBg,
                }}
              >
                <div className="mc-icon-wrap">&#9672;</div>
                <div className="mc-title">{feature.title}</div>
                <div className="mc-desc">{feature.desc}</div>
                <div className="mc-link">{feature.cta}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '110px 0', background: 'var(--surface)' }}>
        <div className="container">
          <div className="section-label">The Founder Journey</div>
          <h2 style={{ fontSize: 'clamp(30px,4vw,46px)', marginBottom: 14 }}>
            From <em style={{ fontStyle: 'italic' }}>insight</em> to <em style={{ fontStyle: 'italic' }}>action</em> to <em style={{ fontStyle: 'italic' }}>outcome.</em>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, marginTop: 48 }}>
            {JOURNEY.map((item) => (
              <article
                key={item.step}
                style={{
                  background: 'var(--bg-warm)',
                  borderRadius: 'var(--r-xl)',
                  padding: '28px 24px',
                  textAlign: 'center',
                  border: '1px solid var(--ink-08)',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'var(--bg-dark)',
                    color: 'var(--bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 600,
                    margin: '0 auto 16px',
                  }}
                >
                  {item.step}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--ink)' }}>{item.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-70)', lineHeight: 1.6 }}>{item.desc}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '120px 0', textAlign: 'center', background: 'linear-gradient(135deg,var(--bg-dark) 0%,#2a2515 100%)', position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 800,
            height: 800,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,151,58,.15) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-label" style={{ justifyContent: 'center', display: 'inline-flex', color: 'var(--gold)' }}>
            Ready to Begin?
          </div>
          <h2 style={{ fontSize: 'clamp(34px,5vw,60px)', color: 'var(--bg)', margin: '0 auto 18px', maxWidth: 760 }}>
            This platform will understand
            <br />
            your business <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>better than you do.</em>
          </h2>
          <p style={{ color: 'rgba(255,255,255,.6)', maxWidth: 520, margin: '0 auto 36px', fontSize: 17, lineHeight: 1.7, fontWeight: 300 }}>
            Start free. Build your Digital Twin. Unlock the first layer of intelligence in under 30 minutes.
          </p>
          <Link href="/twin" className="btn-gold">
            Build Your Growth Intelligence - Free
          </Link>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 16 }}>
            No credit card &middot; Instant access &middot; AI-native from day one
          </p>
        </div>
      </section>

      <footer style={{ background: 'var(--bg-darker)', padding: '40px 0', borderTop: '1px solid rgba(255,255,255,.05)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ fontFamily: 'var(--f-display)', fontSize: 17, color: 'rgba(255,255,255,.55)' }}>
            WinGroX <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>AI</em> &middot; Growth Intelligence OS
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>
            &copy; 2026 WinGroX AI Pvt. Ltd. &middot; Bloomberg for Growth. Y Combinator for Execution. McKinsey for Strategy.
          </div>
        </div>
      </footer>
    </main>
  );
}
