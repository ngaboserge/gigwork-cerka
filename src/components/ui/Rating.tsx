interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}

export function Rating({ value = 0, max = 5, size = 'md', showValue = false, reviewCount, onChange, readonly = true }: RatingProps) {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const safeValue = value || 0;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(safeValue);
          const partial = i === Math.floor(safeValue) && safeValue % 1 > 0;
          const percentage = partial ? (safeValue % 1) * 100 : 0;

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(i + 1)}
              disabled={readonly}
              className={`${readonly ? '' : 'cursor-pointer hover:scale-110'} transition-transform`}
            >
              <svg
                className={`${sizes[size]} ${filled ? 'text-amber-400' : 'text-neutral-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                {partial ? (
                  <defs>
                    <linearGradient id={`star-gradient-${i}`}>
                      <stop offset={`${percentage}%`} stopColor="#fbbf24" />
                      <stop offset={`${percentage}%`} stopColor="#d1d5db" />
                    </linearGradient>
                  </defs>
                ) : null}
                <path
                  fill={partial ? `url(#star-gradient-${i})` : 'currentColor'}
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className={`font-medium text-neutral-900 ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
          {safeValue.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={`text-neutral-500 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

interface RatingBreakdownProps {
  ratings: { stars: number; count: number }[];
  total: number;
}

export function RatingBreakdown({ ratings, total }: RatingBreakdownProps) {
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((stars) => {
        const rating = ratings.find((r) => r.stars === stars);
        const count = rating?.count || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;

        return (
          <div key={stars} className="flex items-center gap-2">
            <span className="text-sm text-neutral-600 w-12">{stars} star</span>
            <div className="flex-1 h-2 bg-neutral-200 rounded overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm text-neutral-500 w-8 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
