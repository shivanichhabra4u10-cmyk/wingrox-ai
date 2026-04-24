'use client';

import { z } from 'zod';
import styles from './Button.module.css';

// Zod validation schema
const ButtonPropsSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  variant: z.enum(['primary', 'gold', 'outline', 'ghost']).optional(),
  size: z.enum(['sm', 'md', 'lg']).optional(),
  type: z.enum(['button', 'submit', 'reset']).optional(),
  disabled: z.boolean().optional(),
  onClick: z.function().optional(),
  className: z.string().optional(),
  children: z.any().optional(),
  arrow: z.boolean().optional(),
});

type ButtonProps = z.infer<typeof ButtonPropsSchema>;

/**
 * Button Component
 * 
 * Variants:
 * - primary: Dark background with gold hover
 * - gold: Gold gradient background
 * - outline: Bordered with light background on hover
 * - ghost: Text-only with minimal styling
 * 
 * Sizes:
 * - sm: Small padding and font
 * - md: Default size
 * - lg: Large padding and font
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  children,
  arrow = false,
}: ButtonProps) {
  const buttonClass = `
    ${styles.btn}
    ${styles[`btn-${variant}`]}
    ${styles[`btn-${size}`]}
    ${disabled ? styles.disabled : ''}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled}
      onClick={onClick}
    >
      {children || label}
      {arrow && <span className={styles.arrow}>→</span>}
    </button>
  );
}
