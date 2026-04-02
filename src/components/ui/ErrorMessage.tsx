import { useState } from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  type?: 'error' | 'warning';
  className?: string;
}

export function ErrorMessage({ 
  title,
  message, 
  onRetry, 
  onDismiss,
  type = 'error',
  className = ''
}: ErrorMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const colors = {
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-500',
      title: 'text-red-900 dark:text-red-200',
      message: 'text-red-700 dark:text-red-300',
      button: 'text-red-700 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200'
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      icon: 'text-amber-500',
      title: 'text-amber-900 dark:text-amber-200',
      message: 'text-amber-700 dark:text-amber-300',
      button: 'text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200'
    }
  };

  const style = colors[type];

  return (
    <div className={`animate-shake ${style.bg} ${style.border} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${style.icon}`}>
          {type === 'error' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`text-sm font-semibold ${style.title} mb-1`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${style.message}`}>
            {message}
          </p>

          {/* Actions */}
          {(onRetry || onDismiss) && (
            <div className="flex items-center gap-4 mt-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`text-sm font-medium ${style.button} transition-colors`}
                >
                  Try again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={handleDismiss}
                  className={`text-sm font-medium ${style.button} transition-colors`}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>

        {/* Close button */}
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className={`flex-shrink-0 ${style.button} transition-colors`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Inline error for form fields
interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className = '' }: InlineErrorProps) {
  return (
    <div className={`flex items-center gap-1.5 text-red-600 dark:text-red-400 text-sm mt-1 animate-fadeIn ${className}`}>
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
