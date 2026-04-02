import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Card({ 
  children, 
  className = '', 
  elevated = false, 
  interactive = false,
  padding = 'md',
  onClick
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  const interactiveStyles = interactive 
    ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200' 
    : 'transition-shadow duration-200';

  return (
    <div
      className={`
        bg-white dark:bg-neutral-800 
        border border-neutral-200 dark:border-neutral-700 
        rounded-xl
        ${elevated ? 'shadow-md' : 'shadow-sm hover:shadow-md'}
        ${interactiveStyles}
        ${paddingStyles[padding]} 
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-3 flex-1">
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  );
}

