import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'info' | 'primary' | 'secondary';
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    secondary: 'bg-neutral-50 text-neutral-600 border-neutral-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
