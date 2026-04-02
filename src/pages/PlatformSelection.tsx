import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store';
import { Button, AnimatedCard } from '@/components/ui';
import { Briefcase, ShoppingCart, Layers } from '@/lib/icons';
import { supabase } from '@/lib/supabase';

type PlatformType = 'gigwork' | 'marketplace' | 'both';

export function PlatformSelection() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [selected, setSelected] = useState<PlatformType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected || !user) return;

    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          platform_preference: selected,
          platform_selected_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Redirect based on platform selection
      if (selected === 'gigwork') {
        window.location.href = '/gig-work';
      } else if (selected === 'marketplace') {
        window.location.href = '/marketplace';
      } else {
        window.location.href = '/home';
      }
    } catch (error) {
      console.error('Error saving platform preference:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeInDown">
          <img 
            src="/assets/cerka-logo.png" 
            alt="Cerka" 
            className="h-16 w-auto mx-auto mb-6"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
            {t('platformSelection.title', 'Choose Your Platform')}
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {t('platformSelection.subtitle', 'Select how you want to use Cerka. You can always switch later.')}
          </p>
        </div>

        {/* Platform Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Gig Work */}
          <AnimatedCard
            hover="lift"
            animation="fadeInUp"
            delay={0}
            onClick={() => setSelected('gigwork')}
            className={`
              relative p-8 cursor-pointer transition-all border-2
              ${selected === 'gigwork' 
                ? 'border-blue-500 bg-blue-50 shadow-xl' 
                : 'border-neutral-200 hover:border-blue-300 hover:shadow-lg'
              }
            `}
          >
            {selected === 'gigwork' && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-neutral-900 mb-3 text-center">
              {t('platformSelection.gigwork', 'Gig Work')}
            </h3>
            
            <p className="text-neutral-600 text-center mb-6">
              {t('platformSelection.gigworkDesc', 'Find flexible work or hire workers for shifts')}
            </p>
            
            <div className="space-y-2 text-sm text-neutral-700">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">✓</span>
                <span>{t('platformSelection.gigworkFeature1', 'Browse and apply for shifts')}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">✓</span>
                <span>{t('platformSelection.gigworkFeature2', 'Post shifts and hire workers')}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">✓</span>
                <span>{t('platformSelection.gigworkFeature3', 'Time tracking & payments')}</span>
              </div>
            </div>
          </AnimatedCard>

          {/* Marketplace */}
          <AnimatedCard
            hover="lift"
            animation="fadeInUp"
            delay={100}
            onClick={() => setSelected('marketplace')}
            className={`
              relative p-8 cursor-pointer transition-all border-2
              ${selected === 'marketplace' 
                ? 'border-green-500 bg-green-50 shadow-xl' 
                : 'border-neutral-200 hover:border-green-300 hover:shadow-lg'
              }
            `}
          >
            {selected === 'marketplace' && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-neutral-900 mb-3 text-center">
              {t('platformSelection.marketplace', 'Marketplace')}
            </h3>
            
            <p className="text-neutral-600 text-center mb-6">
              {t('platformSelection.marketplaceDesc', 'Buy and sell products across 14 sectors')}
            </p>
            
            <div className="space-y-2 text-sm text-neutral-700">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>{t('platformSelection.marketplaceFeature1', 'Browse 14 product categories')}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>{t('platformSelection.marketplaceFeature2', 'Create and manage listings')}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>{t('platformSelection.marketplaceFeature3', 'Track price trends & intelligence')}</span>
              </div>
            </div>
          </AnimatedCard>

          {/* Both */}
          <AnimatedCard
            hover="lift"
            animation="fadeInUp"
            delay={200}
            onClick={() => setSelected('both')}
            className={`
              relative p-8 cursor-pointer transition-all border-2
              ${selected === 'both' 
                ? 'border-purple-500 bg-purple-50 shadow-xl' 
                : 'border-neutral-200 hover:border-purple-300 hover:shadow-lg'
              }
            `}
          >
            {selected === 'both' && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Layers className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-neutral-900 mb-3 text-center">
              {t('platformSelection.both', 'Full Platform')}
            </h3>
            
            <p className="text-neutral-600 text-center mb-6">
              {t('platformSelection.bothDesc', 'Access everything in one unified experience')}
            </p>
            
            <div className="space-y-2 text-sm text-neutral-700">
              <div className="flex items-start gap-2">
                <span className="text-purple-600 font-bold mt-0.5">✓</span>
                <span>{t('platformSelection.bothFeature1', 'All gig work features')}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600 font-bold mt-0.5">✓</span>
                <span>{t('platformSelection.bothFeature2', 'All marketplace features')}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600 font-bold mt-0.5">✓</span>
                <span>{t('platformSelection.bothFeature3', 'Seamless switching')}</span>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Continue Button */}
        <div className="text-center animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selected}
            loading={loading}
            className="px-12"
          >
            {t('platformSelection.continue', 'Continue')}
          </Button>
          
          <p className="text-sm text-neutral-500 mt-4">
            {t('platformSelection.canSwitch', 'You can change this anytime in your settings')}
          </p>
        </div>
      </div>
    </div>
  );
}
