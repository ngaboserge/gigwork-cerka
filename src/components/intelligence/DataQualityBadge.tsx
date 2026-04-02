import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { CheckCircle, AlertTriangle } from '../../lib/icons';

interface DataQualityBadgeProps {
  quality: number;
  grade: 'A' | 'B' | 'C' | 'D';
  coverageScore?: number;
  freshnessScore?: number;
  consistencyScore?: number;
  trustScore?: number;
  className?: string;
}

export const DataQualityBadge: React.FC<DataQualityBadgeProps> = ({
  quality,
  grade,
  coverageScore,
  freshnessScore,
  consistencyScore,
  trustScore,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getGradeInfo = () => {
    switch (grade) {
      case 'A':
        return {
          color: 'green' as const,
          icon: CheckCircle,
          label: 'Excellent',
          description: 'High quality data'
        };
      case 'B':
        return {
          color: 'blue' as const,
          icon: CheckCircle,
          label: 'Good',
          description: 'Reliable data'
        };
      case 'C':
        return {
          color: 'yellow' as const,
          icon: AlertTriangle,
          label: 'Fair',
          description: 'Acceptable data'
        };
      case 'D':
      default:
        return {
          color: 'orange' as const,
          icon: AlertTriangle,
          label: 'Limited',
          description: 'Use with caution'
        };
    }
  };

  const info = getGradeInfo();
  const Icon = info.icon;

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
        className="cursor-help"
      >
        <Badge color={info.color} className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" />
          <span className="font-semibold">Data Quality: {grade}</span>
          <span className="text-xs opacity-75">({quality}/100)</span>
        </Badge>
      </div>

      {/* Tooltip */}
      {showDetails && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 bg-gray-900 text-white text-sm rounded-lg shadow-lg p-3">
          <div className="mb-2 pb-2 border-b border-gray-700">
            <div className="font-semibold">{info.label} Quality</div>
            <div className="text-xs text-gray-400">{info.description}</div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-300">Overall:</span>
              <span className="font-semibold">{quality}/100</span>
            </div>
            
            {coverageScore !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Coverage:</span>
                <div className="flex items-center gap-1">
                  <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${coverageScore}%` }}
                    />
                  </div>
                  <span>{coverageScore.toFixed(0)}</span>
                </div>
              </div>
            )}
            
            {freshnessScore !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Freshness:</span>
                <div className="flex items-center gap-1">
                  <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${freshnessScore}%` }}
                    />
                  </div>
                  <span>{freshnessScore.toFixed(0)}</span>
                </div>
              </div>
            )}
            
            {consistencyScore !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Consistency:</span>
                <div className="flex items-center gap-1">
                  <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${consistencyScore}%` }}
                    />
                  </div>
                  <span>{consistencyScore.toFixed(0)}</span>
                </div>
              </div>
            )}
            
            {trustScore !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Trust:</span>
                <div className="flex items-center gap-1">
                  <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${trustScore}%` }}
                    />
                  </div>
                  <span>{trustScore.toFixed(0)}</span>
                </div>
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
