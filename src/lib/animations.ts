/**
 * Animation Utilities
 * Reusable animation variants and helpers for consistent motion design
 */

// Framer Motion variants (if you add framer-motion later)
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

export const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

export const slideInRightVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

// Stagger children animation
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

// CSS class helpers
export const getAnimationClass = (
  animation: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'slideInRight' | 'scaleIn' | 'none',
  delay?: number
): string => {
  const animationClasses = {
    fadeIn: 'animate-fadeIn',
    fadeInUp: 'animate-fadeInUp',
    fadeInDown: 'animate-fadeInDown',
    slideInRight: 'animate-slideInRight',
    scaleIn: 'animate-scaleIn',
    none: '',
  };

  return animationClasses[animation];
};

export const getStaggerDelay = (index: number, baseDelay: number = 50): number => {
  return index * baseDelay;
};

// Hover effect helpers
export const getHoverClass = (
  effect: 'lift' | 'scale' | 'glow' | 'none'
): string => {
  const hoverClasses = {
    lift: 'hover-lift',
    scale: 'hover-scale',
    glow: 'hover-glow',
    none: '',
  };

  return hoverClasses[effect];
};

// Transition timing functions
export const transitions = {
  fast: 'transition-all duration-150 ease-out',
  base: 'transition-all duration-200 ease-out',
  slow: 'transition-all duration-300 ease-out',
  bounce: 'transition-all duration-500 cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// Animation delay helpers
export const getDelayStyle = (delay: number) => ({
  animationDelay: `${delay}ms`
});

// Intersection Observer hook helper (for scroll animations)
export const observerOptions: IntersectionObserverInit = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};
