import { forwardRef, HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'custom-glass' | 'liquid-glass';
  padding?: string;
  shadow?: 'l1' | 'l2' | 'l3' | 'none';
  rounded?: 'sm' | 'md' | 'xl';
  children: ReactNode;
}

/**
 * Card component with Liquid Glass design system
 * Centralized component for all elevated surfaces following the Liquid Glass system
 * 
 * @param variant - 'custom-glass' (default) or 'liquid-glass' for different glass effects
 * @param padding - Padding utility class (e.g., 'p-4', 'p-6', 'px-4 py-6')
 * @param shadow - Shadow level: 'l1' (subtle), 'l2' (medium), 'l3' (high), or 'none'
 * @param rounded - Border radius: 'sm' (14px), 'md' (20px), 'xl' (28px)
 * @param children - Card content
 * 
 * Default variant is 'custom-glass' with:
 * - border border-[var(--border-default)] bg-[var(--glass-bg-1)] backdrop-blur-xl
 * - rounded-[12px] (rounded-md equivalent)
 * - Theme-aware shadows (shadow-l3)
 */
const Card = forwardRef<HTMLDivElement, CardProps>(({
  variant = 'custom-glass',
  padding = 'p-4',
  shadow = 'l3',
  rounded = 'md',
  children,
  className = '',
  ...props
}, ref) => {
  // Base classes for all cards
  const baseClasses = 'transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]';
  
  // Variant-specific classes
  const variantClasses = {
    'custom-glass': 'border border-[var(--border-default)] bg-[var(--glass-bg-1)] backdrop-blur-xl',
    'liquid-glass': 'glass-surface-2 hairline',
  };
  
  // Shadow classes - use theme-aware CSS utility classes
  const shadowClasses = {
    l1: 'shadow-l1',
    l2: 'shadow-l2',
    l3: 'shadow-l3',
    none: '',
  };
  
  // Rounded classes (following Liquid Glass system)
  const roundedClasses = {
    sm: 'rounded-sm', // 14px
    md: 'rounded-md', // 20px
    xl: 'rounded-xl', // 28px
  };
  
  // For custom-glass variant, use rounded-[12px] as specified in requirements
  const roundedClass = variant === 'custom-glass' && rounded === 'md' 
    ? 'rounded-[12px]' 
    : roundedClasses[rounded];

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${shadowClasses[shadow]} ${roundedClass} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;

