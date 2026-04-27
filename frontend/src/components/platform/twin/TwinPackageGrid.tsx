import { memo } from 'react';
import type { PackageKey, TwinPackage } from './types';
import styles from '../PlatformView.module.css';

type TwinPackageGridProps = {
  packages: TwinPackage[];
  selectedPackage: PackageKey;
  onSelectPackage: (value: PackageKey) => void;
};

export const TwinPackageGrid = memo(function TwinPackageGrid({
  packages,
  selectedPackage,
  onSelectPackage,
}: TwinPackageGridProps) {
  return (
    <div className={styles.twinPackageGrid}>
      {packages.map((pkg) => {
        const selectedClass = selectedPackage === pkg.key ? styles.twinPkgSelected : '';
        const featuredClass = pkg.featured ? styles.twinPkgFeatured : '';

        return (
          <article
            key={pkg.key}
            className={`${styles.twinPackageCard} ${featuredClass} ${selectedClass}`}
            onClick={() => onSelectPackage(pkg.key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectPackage(pkg.key);
              }
            }}
          >
            <div className={styles.twinPkgTag}>{pkg.tagline}</div>
            <h2 className={styles.twinPkgName}>{pkg.name}</h2>
            <div className={styles.twinPkgPrice}>{pkg.price}</div>
            <div className={styles.twinPkgSub}>{pkg.subtitle}</div>

            <ul className={styles.twinPkgList}>
              {pkg.featureBullets.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>

            <button type="button" className={styles.twinPkgCta}>
              {pkg.cta} <span className="arr">&#8594;</span>
            </button>
          </article>
        );
      })}
    </div>
  );
});
