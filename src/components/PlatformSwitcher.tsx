import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { Briefcase, ShoppingCart, Layers } from '@/lib/icons';

export function PlatformSwitcher() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const currentPlatform = user.platform_preference || 'both';

  const platforms = [
    { 
      id: 'gigwork', 
      name: 'Gig Work', 
      icon: <Briefcase className="w-4 h-4" />,
      color: 'blue'
    },
    { 
      id: 'marketplace', 
      name: 'Marketplace', 
      icon: <ShoppingCart className="w-4 h-4" />,
      color: 'green'
    },
    { 
      id: 'both', 
      name: 'Full Platform', 
      icon: <Layers className="w-4 h-4" />,
      color: 'purple'
    },
  ];

  const current = platforms.find(p => p.id === currentPlatform);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        {current?.icon}
        <span className="text-sm font-medium text-neutral-900 dark:text-white hidden sm:inline">
          {current?.name}
        </span>
        <svg 
          className={`w-4 h-4 text-neutral-600 dark:text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 z-20 overflow-hidden">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
                Switch Platform
              </div>
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/platform-selection');
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left
                    ${currentPlatform === platform.id 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' 
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center
                    ${platform.color === 'blue' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}
                    ${platform.color === 'green' && 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}
                    ${platform.color === 'purple' && 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}
                  `}>
                    {platform.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{platform.name}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {platform.id === 'gigwork' && 'Find work & hire'}
                      {platform.id === 'marketplace' && 'Buy & sell products'}
                      {platform.id === 'both' && 'Access everything'}
                    </div>
                  </div>
                  {currentPlatform === platform.id && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
