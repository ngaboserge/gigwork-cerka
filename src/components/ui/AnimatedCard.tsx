import { ReactNode, HTMLAttributes } from 'react';

interface AnimatedCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: 'lift' | 'scale' | 'glow' | 'none';
  animation?: 'fadeIn' | 'fadeInUp' | 'scaleIn' | 'slideInRight' | 'none';
  delay?: number;
}

export function AnimatedCard({ 
  children, 
  className = '', 
  hover = 'lift',
  animation = 'fadeInUp',
  delay = 0,
  ...props 
}: AnimatedCardProps) {
  const hoverClasses = {
    lift: 'hover-lift',
    scale: 'hover-scale',
    glow: 'hover-glow',
    none: '',
  };

  const animationClasses = {
    fadeIn: 'animate-fadeIn',
    fadeInUp: 'animate-fadeInUp',
    scaleIn: 'animate-scaleIn',
    slideInRight: 'animate-slideInRight',
    none: '',
  };

  const style = delay > 0 ? { animationDelay: `${delay}ms` } : undefined;

  return (
    <div
      className={`
        bg-white dark:bg-neutral-800 
        border border-neutral-200 dark:border-neutral-700 
        rounded-xl shadow-sm
        ${hoverClasses[hover]}
        ${animationClasses[animation]}
        ${className}
      `}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

interface QuickActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  color?: 'primary' | 'success' | 'warning' | 'neutral';
  delay?: number;
}

export function QuickActionCard({ 
  icon, 
  title, 
  description, 
  onClick,
  color = 'primary',
  delay = 0
}: QuickActionCardProps) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400',
    success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    warning: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    neutral: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
  };

  return (
    <AnimatedCard
      hover="lift"
      animation="fadeInUp"
      delay={delay}
      onClick={onClick}
      className={`p-6 cursor-pointer group ${onClick ? 'active:scale-95' : ''}`}
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color]} transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
    </AnimatedCard>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'neutral';
  delay?: number;
}

export function StatCard({ 
  label, 
  value, 
  icon, 
  trend,
  color = 'primary',
  delay = 0
}: StatCardProps) {
  const colorClasses = {
    primary: 'text-primary-600 dark:text-primary-400',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    neutral: 'text-neutral-600 dark:text-neutral-400',
  };

  return (
    <AnimatedCard
      hover="lift"
      animation="scaleIn"
      delay={delay}
      className="p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {label}
        </p>
        {icon && (
          <div className={`${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {value}
        </p>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${
            trend.isPositive ? 'text-emerald-600' : 'text-red-600'
          }`}>
            <svg 
              className={`w-4 h-4 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}
