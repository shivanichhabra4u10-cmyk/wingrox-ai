import { PlatformNav } from './PlatformNav';
import styles from './PlatformView.module.css';

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
    </main>
  );
}
