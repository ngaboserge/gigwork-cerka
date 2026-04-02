import React from 'react';
import { formatCurrency } from '../../lib/currency';
import { AlertTriangle, CheckCircle } from '../../lib/icons';

interface PriceWithConfidenceProps {
  price: number;
  confidence: number;
  dataPoints: number;
  qualityGrade?: 'A' | 'B' | 'C' | 'D';
  showDetails?: boolean;
  className?: string;
}

export const PriceWithConfidence: React.FC<PriceWithConfidenceProps> = ({
  price,
  confidence,
  dataPoints,
  qualityGrade = 'B',
  showDetails = true,
  className = ''
}) => {
  const getConfidenceInfo = () => {
    if (confidence >= 85) {
      return {
        level: 'High',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: CheckCircle,
        margin: '±3%'
      };
    } else if (confidence >= 70) {
      return {
        level: 'Good',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: CheckCircle,
        margin: '±5%'
      };
    } else if (confidence >= 50) {
      return {
        level: 'Fair',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: AlertTriangle,
        margin: '±10%'
      };
    } else {
      return {
        level: 'Low',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        icon: AlertTriangle,
        margin: '±15%'
      };
    }
  };

  const info = getConfidenceInfo();
  const Icon = info.icon;

  return (
    <div className={`${className}`}>
      {/* Price Display */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">
          {formatCurrency(price)}
        </span>
        <span className="text-lg text-gray-500">{info.margin}</span>
      </div>

      {/* Confidence Indicator */}
      {showDetails && (
        <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${info.bgColor}`}>
          <Icon className={`w-4 h-4 ${info.color}`} />
          <span className={`text-sm font-medium ${info.color}`}>
            {confidence}% confidence
          </span>
          <span className="text-sm text-gray-600">
            • {dataPoints} {dataPoints === 1 ? 'source' : 'sources'}
          </span>
          {qualityGrade && (
            <span className={`text-sm font-bold ${
              qualityGrade === 'A' ? 'text-green-600' :
              qualityGrade === 'B' ? 'text-blue-600' :
              qualityGrade === 'C' ? 'text-yellow-600' :
              'text-orange-600'
            }`}>
              Grade {qualityGrade}
            </span>
          )}
        </div>
      )}

      {/* Data Quality Note */}
      {dataPoints < 5 && (
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          <span>Limited data available. Price may vary.</span>
        </div>
      )}
    </div>
  );
};
