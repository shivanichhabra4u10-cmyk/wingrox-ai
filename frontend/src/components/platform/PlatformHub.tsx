import { PlatformNav } from './PlatformNav';
import styles from './PlatformView.module.css';

export function PlatformHub() {
  return (
    <main className={styles.page}>
      <PlatformNav active="hub" />

      <section className={styles.moduleHero}>
        <div className={styles.container}>
          <div className={styles.moduleEyebrow}>Layer IV · Intelligence Hub</div>
          <h1 className={styles.moduleTitle}>
            Playbooks and intel, with <em>what this means for you</em> built in.
          </h1>
          <p className={styles.moduleSub}>
            Every piece of content is filtered through your Digital Twin. No generic news feed - only what matters for
            your sector, stage, and target markets.
          </p>
        </div>
      </section>

      <section className={styles.moduleBody}>
        <div className={styles.container}>
          <div className={styles.hubLayout}>
            <aside className={styles.filtersCard}>
              <div className={styles.cardLabel}>Topics</div>
              <div className={styles.filterTitle}>Topic Filters</div>
              <div className={styles.filterItem}><span>Go-to-Market</span><span>24</span></div>
              <div className={styles.filterItem}><span>Global Expansion</span><span>18</span></div>
              <div className={styles.filterItem}><span>Fundraising</span><span>12</span></div>
              <div className={styles.filterItem}><span>Unit Economics</span><span>9</span></div>
              <div className={styles.filterItem}><span>Leadership and Org</span><span>7</span></div>
              <div className={styles.filterItem}><span>Regulation</span><span>6</span></div>

              <div className={styles.filterTitle}>Content Type</div>
              <div className={styles.filterItem}><span>Playbooks</span><span>on</span></div>
              <div className={styles.filterItem}><span>Market Intel</span><span>on</span></div>
              <div className={styles.filterItem}><span>Benchmarks</span><span>off</span></div>
              <div className={styles.filterItem}><span>Case Studies</span><span>off</span></div>
            </aside>

            <section>
              <div className={styles.feedHeader}>
                <h2 className={styles.feedTitle}>Your Personalised Feed</h2>
                <select className={styles.fieldInput} style={{ maxWidth: '220px' }} defaultValue="Most relevant to you">
                  <option>Most relevant to you</option>
                  <option>Newest first</option>
                  <option>Most saved</option>
                </select>
              </div>

              <article className={styles.feedCard}>
                <div className={styles.feedMeta}>
                  <span className={styles.pill}>Playbook</span>
                  <span className={styles.pill}>Global Expansion</span>
                  <span className={styles.feedTime}>18 min read · Updated 2d ago</span>
                </div>
                <h3 className={styles.feedHeading}>Distribution-led entry for industrial SaaS in Germany: the 90-day playbook</h3>
                <p className={styles.feedBody}>
                  A structured framework covering partner identification, qualification, pilots, and contract structuring -
                  built from 40+ successful entries in the DACH region. Includes a ready-to-use term sheet.
                </p>
                <div className={styles.feedInsight}>
                  <div className={styles.feedInsightLabel}>What This Means For You</div>
                  <p className={styles.feedInsightText}>
                    You&apos;re within 2 weeks of being ready to execute steps 1 to 3 of this playbook. Your Distribution Fit
                    score is 82 for Germany - above the threshold this framework assumes.
                  </p>
                </div>
              </article>

              <article className={styles.feedCard}>
                <div className={styles.feedMeta}>
                  <span className={styles.pill}>Market Intel</span>
                  <span className={styles.pill}>Go-to-Market</span>
                  <span className={styles.feedTime}>8 min · 5d ago</span>
                </div>
                <h3 className={styles.feedHeading}>DACH industrial automation buyers - what moved in Q1 2026</h3>
                <p className={styles.feedBody}>
                  Budget cycles, procurement shifts, and new regulatory triggers reshaping buyer behaviour this quarter.
                </p>
                <div className={styles.feedInsight}>
                  <div className={styles.feedInsightLabel}>What This Means For You</div>
                  <p className={styles.feedInsightText}>
                    Your ICP overlaps 80% with the buyer profile. The cybersecurity certification trigger is the single
                    biggest near-term demand accelerator for your category.
                  </p>
                </div>
              </article>

              <article className={styles.feedCard}>
                <div className={styles.feedMeta}>
                  <span className={styles.pill}>Playbook</span>
                  <span className={styles.pill}>Unit Economics</span>
                  <span className={styles.feedTime}>12 min · 1w ago</span>
                </div>
                <h3 className={styles.feedHeading}>The CAC:LTV conversation investors actually want at Seed to Series A</h3>
                <p className={styles.feedBody}>
                  Why most founders over-simplify this metric and what tier-1 European VCs actually probe, with slide-ready
                  charts and a cohort analysis template.
                </p>
              </article>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
