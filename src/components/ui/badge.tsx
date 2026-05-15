import { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'sky' | 'green' | 'gray' | 'red';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  sky: 'bg-primary/20 text-primary border-primary/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  gray: 'bg-white/10 text-gray-400 border-white/20',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const sizeStyles: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
};

export default function Badge({
  children,
  variant = 'sky',
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
