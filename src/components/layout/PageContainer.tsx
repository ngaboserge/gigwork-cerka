import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  size?: 'default' | 'wide' | 'narrow';
  className?: string;
}

export function PageContainer({ children, size = 'default', className = '' }: PageContainerProps) {
  const sizeClasses = {
    default: 'max-w-7xl',
    wide: 'max-w-[1400px]',
    narrow: 'max-w-4xl',
  };

  return (
    <div className={`${sizeClasses[size]} mx-auto px-6 py-8 ${className}`}>
      {children}
    </div>
  );
}
