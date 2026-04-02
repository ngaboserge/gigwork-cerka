import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { formatCurrency } from '../../lib/currency';

interface DataPoint {
  date: string;
  price: number;
  volume?: number;
}

interface PriceLineChartProps {
  data: DataPoint[];
  showArea?: boolean;
  color?: string;
  height?: number;
}

export function PriceLineChart({ data, showArea = true, color = '#3b82f6', height = 300 }: PriceLineChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{payload[0].payload.date}</p>
          <p className="text-sm text-gray-600">
            Price: <span className="font-bold text-blue-600">{formatCurrency(payload[0].value)}</span>
          </p>
          {payload[0].payload.volume && (
            <p className="text-xs text-gray-500">Volume: {payload[0].payload.volume}</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (showArea) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={color} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          stroke="#9ca3af"
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          stroke="#9ca3af"
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke={color} 
          strokeWidth={2}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
