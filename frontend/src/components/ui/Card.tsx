import { z } from 'zod';
import styles from './Card.module.css';
import { ReactNode } from 'react';

// Zod validation schema
const CardPropsSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  children: z.any().optional(),
  variant: z.enum(['default', 'highlight', 'minimal']).optional(),
  className: z.string().optional(),
  accentColor: z.enum(['gold', 'teal', 'sage', 'rose', 'slate']).optional(),
});

type CardProps = z.infer<typeof CardPropsSchema>;

/**
 * Card Component
 * 
 * A flexible card container with optional top accent border.
 * 
 * Variants:
 * - default: Full shadow and border
 * - highlight: Enhanced shadow for prominence
 * - minimal: Subtle border only
 * 
 * Accent Colors:
 * - gold, teal, sage, rose, slate
 */
export function Card({
  title,
  description,
  children,
  variant = 'default',
  className = '',
  accentColor = 'gold',
}: CardProps & { children?: ReactNode }) {
  const cardClass = `
    ${styles.card}
    ${styles[`variant-${variant}`]}
    ${styles[`accent-${accentColor}`]}
    ${className}
  `.trim();

  return (
    <div className={cardClass}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {description && <p className={styles.description}>{description}</p>}
      {children}
    </div>
  );
}
