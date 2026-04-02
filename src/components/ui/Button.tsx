import { ButtonHTMLAttributes, forwardRef, useState } from 'react';
import { ButtonLoader } from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  withRipple?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className = '', 
    variant = 'primary', 
    size = 'md', 
    loading, 
    disabled, 
    fullWidth,
    withRipple = true,
    children,
    onClick,
    ...props 
  }, ref) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (withRipple && !disabled && !loading) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        
        setRipples(prev => [...prev, { x, y, id }]);
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== id));
        }, 600);
      }
      
      onClick?.(e);
    };

    const baseStyles = 'relative overflow-hidden inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] hover:shadow-md';
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700',
      secondary: 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 shadow-sm focus:ring-neutral-500 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-600 dark:hover:bg-neutral-700',
      ghost: 'text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500 dark:text-neutral-300 dark:hover:bg-neutral-800',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm focus:ring-red-500',
      success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm focus:ring-green-500',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effect */}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
            }}
          />
        ))}
        
        {loading && (
          <span className="mr-2">
            <ButtonLoader />
          </span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
