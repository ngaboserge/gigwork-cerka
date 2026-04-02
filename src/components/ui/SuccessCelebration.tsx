import { useEffect, useState } from 'react';

interface SuccessCelebrationProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
  duration?: number;
}

export function SuccessCelebration({ 
  show, 
  message = 'Success!', 
  onComplete,
  duration = 2000 
}: SuccessCelebrationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti pieces
      const pieces = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)]
      }));
      setConfetti(pieces);

      // Clear confetti and call onComplete
      const timer = setTimeout(() => {
        setConfetti([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Confetti */}
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 animate-confetti"
          style={{
            left: `${piece.left}%`,
            top: '-10px',
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}

      {/* Success message */}
      <div className="animate-bounce-in bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-8 text-center pointer-events-auto">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {message}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Your action was completed successfully
        </p>
      </div>
    </div>
  );
}

// Hook for easy usage
export function useSuccessCelebration() {
  const [show, setShow] = useState(false);

  const celebrate = (message?: string) => {
    setShow(true);
  };

  const handleComplete = () => {
    setShow(false);
  };

  return {
    show,
    celebrate,
    SuccessCelebration: (props: Omit<SuccessCelebrationProps, 'show' | 'onComplete'>) => (
      <SuccessCelebration {...props} show={show} onComplete={handleComplete} />
    ),
  };
}
