import { TrendingUp, TrendingDown, Minus } from '../../lib/icons';

interface TrendBadgeProps {
  direction: 'up' | 'down' | 'stable';
  change: number;
  strength?: 'weak' | 'moderate' | 'strong';
  compact?: boolean;
}

export function TrendBadge({ direction, change, strength, compact = false }: TrendBadgeProps) {
  const getIcon = () => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      case 'stable':
        return <Minus className="w-4 h-4" />;
    }
  };

  const getColor = () => {
    if (direction === 'stable') return 'bg-gray-100 text-gray-700 border-gray-300';
    
    const isPositive = direction === 'down'; // Down is good for buyers
    const absChange = Math.abs(change);
    
    if (absChange > 10) {
      return isPositive ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300';
    } else if (absChange > 5) {
      return isPositive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-300';
    } else {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getLabel = () => {
    if (direction === 'stable') return 'Stable';
    const prefix = direction === 'up' ? '+' : '';
    return `${prefix}${change.toFixed(1)}%`;
  };

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getColor()}`}>
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
        {strength && (
          <span className="text-xs opacity-75 capitalize">{strength} trend</span>
        )}
      </div>
    </div>
  );
}
