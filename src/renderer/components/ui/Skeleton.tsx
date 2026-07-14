import { useEffect, useState } from 'react';

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'circular' | 'text';
  lines?: number;
  animated?: boolean;
}

/**
 * Loading skeleton component for better perceived performance
 */
const Skeleton = ({
  className = '',
  width,
  height,
  variant = 'rectangular',
  lines = 1,
  animated = true,
}: SkeletonProps) => {
  const [dimensions, setDimensions] = useState<{
    width?: string;
    height?: string;
  }>({});

  useEffect(() => {
    if (width) {
      setDimensions((prev) => ({
        ...prev,
        width: typeof width === 'number' ? `${width}px` : width,
      }));
    }
    if (height) {
      setDimensions((prev) => ({
        ...prev,
        height: typeof height === 'number' ? `${height}px` : height,
      }));
    }
  }, [width, height]);

  const baseClasses = `bg-white/5 rounded ${animated ? 'animate-pulse' : ''}`;

  const variantClasses = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded-sm',
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{
              ...dimensions,
              width: index === lines - 1 ? '80%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={dimensions}
    />
  );
};

export default Skeleton;
