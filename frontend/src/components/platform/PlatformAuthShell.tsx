import type { ReactNode } from 'react';
import { PlatformNav } from './PlatformNav';
import styles from './PlatformView.module.css';

type PlatformAuthShellProps = {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
};

export function PlatformAuthShell({ eyebrow, title, subtitle, children }: PlatformAuthShellProps) {
  return (
    <main className={styles.page}>
      <PlatformNav active="home" />

      <section className={styles.moduleHero}>
        <div className={styles.container}>
          <div className={styles.moduleEyebrow}>{eyebrow}</div>
          <h1 className={styles.moduleTitle}>{title}</h1>
          <p className={styles.moduleSub}>{subtitle}</p>
        </div>
      </section>

      <section className={styles.moduleBody}>
        <div className={styles.container}>{children}</div>
      </section>
    </main>
  );
}
