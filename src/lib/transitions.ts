/**
 * Page Transition Configurations
 * Smooth transitions between routes and pages
 */

export interface TransitionConfig {
  duration: number;
  easing: string;
  delay?: number;
}

// Page transition configurations
export const pageTransitions = {
  fade: {
    duration: 300,
    easing: 'ease-out',
  },
  slideUp: {
    duration: 400,
    easing: 'ease-out',
  },
  slideRight: {
    duration: 400,
    easing: 'ease-out',
  },
  scale: {
    duration: 300,
    easing: 'ease-out',
  },
};

// Modal/Dialog transitions
export const modalTransitions = {
  backdrop: {
    duration: 200,
    easing: 'ease-out',
  },
  content: {
    duration: 300,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

// Dropdown/Menu transitions
export const dropdownTransitions = {
  enter: {
    duration: 200,
    easing: 'ease-out',
  },
  exit: {
    duration: 150,
    easing: 'ease-in',
  },
};

// Toast/Notification transitions
export const toastTransitions = {
  enter: {
    duration: 300,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  exit: {
    duration: 200,
    easing: 'ease-in',
  },
};

// CSS transition classes
export const transitionClasses = {
  // Base transitions
  all: 'transition-all',
  colors: 'transition-colors',
  opacity: 'transition-opacity',
  transform: 'transition-transform',
  shadow: 'transition-shadow',
  
  // Durations
  fast: 'duration-150',
  base: 'duration-200',
  slow: 'duration-300',
  slower: 'duration-500',
  
  // Easings
  easeOut: 'ease-out',
  easeIn: 'ease-in',
  easeInOut: 'ease-in-out',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// Helper to combine transition classes
export const getTransitionClass = (
  properties: ('all' | 'colors' | 'opacity' | 'transform' | 'shadow')[],
  duration: 'fast' | 'base' | 'slow' | 'slower' = 'base',
  easing: 'easeOut' | 'easeIn' | 'easeInOut' | 'bounce' = 'easeOut'
): string => {
  const propClasses = properties.map(prop => transitionClasses[prop]).join(' ');
  return `${propClasses} ${transitionClasses[duration]} ${transitionClasses[easing]}`;
};

// Page transition wrapper helper
export const getPageTransitionStyle = (
  isEntering: boolean,
  transition: keyof typeof pageTransitions = 'fade'
): React.CSSProperties => {
  const config = pageTransitions[transition];
  
  const baseStyle: React.CSSProperties = {
    transition: `all ${config.duration}ms ${config.easing}`,
  };

  if (!isEntering) {
    return {
      ...baseStyle,
      opacity: 0,
      transform: transition === 'slideUp' ? 'translateY(20px)' : 
                 transition === 'slideRight' ? 'translateX(-20px)' :
                 transition === 'scale' ? 'scale(0.95)' : 'none',
    };
  }

  return {
    ...baseStyle,
    opacity: 1,
    transform: 'none',
  };
};

// Stagger delay calculator
export const getStaggerDelay = (index: number, baseDelay: number = 50): number => {
  return index * baseDelay;
};

// Loading state transitions
export const loadingTransitions = {
  skeleton: {
    duration: 2000,
    easing: 'linear',
  },
  spinner: {
    duration: 1000,
    easing: 'linear',
  },
  pulse: {
    duration: 2000,
    easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};
