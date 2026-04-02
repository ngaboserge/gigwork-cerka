interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
  shimmer?: boolean;
}

export function Skeleton({ 
  className = '', 
  variant = 'text', 
  width, 
  height, 
  lines = 1,
  shimmer = true 
}: SkeletonProps) {
  const baseClass = shimmer ? 'animate-shimmer' : 'animate-pulse bg-neutral-200 dark:bg-neutral-700';
  
  const variantClasses = {
    text: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : undefined),
  };

  if (lines > 1) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClass} ${variantClasses[variant]}`}
            style={{ 
              ...style, 
              width: i === lines - 1 ? '75%' : style.width,
              height: style.height || '1rem'
            }}
          />
        ))}
      </div>
    );
  }

  return <div className={`${baseClass} ${variantClasses[variant]} ${className}`} style={style} />;
}

export function JobCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Skeleton height={24} width="70%" className="mb-2" shimmer />
          <Skeleton height={16} width="40%" shimmer />
        </div>
        <Skeleton width={70} height={24} variant="rectangular" shimmer />
      </div>
      <Skeleton lines={2} className="mb-4" shimmer />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Skeleton height={18} shimmer />
        <Skeleton height={18} shimmer />
        <Skeleton height={18} shimmer />
        <Skeleton height={18} shimmer />
      </div>
      <div className="flex gap-2 mb-4">
        <Skeleton width={70} height={26} variant="rectangular" shimmer />
        <Skeleton width={90} height={26} variant="rectangular" shimmer />
        <Skeleton width={80} height={26} variant="rectangular" shimmer />
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-neutral-100 dark:border-neutral-700">
        <Skeleton width={120} height={16} shimmer />
        <Skeleton width={100} height={36} variant="rectangular" shimmer />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-neutral-100 dark:border-neutral-700">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <Skeleton height={18} width={i === 0 ? '80%' : '60%'} shimmer />
        </td>
      ))}
    </tr>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={96} height={96} shimmer />
        <div className="flex-1">
          <Skeleton height={28} width="40%" className="mb-3" shimmer />
          <Skeleton height={18} width="60%" shimmer />
        </div>
      </div>
      <Skeleton lines={3} shimmer />
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
          <Skeleton height={70} shimmer />
        </div>
        <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
          <Skeleton height={70} shimmer />
        </div>
        <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
          <Skeleton height={70} shimmer />
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 shadow-sm">
      <Skeleton height={24} width="60%" className="mb-3" shimmer />
      <Skeleton lines={3} className="mb-4" shimmer />
      <div className="flex gap-2">
        <Skeleton width={80} height={32} variant="rectangular" shimmer />
        <Skeleton width={80} height={32} variant="rectangular" shimmer />
      </div>
    </div>
  );
}

export function ListingSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm">
      <Skeleton height={200} variant="rectangular" shimmer />
      <div className="p-5">
        <Skeleton height={24} width="80%" className="mb-2" shimmer />
        <Skeleton height={18} width="50%" className="mb-4" shimmer />
        <Skeleton lines={2} className="mb-4" shimmer />
        <div className="flex justify-between items-center">
          <Skeleton width={100} height={28} shimmer />
          <Skeleton width={120} height={36} variant="rectangular" shimmer />
        </div>
      </div>
    </div>
  );
}
