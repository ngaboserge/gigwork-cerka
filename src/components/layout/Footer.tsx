import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store';

export function Footer() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  
  // Get user's platform preference
  const platformPreference = user?.platform_preference || 'both';
  const showMarketplace = platformPreference === 'marketplace' || platformPreference === 'both';
  const showGigWork = platformPreference === 'gigwork' || platformPreference === 'both';
  const isAdmin = user?.role === 'admin';
  
  return (
    <footer className="bg-blue-600 text-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="/assets/cerka-logo.png" 
                alt="Cerka" 
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-blue-100">
              {t('footer.tagline')}
            </p>
          </div>
          
          {/* Gig Work Links - Only show if user selected gigwork or both, or is admin */}
          {(showGigWork || isAdmin || !user) && (
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">{t('footer.forWorkers')}</h4>
              <ul className="space-y-2">
                <li><Link to="/employee/jobs" className="text-sm text-blue-100 hover:text-white">{t('footer.findJobs')}</Link></li>
                <li><Link to="/register" className="text-sm text-blue-100 hover:text-white">{t('footer.createProfile')}</Link></li>
                <li><Link to="#" className="text-sm text-blue-100 hover:text-white">{t('footer.howItWorks')}</Link></li>
              </ul>
            </div>
          )}
          
          {/* Marketplace Links - Only show if user selected marketplace or both, or is admin */}
          {(showMarketplace || isAdmin) && user && (
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Marketplace</h4>
              <ul className="space-y-2">
                <li><Link to="/buyers/search" className="text-sm text-blue-100 hover:text-white">Browse Listings</Link></li>
                <li><Link to="/marketplace/categories" className="text-sm text-blue-100 hover:text-white">All Categories</Link></li>
                <li><Link to="/materials/trends" className="text-sm text-blue-100 hover:text-white">Price Trends</Link></li>
              </ul>
            </div>
          )}
          
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">{t('footer.company')}</h4>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-sm text-blue-100 hover:text-white">{t('footer.helpCenter')}</Link></li>
              <li><Link to="#" className="text-sm text-blue-100 hover:text-white">{t('footer.aboutUs')}</Link></li>
              <li><Link to="#" className="text-sm text-blue-100 hover:text-white">{t('footer.contact')}</Link></li>
              <li><Link to="#" className="text-sm text-blue-100 hover:text-white">{t('footer.pricing')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">{t('footer.legal')}</h4>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-sm text-blue-100 hover:text-white">{t('footer.termsOfService')}</Link></li>
              <li><Link to="/privacy" className="text-sm text-blue-100 hover:text-white">{t('footer.privacyPolicy')}</Link></li>
              <li><Link to="/disclaimer" className="text-sm text-blue-100 hover:text-white">{t('footer.independentWorkerDisclaimer')}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-blue-500 mt-8 pt-8">
          {(showGigWork || isAdmin || !user) && (
            <p className="text-sm text-blue-100 mb-4 max-w-3xl">
              <strong className="text-white">{t('footer.independentWorkerNotice')}</strong> {t('footer.independentWorkerText')}
            </p>
          )}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-blue-200">2026 Cerka. {t('footer.allRightsReserved')}</p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-blue-300 font-mono">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
