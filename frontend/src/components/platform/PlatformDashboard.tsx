import { PlatformNav } from './PlatformNav';
import styles from './PlatformView.module.css';

export function PlatformDashboard() {
  return (
    <main className={styles.page}>
      <PlatformNav active="dashboard" />

      <section className={styles.dashWrap}>
        <div className={styles.container}>
          <header className={styles.dashHeader}>
            <div>
              <h1 className={styles.dashGreeting}>
                Welcome back, <em>Founder</em>
              </h1>
              <p className={styles.dashSub}>Your Growth Intelligence OS · Last updated just now</p>
            </div>
          </header>

          <div className={styles.metricRow}>
            <div className={styles.metricCell}>
              <div className={`${styles.metricMain} ${styles.metricMainGold}`}>64</div>
              <div className={styles.metricSmall}>Twin Score</div>
            </div>
            <div className={styles.metricCell}>
              <div className={`${styles.metricMain} ${styles.metricMainGold}`} style={{ fontSize: '20px' }}>
                Experimenter
              </div>
              <div className={styles.metricSmall}>Cluster Stage</div>
            </div>
            <div className={styles.metricCell}>
              <div className={`${styles.metricMain} ${styles.metricMainSage}`}>42</div>
              <div className={styles.metricSmall}>Matches</div>
            </div>
            <div className={styles.metricCell}>
              <div className={styles.metricMain}>EUR180K</div>
              <div className={styles.metricSmall}>Pipeline Est.</div>
            </div>
            <div className={styles.metricCell}>
              <div className={`${styles.metricMain} ${styles.metricMainRose}`} style={{ fontSize: '20px' }}>
                Demand
              </div>
              <div className={styles.metricSmall}>Primary Constraint</div>
            </div>
          </div>

          <div className={styles.dashGrid}>
            <article className={styles.card}>
              <div className={styles.cardLabel}>Growth Intelligence Overview</div>
              <h3 style={{ marginTop: '10px', fontSize: '22px' }}>
                You&apos;re at the <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Experimenter</em> stage.
              </h3>
              <p className={styles.desc} style={{ fontSize: '13.5px', marginTop: '8px' }}>
                Your Digital Twin is capable of entering Europe - but conversion depends on how structured your next 90 days
                are. Focus on demand pipeline, partner readiness, and value proposition sharpening.
              </p>
            </article>

            <aside className={styles.card}>
              <div className={styles.cardLabel}>Personalised Insights Feed</div>
              <div style={{ marginTop: '10px' }}>
                <div className={styles.listItem}>
                  <div className={styles.listTitle}>3 new playbooks matched to your GTM needs</div>
                  <div className={styles.listDesc}>Distribution-led entry for industrial SaaS in Germany and 2 others.</div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listTitle}>7 new matches added in last 48 hours</div>
                  <div className={styles.listDesc}>Including Tier-1 VCs in London and distributors in DACH.</div>
                </div>
                <div className={styles.listItem}>
                  <div className={styles.listTitle}>Risk alert: Demand pipeline below threshold</div>
                  <div className={styles.listDesc}>Recommendation: run 15 structured EU prospect calls in next 30 days.</div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
