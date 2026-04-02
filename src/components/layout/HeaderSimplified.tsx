import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useMessageStore } from '@/store';
import { Button, Avatar } from '@/components/ui';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, X, MessageCircle, Package, User } from '@/lib/icons';

export function HeaderSimplified() {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getTotalUnreadCount, fetchConversations } = useMessageStore();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const unreadMessageCount = getTotalUnreadCount();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchConversations();
    }
  }, [isAuthenticated, user, fetchConversations]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowMobileMenu(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/materials/trends?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/materials/trends');
    }
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? "/home" : "/"} className="flex items-center gap-2 flex-shrink-0">
            <img 
              src="/assets/cerka-logo.png" 
              alt="Cerka" 
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Navigation Tabs - Desktop */}
          {isAuthenticated && user && (
            <nav className="hidden lg:flex items-center gap-1 ml-8">
              <Link 
                to="/home" 
                className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded transition-colors"
              >
                {t('common.home')}
              </Link>
              <Link 
                to="/marketplace/categories" 
                className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded transition-colors"
              >
                {t('common.marketplace')}
              </Link>
              <Link 
                to={user.role === 'employer' ? '/employer/dashboard' : '/employee/dashboard'}
                className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded transition-colors"
              >
                {t('common.gigWork')}
              </Link>
              <Link 
                to="/materials/trends" 
                className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded transition-colors"
              >
                {t('common.priceIntelligence')}
              </Link>
              <Link 
                to="/help" 
                className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('common.help')}
              </Link>
            </nav>
          )}

          {/* Search Bar - Desktop */}
          {isAuthenticated && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('marketplace.searchPlaceholder')}
                  className="w-full px-4 py-2.5 pl-11 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              </div>
            </form>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isAuthenticated && user ? (
              <>
                {/* Gig Work Icon - Desktop */}
                <button
                  onClick={() => navigate(user.role === 'employer' ? '/employer/dashboard' : '/employee/dashboard')}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs bg-primary-800 text-white hover:bg-primary-900 rounded font-medium transition-colors duration-150"
                  title="Gig Work Dashboard"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Gig Work</span>
                </button>

                {/* Sell Button - Desktop */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/suppliers/create')}
                  className="hidden md:flex items-center gap-2 font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  {t('nav.sell')}
                </Button>

                {/* Messages */}
                <button
                  onClick={() => navigate('/messages')}
                  className="relative p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  title={t('common.messages')}
                >
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600 dark:text-neutral-400" />
                  {unreadMessageCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                      {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                    </span>
                  )}
                </button>

                {/* Language Switcher - Always visible */}
                <LanguageSwitcher />

                {/* Dark Mode Toggle - Hidden on small screens */}
                <div className="hidden sm:block">
                  <DarkModeToggle />
                </div>

                {/* Notifications */}
                <NotificationDropdown />

                {/* Hamburger Menu */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors ml-1"
                  title={t('common.menu')}
                >
                  {showMobileMenu ? (
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600" />
                  ) : (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </>
            ) : (
              <>
                <LanguageSwitcher />
                <Link to="/login">
                  <Button variant="ghost" size="sm">{t('common.login')}</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">{t('common.register')}</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isAuthenticated && (
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('marketplace.searchPlaceholder')}
                className="w-full px-4 py-2.5 pl-11 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            </div>
          </form>
        )}
      </div>

      {/* Slide-out Menu */}
      {showMobileMenu && isAuthenticated && user && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-16 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="p-6">
              {/* User Info */}
              <div className="flex items-center gap-3 pb-6 border-b border-neutral-200">
                <Avatar 
                  name={user.name} 
                  src={user.avatar_url}
                  size="lg"
                />
                <div>
                  <p className="font-semibold text-neutral-900">{user.name}</p>
                  <p className="text-sm text-neutral-600 capitalize">{user.role}</p>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="mt-6 space-y-1">
                {/* Primary Navigation */}
                <div className="mb-2">
                  <p className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    {t('nav.explore')}
                  </p>
                </div>

                <Link
                  to="/home"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="font-medium">{t('common.home')}</span>
                </Link>

                <Link
                  to="/marketplace/categories"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <Package className="w-5 h-5" />
                  <span className="font-medium">{t('common.marketplace')}</span>
                </Link>

                <Link
                  to={user.role === 'employer' ? '/employer/dashboard' : '/employee/dashboard'}
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{t('common.gigWork')}</span>
                </Link>

                <Link
                  to="/materials/trends"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-medium">{t('common.priceIntelligence')}</span>
                </Link>

                <Link
                  to="/help"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{t('nav.helpCenter')}</span>
                </Link>

                {/* Divider */}
                <div className="py-3">
                  <div className="border-t border-neutral-200" />
                </div>

                {/* My Activity Section */}
                <div className="mb-2">
                  <p className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    {t('nav.myActivity')}
                  </p>
                </div>

                {/* Secondary Actions */}
                <Link
                  to="/suppliers/create"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  <span>{t('nav.sellSomething')}</span>
                </Link>

                <Link
                  to="/suppliers/listings"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <Package className="w-5 h-5" />
                  <span className="font-medium">{t('nav.myListings')}</span>
                </Link>

                <Link
                  to="/messages"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">{t('common.messages')}</span>
                  {unreadMessageCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                    </span>
                  )}
                </Link>

                {/* Divider */}
                <div className="py-3">
                  <div className="border-t border-neutral-200" />
                </div>

                {/* Settings Section - Mobile Only */}
                <div className="mb-2 lg:hidden">
                  <p className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    {t('common.settings')}
                  </p>
                </div>

                {/* Language Switcher - Always visible in mobile menu */}
                <div className="lg:hidden px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">{t('common.language')}</span>
                    <LanguageSwitcher />
                  </div>
                </div>

                {/* Dark Mode - Mobile Only */}
                <div className="lg:hidden px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">{t('common.darkMode')}</span>
                    <DarkModeToggle />
                  </div>
                </div>

                {/* Divider - Mobile Only */}
                <div className="py-3 lg:hidden">
                  <div className="border-t border-neutral-200" />
                </div>

                <Link
                  to={user.role === 'worker' ? '/employee/profile' : `/${user.role}/profile`}
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">{t('auth.profileSettings')}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                  <span className="font-medium">{t('common.logout')}</span>
                </button>
              </nav>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
