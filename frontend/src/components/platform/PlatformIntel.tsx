import dynamic from 'next/dynamic';
import { PlatformNav } from './PlatformNav';
import styles from './PlatformView.module.css';

const IntelDemandChart = dynamic(
  () => import('./charts/IntelDemandChart').then((m) => m.IntelDemandChart),
  {
    ssr: false,
    loading: () => <div style={{ height: 260 }}>Loading chart...</div>,
  }
);

export function PlatformIntel() {
  return (
    <main className={styles.page}>
      <PlatformNav active="intel" />

      <section className={styles.intelHero}>
        <div className={styles.container}>
          <div className={styles.intelHeroGrid}>
            <div>
              <div className={styles.eyebrow}>The Bloomberg for Global Expansion</div>
              <h1 className={styles.intelTitle}>
                We don&apos;t give you <em>data.</em>
                <br />
                We tell you <em>where to go,</em>
                <br />
                what to do, <em>how to win.</em>
              </h1>
              <p className={styles.intelSub}>
                Ten live intelligence layers fusing World Bank, UN Comtrade, Google Trends, IMF, OECD, and real-time
                news into one decision engine for leaders ready to scale globally.
              </p>
            </div>
            <aside className={styles.liveWidget}>
              <div className={styles.cardLabel} style={{ color: 'var(--gold)' }}>
                Live Intelligence Feed
              </div>
              <div className={styles.liveItem}>
                <div className={styles.liveTag}>UN Comtrade</div>
                UAE imports of FMCG up 22% YoY. Indian FMCG should prioritise UAE entry in next 6 months.
              </div>
              <div className={styles.liveItem}>
                <div className={styles.liveTag}>Google Trends</div>
                SaaS search demand in Vietnam up 47%. Window opening for B2B SaaS entry via local distributors.
              </div>
              <div className={styles.liveItem}>
                <div className={styles.liveTag}>GNews</div>
                India-UAE CEPA phase 2 signed. Tariffs drop 90% for exporters in Q2.
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className={styles.moduleBody}>
        <div className={styles.container}>
          <div className={styles.card} style={{ marginBottom: 16 }}>
            <div className={styles.cardLabel}>Intelligence Architecture</div>
            <h2 style={{ marginTop: 10, marginBottom: 16, fontSize: 'clamp(30px,4.2vw,48px)' }}>
              Ten data layers, one <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>decision engine.</em>
            </h2>
            <div className={styles.apiGrid}>
              <div className={styles.apiLayer}><div className={styles.apiNum}>01</div><div className={styles.apiTitle}>News and Signals</div><div className={styles.apiSrc}>GNews · Reuters · FT</div></div>
              <div className={styles.apiLayer}><div className={styles.apiNum}>02</div><div className={styles.apiTitle}>Global Markets</div><div className={styles.apiSrc}>World Bank · IMF · OECD</div></div>
              <div className={styles.apiLayer}><div className={styles.apiNum}>03</div><div className={styles.apiTitle}>Demand Trends</div><div className={styles.apiSrc}>Google Trends · Reddit</div></div>
              <div className={styles.apiLayer}><div className={styles.apiNum}>04</div><div className={styles.apiTitle}>Trade Flows</div><div className={styles.apiSrc}>UN Comtrade · WTO</div></div>
              <div className={styles.apiLayer}><div className={styles.apiNum}>05</div><div className={styles.apiTitle}>AI Fusion</div><div className={styles.apiSrc}>Scoring · Semantic synthesis</div></div>
            </div>
          </div>

          <div className={styles.intelReportGrid}>
            <article className={styles.card}>
              <div className={styles.cardLabel}>Top Countries To Expand</div>
              <p className={styles.desc} style={{ fontSize: 13, marginBottom: 12 }}>
                Germany, Netherlands, and UK are currently strongest for your profile based on demand, trade momentum,
                and readiness dimensions.
              </p>
              <div style={{ height: 260 }}>
                <IntelDemandChart />
              </div>
            </article>
            <article className={styles.card}>
              <div className={styles.cardLabel}>Your Next 3 Moves</div>
              <div className={styles.listItem}>
                <div className={styles.listTitle}>1. Validate demand with 10 discovery calls in Germany</div>
                <div className={styles.listDesc}>Next 30 days · Focus on industrial SaaS decision-makers.</div>
              </div>
              <div className={styles.listItem}>
                <div className={styles.listTitle}>2. Shortlist 3 distributor candidates in DACH</div>
                <div className={styles.listDesc}>Days 30-75 · Prioritise partners with 50+ active customer accounts.</div>
              </div>
              <div className={styles.listItem}>
                <div className={styles.listTitle}>3. Localise pricing and commercial terms</div>
                <div className={styles.listDesc}>Days 60-90 · Add EUR invoicing and structured tiered pricing.</div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
