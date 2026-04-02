import { useState, useRef, useEffect } from 'react';

interface SliderProps {
  min: number;
  max: number;
  value: [number, number] | number;
  onChange: (value: [number, number] | number) => void;
  step?: number;
  label?: string;
  formatValue?: (value: number) => string;
  range?: boolean;
}

export function Slider({ min, max, value, onChange, step = 1, label, formatValue = (v) => String(v), range = false }: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);

  const minValue = range ? (value as [number, number])[0] : min;
  const maxValue = range ? (value as [number, number])[1] : (value as number);

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

  const handleMouseDown = (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(thumb);
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackRef.current) return;
      
      const rect = trackRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const newValue = Math.round((percentage / 100) * (max - min) / step) * step + min;

      if (range) {
        const [currentMin, currentMax] = value as [number, number];
        if (dragging === 'min') {
          onChange([Math.min(newValue, currentMax - step), currentMax]);
        } else {
          onChange([currentMin, Math.max(newValue, currentMin + step)]);
        }
      } else {
        onChange(newValue);
      }
    };

    const handleMouseUp = () => setDragging(null);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, min, max, step, value, onChange, range]);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-neutral-700">{label}</span>
          <span className="text-sm text-neutral-600">
            {range ? `${formatValue(minValue)} - ${formatValue(maxValue)}` : formatValue(maxValue)}
          </span>
        </div>
      )}
      <div ref={trackRef} className="relative h-2 bg-neutral-200 rounded cursor-pointer">
        <div
          className="absolute h-full bg-primary-800 rounded"
          style={{
            left: range ? `${getPercentage(minValue)}%` : '0%',
            right: `${100 - getPercentage(maxValue)}%`,
          }}
        />
        {range && (
          <div
            className="absolute w-4 h-4 bg-white border-2 border-primary-800 rounded-full -mt-1 -ml-2 cursor-grab active:cursor-grabbing"
            style={{ left: `${getPercentage(minValue)}%` }}
            onMouseDown={handleMouseDown('min')}
          />
        )}
        <div
          className="absolute w-4 h-4 bg-white border-2 border-primary-800 rounded-full -mt-1 -ml-2 cursor-grab active:cursor-grabbing"
          style={{ left: `${getPercentage(maxValue)}%` }}
          onMouseDown={handleMouseDown('max')}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-neutral-500">{formatValue(min)}</span>
        <span className="text-xs text-neutral-500">{formatValue(max)}</span>
      </div>
    </div>
  );
}
