import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import { formatCurrency } from '../../lib/currency';

interface DataPoint {
  date: string;
  median: number;
  min: number;
  max: number;
  volume: number;
  avg?: number;
}

interface ComposedPriceChartProps {
  data: DataPoint[];
  height?: number;
  showVolume?: boolean;
  showRange?: boolean;
}

export function ComposedPriceChart({ data, height = 400, showVolume = true, showRange = true }: ComposedPriceChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
          <p className="text-sm font-bold text-gray-900 mb-2">{data.date}</p>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              Median: <span className="font-bold text-blue-600">{formatCurrency(data.median)}</span>
            </p>
            {data.avg && (
              <p className="text-sm text-gray-600">
                Average: <span className="font-bold text-purple-600">{formatCurrency(data.avg)}</span>
              </p>
            )}
            {showRange && (
              <>
                <p className="text-sm text-gray-600">
                  High: <span className="font-bold text-red-600">{formatCurrency(data.max)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Low: <span className="font-bold text-green-600">{formatCurrency(data.min)}</span>
                </p>
              </>
            )}
            {showVolume && (
              <p className="text-xs text-gray-500 pt-1 border-t border-gray-200">
                Volume: {data.volume} listings
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <defs>
          <linearGradient id="colorRange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#93c5fd" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          stroke="#9ca3af"
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          yAxisId="price"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          stroke="#9ca3af"
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          label={{ value: 'Price (RWF)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
        />
        {showVolume && (
          <YAxis 
            yAxisId="volume"
            orientation="right"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
            label={{ value: 'Volume', angle: 90, position: 'insideRight', style: { fontSize: 12, fill: '#6b7280' } }}
          />
        )}
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ fontSize: 12 }}
          iconType="line"
        />
        
        {showVolume && (
          <Bar 
            yAxisId="volume"
            dataKey="volume" 
            fill="#93c5fd" 
            opacity={0.3}
            radius={[4, 4, 0, 0]}
            name="Volume"
          />
        )}
        
        {showRange && (
          <>
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="max"
              stroke="none"
              fill="url(#colorRange)"
              name="Price Range"
            />
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="min"
              stroke="none"
              fill="#ffffff"
            />
          </>
        )}
        
        <Line 
          yAxisId="price"
          type="monotone" 
          dataKey="median" 
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
          name="Median Price"
        />
        
        {data[0]?.avg && (
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="avg" 
            stroke="#a855f7" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Average Price"
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
