import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../lib/currency';

interface MaterialData {
  name: string;
  color: string;
  data: { date: string; price: number }[];
}

interface PriceComparisonChartProps {
  materials: MaterialData[];
  height?: number;
}

export function PriceComparisonChart({ materials, height = 400 }: PriceComparisonChartProps) {
  // Merge all data points by date
  const mergedData = materials[0]?.data.map((point, index) => {
    const dataPoint: any = { date: point.date };
    materials.forEach(material => {
      dataPoint[material.name] = material.data[index]?.price || null;
    });
    return dataPoint;
  }) || [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
          <p className="text-sm font-bold text-gray-900 mb-2">{payload[0].payload.date}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: <span className="font-bold">{formatCurrency(entry.value)}</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={mergedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
          tick={{ fontSize: 12, fill: '#6b7280' }}
          stroke="#9ca3af"
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          label={{ value: 'Price (RWF)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ fontSize: 12 }}
          iconType="line"
        />
        
        {materials.map((material) => (
          <Line 
            key={material.name}
            type="monotone" 
            dataKey={material.name} 
            stroke={material.color} 
            strokeWidth={2}
            dot={{ fill: material.color, r: 3 }}
            activeDot={{ r: 5 }}
            name={material.name}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
