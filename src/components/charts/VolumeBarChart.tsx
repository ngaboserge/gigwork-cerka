import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DataPoint {
  date: string;
  volume: number;
  change?: number;
}

interface VolumeBarChartProps {
  data: DataPoint[];
  height?: number;
}

export function VolumeBarChart({ data, height = 200 }: VolumeBarChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{payload[0].payload.date}</p>
          <p className="text-sm text-gray-600">
            Volume: <span className="font-bold">{payload[0].value}</span>
          </p>
          {payload[0].payload.change !== undefined && (
            <p className={`text-xs font-semibold ${payload[0].payload.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {payload[0].payload.change >= 0 ? '+' : ''}{payload[0].payload.change.toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          stroke="#9ca3af"
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          stroke="#9ca3af"
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.change !== undefined && entry.change < 0 ? '#ef4444' : '#3b82f6'} 
              opacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
