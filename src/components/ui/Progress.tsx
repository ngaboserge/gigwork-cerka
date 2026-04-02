interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
}

export function Progress({ value, max = 100, size = 'md', variant = 'default', showLabel = false, label }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variants = {
    default: 'bg-primary-800',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  };

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-sm text-neutral-700">{label}</span>}
          {showLabel && <span className="text-sm text-neutral-500">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`w-full bg-neutral-200 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`${sizes[size]} ${variants[variant]} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface StepsProps {
  steps: { label: string; description?: string }[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
}

export function Steps({ steps, currentStep, orientation = 'horizontal' }: StepsProps) {
  if (orientation === 'vertical') {
    return (
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={index} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted
                      ? 'bg-primary-800 text-white'
                      : isCurrent
                      ? 'bg-primary-100 text-primary-800 border-2 border-primary-800'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-0.5 h-8 mt-2 ${isCompleted ? 'bg-primary-800' : 'bg-neutral-200'}`} />
                )}
              </div>
              <div className="pt-1">
                <p className={`text-sm font-medium ${isCurrent ? 'text-primary-800' : 'text-neutral-900'}`}>
                  {step.label}
                </p>
                {step.description && <p className="text-xs text-neutral-500 mt-0.5">{step.description}</p>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted
                    ? 'bg-primary-800 text-white'
                    : isCurrent
                    ? 'bg-primary-100 text-primary-800 border-2 border-primary-800'
                    : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <p className={`text-xs mt-1 ${isCurrent ? 'text-primary-800 font-medium' : 'text-neutral-500'}`}>
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-primary-800' : 'bg-neutral-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
