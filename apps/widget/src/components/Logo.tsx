import { LogoIcon } from './LogoIcon';

type Variant = 'icon' | 'app-icon' | 'rounded';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type Props = {
  variant?: Variant;
  size?: Size | number;
  color?: string;
  className?: string;
  gradient?: {
    from: string;
    to: string;
  };
};

const sizeMap: Record<Size, { container: number; icon: number }> = {
  xs: { container: 32, icon: 20 },
  sm: { container: 40, icon: 24 },
  md: { container: 64, icon: 40 },
  lg: { container: 80, icon: 48 },
  xl: { container: 96, icon: 56 },
};

/**
 * Logo Component
 *
 * Variants:
 * - icon: Just the SVG icon (default)
 * - app-icon: iOS-style rounded square with gradient background
 * - rounded: Simple rounded background
 */
export const Logo = ({
  variant = 'icon',
  size = 'md',
  color,
  className = '',
  gradient = { from: '#3b82f6', to: '#8b5cf6' },
}: Props) => {
  const isNumericSize = typeof size === 'number';
  const containerSize = isNumericSize ? size : sizeMap[size].container;
  const iconSize = isNumericSize ? size * 0.625 : sizeMap[size].icon;

  // Icon only - no background
  if (variant === 'icon') {
    return (
      <LogoIcon
        size={containerSize}
        color={color || 'currentColor'}
        className={className}
      />
    );
  }

  // iOS-style app icon with gradient background
  if (variant === 'app-icon') {
    return (
      <div
        className={`lr-flex lr-items-center lr-justify-center lr-shadow-lg ${className}`}
        style={{
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize * 0.2237, // iOS-style 22.37% radius
          background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
          boxShadow: `0 ${containerSize * 0.05}px ${containerSize * 0.15}px rgba(0, 0, 0, 0.1)`,
        }}
      >
        <LogoIcon
          size={iconSize}
          color={color || 'rgba(0, 0, 0, 0.85)'}
        />
      </div>
    );
  }

  // Simple rounded background
  if (variant === 'rounded') {
    return (
      <div
        className={`lr-flex lr-items-center lr-justify-center ${className}`}
        style={{
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize * 0.25,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <LogoIcon
          size={iconSize}
          color={color || 'currentColor'}
        />
      </div>
    );
  }

  return null;
};
