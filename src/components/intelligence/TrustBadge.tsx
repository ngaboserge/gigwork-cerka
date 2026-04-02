import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Shield } from '../../lib/icons';

interface TrustBadgeProps {
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  score: number;
  showDetails?: boolean;
  accuracyScore?: number;
  consistencyScore?: number;
  validationScore?: number;
  experienceScore?: number;
  className?: string;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  tier,
  score,
  showDetails = false,
  accuracyScore,
  consistencyScore,
  validationScore,
  experienceScore,
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getTierInfo = () => {
    switch (tier) {
      case 'platinum':
        return {
          label: 'Platinum',
          color: 'purple' as const,
          icon: '💎',
          description: 'Elite Contributor'
        };
      case 'gold':
        return {
          label: 'Gold',
          color: 'yellow' as const,
          icon: '🥇',
          description: 'Trusted Contributor'
        };
      case 'silver':
        return {
          label: 'Silver',
          color: 'gray' as const,
          icon: '🥈',
          description: 'Verified Contributor'
        };
      case 'bronze':
      default:
        return {
          label: 'Bronze',
          color: 'orange' as const,
          icon: '🥉',
          description: 'New Contributor'
        };
    }
  };

  const info = getTierInfo();

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="cursor-help"
      >
        <Badge color={info.color} className="flex items-center gap-1.5">
          <span>{info.icon}</span>
          <span className="font-semibold">{info.label}</span>
          {showDetails && (
            <span className="text-xs opacity-75">
              ({score}/100)
            </span>
          )}
        </Badge>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-sm rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
            <Shield className="w-4 h-4" />
            <span className="font-semibold">{info.description}</span>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-300">Overall Trust:</span>
              <span className="font-semibold">{score}/100</span>
            </div>
            
            {accuracyScore !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Accuracy:</span>
                <span>{accuracyScore.toFixed(0)}/100</span>
              </div>
            )}
            
            {consistencyScore !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Consistency:</span>
                <span>{consistencyScore.toFixed(0)}/100</span>
              </div>
            )}
            
            {validationScore !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Validations:</span>
                <span>{validationScore.toFixed(0)}/100</span>
              </div>
            )}
            
            {experienceScore !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Experience:</span>
                <span>{experienceScore.toFixed(0)}/100</span>
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};
