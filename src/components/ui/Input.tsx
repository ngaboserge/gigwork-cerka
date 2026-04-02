import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, hint, icon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full px-3 py-2 text-sm bg-white border ${
              icon ? 'pl-10' : ''
            } ${
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
            } focus:outline-none focus:ring-1 placeholder:text-neutral-400 transition-colors duration-150 ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
