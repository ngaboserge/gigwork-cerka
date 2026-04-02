import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface DataPoint {
  value: number;
}

interface SparklineProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export function Sparkline({ data, color, height = 40, trend }: SparklineProps) {
  // Auto-detect trend if not provided
  const detectedTrend = trend || (() => {
    if (data.length < 2) return 'neutral';
    const first = data[0].value;
    const last = data[data.length - 1].value;
    if (last > first * 1.05) return 'up';
    if (last < first * 0.95) return 'down';
    return 'neutral';
  })();

  const lineColor = color || (
    detectedTrend === 'up' ? '#10b981' : 
    detectedTrend === 'down' ? '#ef4444' : 
    '#6b7280'
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={lineColor} 
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
