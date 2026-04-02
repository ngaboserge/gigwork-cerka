import { ReactNode } from 'react';

interface DashboardGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function DashboardGrid({ children, columns = 4, className = '' }: DashboardGridProps) {
  const gridClasses = {
    2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6',
  };

  return (
    <div className={`${gridClasses[columns]} ${className}`}>
      {children}
    </div>
  );
}

interface DashboardSectionProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DashboardSection({ title, subtitle, action, children, className = '' }: DashboardSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h2 className="text-2xl font-semibold text-neutral-900">{title}</h2>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
