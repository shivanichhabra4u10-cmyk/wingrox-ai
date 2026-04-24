import { PlatformNav } from './PlatformNav';
import styles from './PlatformView.module.css';

export function PlatformMatch() {
  return (
    <main className={styles.page}>
      <PlatformNav active="match" />

      <section className={styles.moduleHero}>
        <div className={styles.container}>
          <div className={styles.moduleEyebrow}>Layer III · Match Intelligence Engine</div>
          <h1 className={styles.moduleTitle}>
            Find your <em>next partner,</em>
            <br />
            investor, or distributor.
          </h1>
          <p className={styles.moduleSub}>
            Tell us your intent and priorities. Our AI scans 8,400+ verified ecosystem partners and returns your top
            matches - anonymised until you book a Discovery Call.
          </p>
        </div>
      </section>

      <section className={styles.moduleBody}>
        <div className={styles.container}>
          <div className={styles.stepper}>
            <div className={styles.stepItem}>
              <span className={styles.stepCircle}>1</span>
              <span className={styles.stepText}>Your Profile</span>
            </div>
            <div className={styles.stepItem}>
              <span className={styles.stepCircle}>2</span>
              <span className={styles.stepText}>Intent and Priorities</span>
            </div>
            <div className={styles.stepItem}>
              <span className={styles.stepCircle}>3</span>
              <span className={styles.stepText}>AI Matching</span>
            </div>
            <div className={styles.stepItem}>
              <span className={styles.stepCircle}>4</span>
              <span className={styles.stepText}>Your Matches</span>
            </div>
          </div>

          <article className={styles.formCard}>
            <div className={styles.cardLabel}>Step 1 of 4 · Your Profile</div>
            <h2 className={styles.formTitle}>
              Tell us about <em>your business.</em>
            </h2>
            <p className={styles.formDesc}>
              Stays confidential. Used only to shape your match pool - never shared with partners until you opt in.
            </p>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Company Name</label>
                <input className={styles.fieldInput} defaultValue="Your legal entity" />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>HQ Country</label>
                <select className={styles.fieldInput} defaultValue="India">
                  <option>India</option>
                  <option>United Kingdom</option>
                  <option>Germany</option>
                  <option>Netherlands</option>
                  <option>France</option>
                  <option>United States</option>
                  <option>Singapore</option>
                  <option>UAE</option>
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Sector</label>
              <div className={styles.chipGroup}>
                <span className={styles.chip}>Industrial and Manufacturing</span>
                <span className={styles.chip}>B2B SaaS</span>
                <span className={styles.chip}>Healthcare and Life Sci.</span>
                <span className={styles.chip}>Fintech</span>
                <span className={styles.chip}>Climate and Energy</span>
                <span className={styles.chip}>Consumer and D2C</span>
                <span className={styles.chip}>Deep Tech and AI</span>
              </div>
            </div>

            <div className={styles.ctaRow}>
              <button className={styles.buttonOutline}>Back</button>
              <button className={styles.buttonPrimary}>Run AI Match</button>
            </div>
          </article>

          <div className={styles.resultsHero}>
            <div className={styles.eyebrow}>Match Complete</div>
            <h2 className={styles.resultsCount}>
              <em>38</em> matches found.
            </h2>
            <p className={styles.resultsSub}>
              Anonymised until you book a Discovery Call. Names, intros, and data-room access unlock after our 30-minute fit
              validation.
            </p>
            <button className={styles.buttonPrimary}>Book Discovery Call</button>
          </div>

          <div className={styles.panelGrid}>
            <article className={styles.card}>
              <div className={styles.cardLabel}>Geographic Distribution</div>
              <p className={styles.desc}>DACH, Benelux, UK and North America are currently strongest for your profile.</p>
            </article>
            <article className={styles.card}>
              <div className={styles.cardLabel}>Partner Type Breakdown</div>
              <p className={styles.desc}>Investors, distributors, and JV partners dominate the compatibility pool.</p>
            </article>
          </div>

          <div className={styles.matchGrid}>
            <article className={styles.matchCard}>
              <h3 className={styles.matchTitle}>Series A Lead · European Industrial Tech Fund</h3>
              <p className={styles.matchDesc}>EUR80M AUM · portfolio in DACH industrial SaaS · high thesis alignment.</p>
              <div className={styles.matchScore}>94/100</div>
            </article>
            <article className={styles.matchCard}>
              <h3 className={styles.matchTitle}>Mid-Market Industrial Distributor · DACH</h3>
              <p className={styles.matchDesc}>EUR40M revenue · 65+ customers · active for new SaaS partnerships.</p>
              <div className={styles.matchScore}>89/100</div>
            </article>
            <article className={styles.matchCard}>
              <h3 className={styles.matchTitle}>Seed Fund · B2B Vertical SaaS</h3>
              <p className={styles.matchDesc}>GBP120M AUM · active positions in Europe · stage and sector fit.</p>
              <div className={styles.matchScore}>87/100</div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
