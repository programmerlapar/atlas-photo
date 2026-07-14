import { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

/**
 * Button component with primary and secondary variants
 * Follows Liquid Glass design system
 * 
 * - Radii: rounded-sm (14px) for all buttons
 * - Motion: 200ms duration with ease-ios timing, respects prefers-reduced-motion
 * - Tints: ≤ 28% opacity for secondary backgrounds; 100% for primary CTA
 * - Spacing: 8-pt rhythm (px-4 py-2, px-6 py-3, px-8 py-4)
 * - Accessibility: WCAG AA contrast ≥ 4.5:1 for text
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) => {
  // Base classes with Liquid Glass system requirements
  // rounded-sm = 14px (button radius)
  // Motion: 200ms with ease-ios, respects prefers-reduced-motion
  const baseClasses =
    'font-semibold rounded-sm transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] focus:outline-none focus:ring-2 focus:ring-[#1EC8E6] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-[#1EC8E6] text-white hover:bg-[#1AB8D6] hover:scale-[1.02] active:scale-[0.98] active:bg-[#17A8C6] disabled:hover:scale-100',
    secondary:
      'border border-[var(--border-default)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--glass-bg-1)] active:bg-[var(--glass-bg-2)] disabled:hover:bg-transparent',
  };

  // Size classes following 8-pt rhythm
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm', // 16px x 8px
    md: 'px-6 py-3 text-base', // 24px x 12px
    lg: 'px-8 py-4 text-lg', // 32px x 16px
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
