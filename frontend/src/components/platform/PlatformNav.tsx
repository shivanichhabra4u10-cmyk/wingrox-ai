import Link from 'next/link';
import { z } from 'zod';
import styles from './PlatformView.module.css';

const PlatformNavPropsSchema = z.object({
  active: z.enum(['home', 'dashboard', 'match', 'hub', 'intel', 'sim', 'twin', 'expansion', 'eco']),
});

type PlatformNavProps = z.infer<typeof PlatformNavPropsSchema>;

export function PlatformNav({ active }: PlatformNavProps) {
  PlatformNavPropsSchema.parse({ active });

  return (
    <header className={styles.nav}>
      <div className={styles.navWrap}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>W</span>
          <span>
            WinGroX <em>AI</em>
            <div className={styles.logoSub}>Growth Intelligence OS</div>
          </span>
        </Link>
        <nav className={styles.navLinks}>
          <Link href="/" className={`${styles.navLink} ${active === 'home' ? styles.navLinkActive : ''}`}>
            Home
          </Link>
          <Link href="/dashboard" className={`${styles.navLink} ${active === 'dashboard' ? styles.navLinkActive : ''}`}>
            Dashboard
          </Link>
          <Link href="/twin" className={`${styles.navLink} ${active === 'twin' ? styles.navLinkActive : ''}`}>
            Digital Twin
          </Link>
          <Link href="/expansion" className={`${styles.navLink} ${active === 'expansion' ? styles.navLinkActive : ''}`}>
            Global Expansion
          </Link>
          <Link href="/intel" className={`${styles.navLink} ${active === 'intel' ? styles.navLinkActive : ''}`}>
            Intelligence Engine
          </Link>
          <Link href="/match" className={`${styles.navLink} ${active === 'match' ? styles.navLinkActive : ''}`}>
            Matchmaking
          </Link>
          <Link href="/hub" className={`${styles.navLink} ${active === 'hub' ? styles.navLinkActive : ''}`}>
            Insights Hub
          </Link>
          <Link href="/sim" className={`${styles.navLink} ${active === 'sim' ? styles.navLinkActive : ''}`}>
            Simulators
          </Link>
          <Link href="/eco" className={`${styles.navLink} ${active === 'eco' ? styles.navLinkActive : ''}`}>
            Ecosystem
          </Link>
        </nav>
      </div>
    </header>
  );
}
