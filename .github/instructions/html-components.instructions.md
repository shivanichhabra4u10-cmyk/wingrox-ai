---
name: html-components
description: "Use when: building React components from HTML templates. Extract design tokens, preserve animations, convert to TypeScript components with Zod validation."
applyTo: "src/components/**"
---

# HTML to React Component Conversion

## Process
1. **Extract Template**: Copy HTML section from `wingrox-os (8).html`
2. **Identify Tokens**: List all CSS variables used
3. **Convert to TSX**: 
   - Use CSS Modules (`.module.css`)
   - Keep token references via CSS variables
   - Add prop types interface
4. **Add Validation**: Zod schema for props
5. **Document**: Props, examples, accessibility notes

## Example Structure
```typescript
// components/ui/Button.tsx
import { z } from 'zod';
import styles from './Button.module.css';

const ButtonProps = z.object({
  label: z.string(),
  variant: z.enum(['primary', 'gold', 'outline']),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  onClick: z.function().optional(),
});

type ButtonPropsType = z.infer<typeof ButtonProps>;

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  onClick,
}: ButtonPropsType) {
  return (
    <button
      className={`${styles.btn} ${styles[`btn-${variant}`]} ${styles[`btn-${size}`]}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
```

## CSS Modules Pattern
```css
/* Button.module.css */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-md);
  border-radius: var(--r-full);
  font-family: var(--f-body);
  transition: var(--t);
  cursor: pointer;
  border: none;
  background: none;
}

.btn-primary {
  background: var(--bg-dark);
  color: var(--bg);
  padding: 14px 28px;
}

.btn-primary:hover {
  background: var(--gold-deep);
  transform: translateY(-2px);
  box-shadow: var(--sh-md);
}
```

## Preserve From HTML
- Animation names (@keyframes fadeUp, shimmer, spin)
- Color palette with opacity variants
- Typography hierarchy
- Shadow definitions
- Border radius system
- Easing functions
