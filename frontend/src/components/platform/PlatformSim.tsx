'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { PlatformNav } from './PlatformNav';
import styles from './PlatformView.module.css';

const SimScenarioChart = dynamic(
  () => import('./charts/SimScenarioChart').then((m) => m.SimScenarioChart),
  {
    ssr: false,
    loading: () => <div style={{ height: 300 }}>Loading chart...</div>,
  }
);

export function PlatformSim() {
  const [revenue, setRevenue] = useState(80);
  const [growth, setGrowth] = useState(8);
  const [margin, setMargin] = useState(68);
  const [burn, setBurn] = useState(120);

  const projection = useMemo(() => {
    const labels = Array.from({ length: 13 }, (_, i) => `M${i}`);
    const base = labels.map((_, i) => revenue * Math.pow(1 + growth / 100, i));
    const best = labels.map((_, i) => revenue * Math.pow(1 + (growth + 4) / 100, i));
    const worst = labels.map((_, i) => revenue * Math.pow(1 + Math.max(growth - 5, 0) / 100, i));

    const endRevenue = base[base.length - 1];
    const cumulative = base.reduce((sum, value) => sum + value, 0);
    const runRate = endRevenue / revenue;

    const contribution = endRevenue * (margin / 100);
    const burnGap = burn - contribution;

    return {
      labels,
      best,
      base,
      worst,
      endRevenue,
      cumulative,
      runRate,
      burnGap,
    };
  }, [revenue, growth, margin, burn]);

  return (
    <main className={styles.page}>
      <PlatformNav active="sim" />

      <section className={styles.moduleHero}>
        <div className={styles.container}>
          <div className={styles.moduleEyebrow}>Layer V · Growth Simulator Suite</div>
          <h1 className={styles.moduleTitle}>
            Model your <em>future</em> - before you bet on it.
          </h1>
          <p className={styles.moduleSub}>
            Enter your inputs once. Run scenarios for growth, profitability, runway, and timing - every lever updates in
            real time.
          </p>
        </div>
      </section>

      <section className={styles.simTabs}>
        <div className={styles.container}>
          <div className={styles.simTabsInner}>
            <span className={`${styles.simTab} ${styles.simTabActive}`}>Top-Line Growth</span>
            <span className={styles.simTab}>Bottom-Line</span>
            <span className={styles.simTab}>Market Expansion</span>
            <span className={styles.simTab}>Cash Runway</span>
            <span className={styles.simTab}>Fundraise Timing</span>
            <span className={styles.simTab}>Best / Base / Worst</span>
          </div>
        </div>
      </section>

      <section className={styles.moduleBody}>
        <div className={styles.container}>
          <div className={styles.simGrid}>
            <aside className={styles.simPanel}>
              <div className={styles.cardLabel} style={{ color: 'var(--gold)' }}>
                Your Inputs
              </div>

              <div className={styles.simField}>
                <div className={styles.simLabel}>
                  <span>Monthly Revenue (USD K)</span>
                  <span className={styles.simValue}>{revenue}</span>
                </div>
                <input className={styles.simSlider} type="range" min={10} max={500} value={revenue} onChange={(e) => setRevenue(Number(e.target.value))} />
              </div>

              <div className={styles.simField}>
                <div className={styles.simLabel}>
                  <span>Monthly Growth (%)</span>
                  <span className={styles.simValue}>{growth}</span>
                </div>
                <input className={styles.simSlider} type="range" min={0} max={25} value={growth} onChange={(e) => setGrowth(Number(e.target.value))} />
              </div>

              <div className={styles.simField}>
                <div className={styles.simLabel}>
                  <span>Gross Margin (%)</span>
                  <span className={styles.simValue}>{margin}</span>
                </div>
                <input className={styles.simSlider} type="range" min={30} max={90} value={margin} onChange={(e) => setMargin(Number(e.target.value))} />
              </div>

              <div className={styles.simField}>
                <div className={styles.simLabel}>
                  <span>Monthly Burn (USD K)</span>
                  <span className={styles.simValue}>{burn}</span>
                </div>
                <input className={styles.simSlider} type="range" min={30} max={400} value={burn} onChange={(e) => setBurn(Number(e.target.value))} />
              </div>
            </aside>

            <section>
              <div className={styles.simMetrics}>
                <article className={styles.simMetric}>
                  <div className={styles.cardLabel}>End-of-Horizon Revenue</div>
                  <div className={styles.simMetricValue}>${projection.endRevenue.toFixed(0)}K</div>
                </article>
                <article className={styles.simMetric}>
                  <div className={styles.cardLabel}>Cumulative Revenue</div>
                  <div className={styles.simMetricValue}>${projection.cumulative.toFixed(0)}K</div>
                </article>
                <article className={styles.simMetric}>
                  <div className={styles.cardLabel}>Run Rate Multiple</div>
                  <div className={styles.simMetricValue}>{projection.runRate.toFixed(1)}x</div>
                </article>
              </div>

              <article className={styles.card}>
                <div className={styles.cardLabel}>Best / Base / Worst Scenario</div>
                <div style={{ height: 300, marginTop: 10 }}>
                  <SimScenarioChart labels={projection.labels} best={projection.best} base={projection.base} worst={projection.worst} />
                </div>
                <p className={styles.simNote}>
                  At {growth}% monthly growth, your month-12 trajectory implies {projection.runRate.toFixed(1)}x run-rate growth.
                  {projection.burnGap > 0
                    ? ` Contribution is below burn by ${projection.burnGap.toFixed(0)}K; improving margin or growth should be your first lever.`
                    : ' Contribution now covers burn; this is a strong position for expansion and fundraising.'}
                </p>
              </article>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
