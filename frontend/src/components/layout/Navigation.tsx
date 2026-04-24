'use client';

import { z } from 'zod';
import styles from './Navigation.module.css';
import { Button } from '../ui/Button';

// Zod validation schema
const NavLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
  active: z.boolean().default(false),
});

const NavigationPropsSchema = z.object({
  logo: z.string().optional(),
  logoSubtitle: z.string().optional(),
  links: z.array(NavLinkSchema).optional(),
  onLinkClick: z.function().optional(),
  showAuthButtons: z.boolean().optional(),
});

type NavigationProps = z.infer<typeof NavigationPropsSchema>;

/**
 * Navigation Component
 * 
 * Fixed header with logo, nav links, and auth buttons.
 * Uses design tokens for styling.
 */
export function Navigation({
  logo = 'WinGroX',
  logoSubtitle = 'AI OS',
  links = [],
  onLinkClick,
  showAuthButtons = true,
}: NavigationProps) {
  return (
    <header className={styles.nav}>
      <div className={styles.navWrap}>
        {/* Logo */}
        <div className={styles.navLogo}>
          <div className={styles.logoMark}>
            <span className={styles.logoMarkInner}>{logo[0]}</span>
          </div>
          <div className={styles.logoTextWrap}>
            <div className={styles.logoText}>
              {logo}
              <em className={styles.logoEmphasis}>Grox</em>
            </div>
            <div className={styles.logoSub}>{logoSubtitle}</div>
          </div>
        </div>

        {/* Nav Links */}
        {links.length > 0 && (
          <nav className={styles.navLinks}>
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${link.active ? styles.active : ''}`}
                onClick={() => onLinkClick?.(link.href)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* Auth Buttons */}
        {showAuthButtons && (
          <div className={styles.navActions}>
            <Button
              label="Login"
              variant="ghost"
              size="sm"
              className={styles.navBtnGhost}
            />
            <Button
              label="Get Started"
              variant="primary"
              size="sm"
              className={styles.navBtnPrimary}
            />
          </div>
        )}
      </div>
    </header>
  );
}
