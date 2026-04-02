import { useEffect, useState } from 'react';
import { verificationService } from '@/services/verification.service';

interface VerificationBadgeProps {
  userId?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function VerificationBadge({ userId, size = 'md', showLabel = true }: VerificationBadgeProps) {
  const [badges, setBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadBadges();
    } else {
      loadOwnBadges();
    }
  }, [userId]);

  const loadBadges = async () => {
    if (!userId) return;
    setLoading(true);
    const data = await verificationService.getVerificationBadges(userId);
    setBadges(data);
    setLoading(false);
  };

  const loadOwnBadges = async () => {
    setLoading(true);
    const verification = await verificationService.getVerificationStatus();
    if (verification?.status === 'approved') {
      const badgeList = ['id_verified'];
      if (verification.face_match_passed) {
        badgeList.push('face_verified');
      }
      setBadges(badgeList);
    }
    setLoading(false);
  };

  if (loading || badges.length === 0) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {badges.includes('id_verified') && (
        <span className={`
          inline-flex items-center gap-1 font-medium rounded-full
          bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400
          ${sizeClasses[size]}
        `}>
          <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {showLabel && 'ID Verified'}
        </span>
      )}
      
      {badges.includes('face_verified') && (
        <span className={`
          inline-flex items-center gap-1 font-medium rounded-full
          bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400
          ${sizeClasses[size]}
        `}>
          <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          {showLabel && 'Face Verified'}
        </span>
      )}
      
      {badges.includes('background_checked') && (
        <span className={`
          inline-flex items-center gap-1 font-medium rounded-full
          bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400
          ${sizeClasses[size]}
        `}>
          <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {showLabel && 'Background Checked'}
        </span>
      )}
    </div>
  );
}
