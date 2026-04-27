import { PlatformNav } from './PlatformNav';
import styles from './PlatformView.module.css';

export function PlatformEco() {
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
                Your application is signed, secured, and under review. Once approved, WinGroX unlocks partner intros,
                private operator circles, and commercial readiness support.
              </p>
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
              <div className={styles.matchScore}>42 live fits</div>
            </article>
            <article className={styles.matchCard}>
              <h3 className={styles.matchTitle}>Distribution Partners</h3>
              <p className={styles.matchDesc}>Commercial operators with active access to your target customer segments.</p>
              <div className={styles.matchScore}>67 active nodes</div>
            </article>
            <article className={styles.matchCard}>
              <h3 className={styles.matchTitle}>Expert Operators</h3>
              <p className={styles.matchDesc}>Leaders who have already built, sold, expanded, and raised in your target contexts.</p>
              <div className={styles.matchScore}>120+ experts</div>
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
          </article>
        </div>
      </section>
    </main>
  );
}
