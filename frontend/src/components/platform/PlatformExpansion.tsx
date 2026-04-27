import { PlatformNav } from './PlatformNav';
import styles from './PlatformView.module.css';

export function PlatformExpansion() {
  return (
    <main className={styles.page}>
      <PlatformNav active="expansion" />

      <section className={styles.moduleHero}>
        <div className={styles.container}>
          <div className={styles.moduleEyebrow}>Layer II · Global Expansion OS</div>
          <h1 className={styles.moduleTitle}>
            Decide <em>where to go,</em>
            <br />
            when to enter, and
            <br />
            <em>how to win.</em>
          </h1>
          <p className={styles.moduleSub}>
            WinGroX turns expansion from founder instinct into a structured operating decision. Evaluate market pull,
            channel readiness, regulatory friction, and execution fit before you commit capital.
          </p>
        </div>
      </section>

      <section className={styles.moduleBody}>
        <div className={styles.container}>
          <div className={styles.panelGrid}>
            <article className={styles.card}>
              <div className={styles.cardLabel}>Expansion Readiness Snapshot</div>
              <h2 style={{ marginTop: 10, fontSize: 28 }}>
                Your strongest near-term corridor is <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>DACH</em>.
              </h2>
              <p className={styles.desc} style={{ marginTop: 8 }}>
                Germany and the Netherlands currently offer the best combination of demand quality, partner access,
                pricing tolerance, and execution controllability for your operating profile.
              </p>
            </article>

            <article className={styles.card}>
              <div className={styles.cardLabel}>Operator Guidance</div>
              <div className={styles.listItem}>
                <div className={styles.listTitle}>Run 10 discovery calls before committing local entity setup</div>
                <div className={styles.listDesc}>Validate message-market fit first, then localise packaging and commercial terms.</div>
              </div>
              <div className={styles.listItem}>
                <div className={styles.listTitle}>Prioritise partner-led entry over direct sales</div>
                <div className={styles.listDesc}>Channel leverage is structurally stronger than founder-led outbound for your profile.</div>
              </div>
              <div className={styles.listItem}>
                <div className={styles.listTitle}>Sequence compliance after demand confirmation</div>
                <div className={styles.listDesc}>Avoid overbuilding market operations before qualification is proven.</div>
              </div>
            </article>
          </div>

          <div className={styles.matchGrid}>
            <article className={styles.matchCard}>
              <h3 className={styles.matchTitle}>Germany</h3>
              <p className={styles.matchDesc}>Best for industrial demand depth, distributor quality, and mid-market deal sizes.</p>
              <div className={styles.matchScore}>91/100</div>
            </article>
            <article className={styles.matchCard}>
              <h3 className={styles.matchTitle}>Netherlands</h3>
              <p className={styles.matchDesc}>Best for fast pilot execution, English-first selling, and regional control tower setup.</p>
              <div className={styles.matchScore}>87/100</div>
            </article>
            <article className={styles.matchCard}>
              <h3 className={styles.matchTitle}>United Kingdom</h3>
              <p className={styles.matchDesc}>Strong commercial velocity, but higher CAC pressure and more fragmented buyer motion.</p>
              <div className={styles.matchScore}>79/100</div>
            </article>
          </div>

          <article className={styles.resultsHero}>
            <div className={styles.eyebrow}>90-Day Entry Blueprint</div>
            <h2 className={styles.resultsCount}>
              Build your <em>market-entry sequence.</em>
            </h2>
            <p className={styles.resultsSub}>
              Start with demand proof, then activate local channel access, then tighten pricing, onboarding, and
              regulatory sequencing. This is the operating order that preserves capital and improves first-win odds.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
