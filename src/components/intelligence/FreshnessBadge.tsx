import React from 'react';
import { Badge } from '../ui/Badge';
import { Calendar } from '../../lib/icons';

interface FreshnessBadgeProps {
  avgAgeDays: number;
  dataPoints: number;
  className?: string;
}

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({
  avgAgeDays,
  dataPoints,
  className = ''
}) => {
  const getFreshnessInfo = () => {
    if (avgAgeDays < 1) {
      return {
        label: 'Live',
        color: 'green' as const,
        icon: '🟢',
        description: 'Real-time data'
      };
    } else if (avgAgeDays < 7) {
      return {
        label: 'Recent',
        color: 'blue' as const,
        icon: '🔵',
        description: 'Updated this week'
      };
    } else if (avgAgeDays < 14) {
      return {
        label: 'Aging',
        color: 'yellow' as const,
        icon: '🟡',
        description: '1-2 weeks old'
      };
    } else {
      return {
        label: 'Stale',
        color: 'orange' as const,
        icon: '🟠',
        description: 'Over 2 weeks old'
      };
    }
  };

  const info = getFreshnessInfo();

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Badge color={info.color} className="flex items-center gap-1">
        <span>{info.icon}</span>
        <span>{info.label}</span>
        <span className="text-xs opacity-75">
          ({avgAgeDays < 1 ? '<1' : Math.round(avgAgeDays)}d)
        </span>
      </Badge>
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Calendar className="w-3 h-3" />
        <span>{dataPoints} {dataPoints === 1 ? 'submission' : 'submissions'}</span>
      </div>
    </div>
  );
};
