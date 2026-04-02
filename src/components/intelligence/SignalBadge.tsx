import { AlertTriangle, TrendingUp, TrendingDown, Activity, AlertCircle } from '../../lib/icons';

interface SignalBadgeProps {
  type: 'volatility' | 'shortage' | 'surplus' | 'trend' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence?: number;
  compact?: boolean;
}

export function SignalBadge({ type, severity, confidence, compact = false }: SignalBadgeProps) {
  const getIcon = () => {
    switch (type) {
      case 'volatility':
        return <Activity className="w-4 h-4" />;
      case 'shortage':
        return <AlertTriangle className="w-4 h-4" />;
      case 'surplus':
        return <TrendingDown className="w-4 h-4" />;
      case 'trend':
        return <TrendingUp className="w-4 h-4" />;
      case 'anomaly':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getColor = () => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getLabel = () => {
    const labels = {
      volatility: 'High Volatility',
      shortage: 'Shortage',
      surplus: 'Surplus',
      trend: 'Trending',
      anomaly: 'Anomaly'
    };
    return labels[type];
  };

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getColor()}`}>
        {getIcon()}
        {getLabel()}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${getColor()}`}>
      {getIcon()}
      <div className="flex flex-col">
        <span className="font-semibold">{getLabel()}</span>
        {confidence !== undefined && (
          <span className="text-xs opacity-75">{confidence.toFixed(0)}% confidence</span>
        )}
      </div>
      <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold uppercase">
        {severity}
      </span>
    </div>
  );
}
