import { AlertTriangle, X, ExternalLink } from '../../lib/icons';
import { Button } from '../ui/Button';
import { SignalBadge } from './SignalBadge';
import type { MarketSignal } from '../../services/signals.service';

interface SignalAlertProps {
  signal: MarketSignal;
  onDismiss?: () => void;
  onViewDetails?: () => void;
}

export function SignalAlert({ signal, onDismiss, onViewDetails }: SignalAlertProps) {
  const getBorderColor = () => {
    switch (signal.severity) {
      case 'critical':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-yellow-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const getMessage = () => {
    const materialName = signal.material?.name || 'Material';
    
    switch (signal.signal_type) {
      case 'shortage':
        return `${materialName} shortage detected in ${signal.location}. Prices increased ${signal.metadata.price_change?.toFixed(1)}% while availability dropped ${Math.abs(signal.metadata.availability_change)?.toFixed(1)}%.`;
      case 'volatility':
        return `${materialName} prices in ${signal.location} are highly volatile (${signal.metadata.volatility?.toFixed(1)}% variation). Market conditions are unstable.`;
      case 'surplus':
        return `${materialName} surplus detected in ${signal.location}. Prices may decrease due to increased availability.`;
      case 'anomaly':
        return `Unusual price movement detected for ${materialName} in ${signal.location}.`;
      default:
        return `Market signal detected for ${materialName} in ${signal.location}.`;
    }
  };

  return (
    <div className={`bg-white border-l-4 ${getBorderColor()} rounded-lg shadow-md p-4 mb-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 mt-1">
            <AlertTriangle className={`w-6 h-6 ${
              signal.severity === 'critical' ? 'text-red-500' :
              signal.severity === 'high' ? 'text-orange-500' :
              signal.severity === 'medium' ? 'text-yellow-500' :
              'text-blue-500'
            }`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <SignalBadge
                type={signal.signal_type}
                severity={signal.severity}
                confidence={signal.confidence}
                compact
              />
              <span className="text-xs text-gray-500">
                {new Date(signal.detected_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <p className="text-sm text-gray-700 mb-3">
              {getMessage()}
            </p>
            
            {onViewDetails && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onViewDetails}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View Details
              </Button>
            )}
          </div>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
