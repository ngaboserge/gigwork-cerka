interface SingleVerificationBadgeProps {
  type: string;
  size?: 'sm' | 'md';
}

export function SingleVerificationBadge({ type, size = 'sm' }: SingleVerificationBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  };

  const getBadgeConfig = (badgeType: string) => {
    switch (badgeType) {
      case 'id_verified':
        return {
          label: 'ID Verified',
          color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
          icon: (
            <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'face_verified':
        return {
          label: 'Face Verified',
          color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
          icon: (
            <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'background_checked':
        return {
          label: 'Background Checked',
          color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
          icon: (
            <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
        };
      default:
        return {
          label: 'Verified',
          color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400',
          icon: (
            <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ),
        };
    }
  };

  const config = getBadgeConfig(type);

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${config.color} ${sizeClasses[size]}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}
