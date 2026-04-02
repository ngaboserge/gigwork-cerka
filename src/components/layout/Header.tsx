import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useMessageStore } from '@/store';
import { Button, Avatar } from '@/components/ui';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { PlatformSwitcher } from '@/components/PlatformSwitcher';
import { useState, useEffect, useRef } from 'react';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getTotalUnreadCount, fetchConversations } = useMessageStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const unreadMessageCount = getTotalUnreadCount();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchConversations();
    }
  }, [isAuthenticated, user, fetchConversations]);

  // Track scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buyers/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get user's platform preference
  const platformPreference = user?.platform_preference || 'both';
  const showMarketplace = platformPreference === 'marketplace' || platformPreference === 'both';
  const showGigWork = platformPreference === 'gigwork' || platformPreference === 'both';

  return (
    <header className={`bg-white border-b border-neutral-200 sticky top-0 z-40 transition-all duration-300 ${
      scrolled ? 'shadow-lg' : 'shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Link 
              to={isAuthenticated ? (user?.role === 'admin' ? '/admin/dashboard' : '/home') : "/"} 
              className="flex items-center gap-2 flex-shrink-0 group relative mr-2"
            >
              <img 
                src="/assets/cerka-logo.png" 
                alt="Cerka" 
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
              {scrolled && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-primary-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              )}
            </Link>
            
            {/* No public links - all require login */}
            
            {isAuthenticated && user && (
              <>
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1 ml-4">
                  {user.role !== 'admin' && (
                    <Link 
                      to="/home" 
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative group ${
                        location.pathname === '/home' 
                          ? 'text-primary-700 bg-primary-50' 
                          : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
                      }`}
                    >
                      Home
                      {location.pathname === '/home' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-700"></div>
                      )}
                    </Link>
                  )}
                  
                  {/* Marketplace Navigation - Direct Links */}
                  {user.role !== 'admin' && showMarketplace && (
                    <>
                      <Link 
                        to="/buyers/search" 
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          location.pathname === '/buyers/search' 
                            ? 'text-primary-700 bg-primary-50' 
                            : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
                        }`}
                      >
                        Browse
                      </Link>
                      <Link 
                        to="/marketplace/categories" 
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          location.pathname.startsWith('/marketplace/') 
                            ? 'text-primary-700 bg-primary-50' 
                            : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
                        }`}
                      >
                        Categories
                      </Link>
                      <Link 
                        to="/materials/trends" 
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          location.pathname.startsWith('/materials/') 
                            ? 'text-primary-700 bg-primary-50' 
                            : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
                        }`}
                      >
                        Price Trends
                      </Link>
                    </>
                  )}
                  
                  {/* Gig Work Navigation - Direct Links (Primary Features Only) */}
                  {user.role !== 'admin' && showGigWork && (
                    <>
                      {user.role === 'employer' ? (
                        <>
                          <Link 
                            to="/employer/dashboard" 
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              location.pathname === '/employer/dashboard' 
                                ? 'text-primary-700 bg-primary-50' 
                                : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
                            }`}
                          >
                            Dashboard
                          </Link>
                          <Link 
                            to="/employer/shifts" 
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              location.pathname === '/employer/shifts' 
                                ? 'text-primary-700 bg-primary-50' 
                                : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
                            }`}
                          >
                            Shifts
                          </Link>
                          <Link 
                            to="/employer/applications" 
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              location.pathname === '/employer/applications' 
                                ? 'text-primary-700 bg-primary-50' 
                                : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
                            }`}
                          >
                            Applications
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link 
                            to="/employee/dashboard" 
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              location.pathname === '/employee/dashboard' 
                                ? 'text-primary-700 bg-primary-50' 
                                : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
                            }`}
                          >
                            Dashboard
                          </Link>
                          <Link 
                            to="/employee/jobs" 
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              location.pathname === '/employee/jobs' 
                                ? 'text-primary-700 bg-primary-50' 
                                : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
                            }`}
                          >
                            Find Shifts
                          </Link>
                          <Link 
                            to="/employee/schedule" 
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              location.pathname === '/employee/schedule' 
                                ? 'text-primary-700 bg-primary-50' 
                                : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
                            }`}
                          >
                            Schedule
                          </Link>
                          <Link 
                            to="/employee/reputation" 
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              location.pathname === '/employee/reputation' 
                                ? 'text-primary-700 bg-primary-50' 
                                : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
                            }`}
                          >
                            Reputation
                          </Link>
                        </>
                      )}
                    </>
                  )}
                  
                  {user.role === 'admin' && (
                    <>
                      <Link to="/admin/dashboard" className="px-3 py-2 text-sm font-medium text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-150">
                        Dashboard
                      </Link>
                      
                      {/* Admin Gig Work Dropdown */}
                      <div className="relative group">
                        <button className="px-3 py-2 text-sm font-medium text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-150 flex items-center gap-1">
                          Gig Work
                          <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div className="absolute left-0 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 animate-fadeInDown overflow-hidden">
                          <Link to="/admin/users" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150 first:rounded-t-xl">
                            Users
                          </Link>
                          <Link to="/admin/shifts" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150">
                            Shifts
                          </Link>
                          <Link to="/admin/verifications" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150">
                            Verifications
                          </Link>
                          <Link to="/admin/support" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150 last:rounded-b-xl">
                            Support
                          </Link>
                        </div>
                      </div>
                      
                      {/* Admin Marketplace Dropdown */}
                      <div className="relative group">
                        <button className="px-3 py-2 text-sm font-medium text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-150 flex items-center gap-1">
                          Marketplace
                          <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div className="absolute left-0 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 animate-fadeInDown overflow-hidden">
                          <Link to="/admin/marketplace-users" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150 first:rounded-t-xl">
                            Suppliers & Buyers
                          </Link>
                          <Link to="/admin/listings" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150">
                            All Listings
                          </Link>
                          <Link to="/admin/supplier-verification" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150">
                            Supplier Verification
                          </Link>
                          <Link to="/admin/price-moderation" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150">
                            Price Moderation
                          </Link>
                          <div className="border-t border-neutral-200 my-1"></div>
                          <Link to="/buyers/search" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150 last:rounded-b-xl">
                            Browse as Buyer
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Messages - Available to All Non-Admin */}
                  {user.role !== 'admin' && (
                    <Link 
                      to="/messages" 
                      className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        location.pathname === '/messages' 
                          ? 'text-primary-700 bg-primary-50' 
                          : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
                      }`}
                    >
                      Messages
                      {unreadMessageCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium text-white bg-red-500 rounded-full">
                          {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                        </span>
                      )}
                    </Link>
                  )}
                </nav>
                
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200"
                  aria-label="Toggle menu"
                >
                  {showMobileMenu ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {isAuthenticated && user ? (
              <>
                {/* Search Button - Desktop - Only for marketplace users */}
                {user.role !== 'admin' && showMarketplace && (
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200"
                    title="Search (Cmd+K)"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="hidden lg:inline">Search</span>
                  </button>
                )}

                {/* Messages Icon - Mobile */}
                {user.role !== 'admin' && (
                  <Link
                    to="/messages"
                    className="md:hidden relative p-2 text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    {unreadMessageCount > 0 && (
                      <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                        {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                      </span>
                    )}
                  </Link>
                )}

                <DarkModeToggle />

                <PlatformSwitcher />

                <NotificationDropdown />
                
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-neutral-50 rounded-lg transition-all duration-200"
                  >
                    <Avatar 
                      name={user.name} 
                      src={user.avatar_url}
                      size="sm"
                    />
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                      <p className="text-xs text-neutral-500 capitalize">{user.role}</p>
                    </div>
                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl animate-fadeInDown overflow-hidden">
                      <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200">
                        <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
                        <p className="text-xs text-neutral-600 capitalize">{user.role}</p>
                      </div>
                      <Link
                        to={
                          // Route based on platform preference
                          user.platform_preference === 'marketplace' 
                            ? '/marketplace/profile'
                            : user.role === 'worker' 
                              ? '/employee/profile' 
                              : `/${user.role}/profile`
                        }
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile Settings
                      </Link>
                      
                      {/* Gig Work Links - Only show for gigwork or both platform */}
                      {showGigWork && (
                        <>
                          {user.role === 'worker' ? (
                            <>
                              <Link
                                to="/employee/time-tracking"
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Time Tracking
                              </Link>
                              <Link
                                to="/employee/verification"
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                ID Verification
                              </Link>
                              <Link
                                to="/employee/invoices"
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Invoices
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link
                                to="/employer/favorites"
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                Favorite Workers
                              </Link>
                              <Link
                                to="/employer/time-approval"
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Time Approval
                              </Link>
                              <Link
                                to="/employer/invoices"
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Invoices
                              </Link>
                            </>
                          )}
                          <div className="border-t border-neutral-200 my-1"></div>
                        </>
                      )}
                      
                      {/* Marketplace Links - Only show for marketplace or both platform */}
                      {showMarketplace && (
                        <>
                          <Link
                            to="/suppliers/listings"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            My Listings
                          </Link>
                          <Link
                            to="/buyers/quotes"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            My Quotes
                          </Link>
                          <Link
                            to="/materials/my-submissions"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Price Submissions
                          </Link>
                          <div className="border-t border-neutral-200 my-1"></div>
                        </>
                      )}
                      
                      {/* Help Center - Available to all */}
                      <Link
                        to="/help"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-150"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Help Center
                      </Link>
                      
                      <div className="border-t border-neutral-200 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 rounded-b-xl"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Language Switcher - Always visible on mobile and desktop */}
                <div className="flex-shrink-0">
                  <LanguageSwitcher />
                </div>
                <Link to="/login" className="hidden xs:block flex-shrink-0">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register" className="flex-shrink-0">
                  <Button size="sm" className="text-xs sm:text-sm px-3 sm:px-4">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
        
        {/* Search Bar Overlay */}
        {showSearch && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-neutral-200 shadow-lg animate-fadeInDown">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search listings, materials, jobs..."
                  className="w-full px-4 py-3 pl-12 pr-12 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  autoFocus
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </form>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-neutral-500">Popular:</span>
                <button onClick={() => { setSearchQuery('cement'); handleSearch(new Event('submit') as any); }} className="text-xs px-2 py-1 bg-neutral-100 hover:bg-primary-50 hover:text-primary-700 rounded-full transition-colors">Cement</button>
                <button onClick={() => { setSearchQuery('steel'); handleSearch(new Event('submit') as any); }} className="text-xs px-2 py-1 bg-neutral-100 hover:bg-primary-50 hover:text-primary-700 rounded-full transition-colors">Steel</button>
                <button onClick={() => { setSearchQuery('rice'); handleSearch(new Event('submit') as any); }} className="text-xs px-2 py-1 bg-neutral-100 hover:bg-primary-50 hover:text-primary-700 rounded-full transition-colors">Rice</button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {showMobileMenu && isAuthenticated && user && (
          <div ref={mobileMenuRef} className="md:hidden border-t border-neutral-200 py-2 bg-white animate-fadeInDown">
            {user.role === 'admin' ? (
              <>
                <Link to="/admin/dashboard" className="block px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors" onClick={() => setShowMobileMenu(false)}>
                  Dashboard
                </Link>
                <div className="px-4 py-2 text-xs font-bold text-neutral-500 uppercase tracking-wider bg-neutral-50">Gig Work</div>
                <Link to="/admin/users" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 pl-8 transition-colors" onClick={() => setShowMobileMenu(false)}>
                  Users
                </Link>
                <Link to="/admin/shifts" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 pl-8" onClick={() => setShowMobileMenu(false)}>
                  Shifts
                </Link>
                <Link to="/admin/verifications" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 pl-8" onClick={() => setShowMobileMenu(false)}>
                  Verifications
                </Link>
                <Link to="/admin/support" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 pl-8" onClick={() => setShowMobileMenu(false)}>
                  Support
                </Link>
                <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase">Marketplace</div>
                <Link to="/admin/marketplace-users" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 pl-8" onClick={() => setShowMobileMenu(false)}>
                  Suppliers & Buyers
                </Link>
                <Link to="/admin/listings" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 pl-8" onClick={() => setShowMobileMenu(false)}>
                  All Listings
                </Link>
                <Link to="/admin/supplier-verification" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 pl-8" onClick={() => setShowMobileMenu(false)}>
                  Supplier Verification
                </Link>
                <Link to="/admin/price-moderation" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 pl-8" onClick={() => setShowMobileMenu(false)}>
                  Price Moderation
                </Link>
                <Link to="/buyers/search" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 pl-8" onClick={() => setShowMobileMenu(false)}>
                  Browse as Buyer
                </Link>
              </>
            ) : (
              <>
                <Link to="/home" className="block px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors" onClick={() => setShowMobileMenu(false)}>Home</Link>
                
                {/* Gig Work Section - Only show if user selected gigwork or both */}
                {showGigWork && (
                  <>
                    <div className="border-t border-neutral-200 my-2"></div>
                    <div className="px-4 py-2 text-xs font-bold text-neutral-500 uppercase tracking-wider bg-neutral-50">Gig Work</div>
                    {user.role === 'employer' ? (
                      <>
                        <Link to="/employer/dashboard" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors" onClick={() => setShowMobileMenu(false)}>Dashboard</Link>
                        <Link to="/employer/shifts" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50" onClick={() => setShowMobileMenu(false)}>Shifts</Link>
                        <Link to="/employer/applications" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50" onClick={() => setShowMobileMenu(false)}>Applications</Link>
                        <Link to="/employer/ratings" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50" onClick={() => setShowMobileMenu(false)}>Ratings</Link>
                        <Link to="/employer/favorites" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50" onClick={() => setShowMobileMenu(false)}>Favorites</Link>
                        <Link to="/employer/time-approval" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50" onClick={() => setShowMobileMenu(false)}>Time</Link>
                        <Link to="/employer/invoices" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50" onClick={() => setShowMobileMenu(false)}>Invoices</Link>
                      </>
                    ) : (
                      <>
                        <Link to="/employee/dashboard" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors" onClick={() => setShowMobileMenu(false)}>Dashboard</Link>
                        <Link to="/employee/jobs" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50" onClick={() => setShowMobileMenu(false)}>Find Shifts</Link>
                        <Link to="/employee/schedule" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50" onClick={() => setShowMobileMenu(false)}>Schedule</Link>
                        <Link to="/employee/time-tracking" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50" onClick={() => setShowMobileMenu(false)}>Time Tracking</Link>
                        <Link to="/employee/reputation" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50" onClick={() => setShowMobileMenu(false)}>Reputation</Link>
                        <Link to="/employee/contracts" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50" onClick={() => setShowMobileMenu(false)}>Contracts</Link>
                        <Link to="/employee/favorites" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50" onClick={() => setShowMobileMenu(false)}>Favorites</Link>
                      </>
                    )}
                  </>
                )}
                
                {/* Marketplace Section - Only show if user selected marketplace or both */}
                {showMarketplace && (
                  <>
                    <div className="border-t border-neutral-200 my-2"></div>
                    <div className="px-4 py-2 text-xs font-bold text-neutral-500 uppercase tracking-wider bg-neutral-50">Marketplace</div>
                    <Link to="/buyers/search" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors" onClick={() => setShowMobileMenu(false)}>Browse Listings</Link>
                    <Link to="/marketplace/categories" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50" onClick={() => setShowMobileMenu(false)}>All Categories</Link>
                    <Link to="/materials/trends" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50" onClick={() => setShowMobileMenu(false)}>Price Trends</Link>
                    <Link to="/suppliers/listings" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50" onClick={() => setShowMobileMenu(false)}>My Listings</Link>
                    <Link to="/suppliers/create" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50" onClick={() => setShowMobileMenu(false)}>Create Listing</Link>
                    <Link to="/buyers/quotes" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50" onClick={() => setShowMobileMenu(false)}>My Quotes</Link>
                  </>
                )}
                
                {/* Common Links */}
                <div className="border-t border-neutral-200 my-2"></div>
                <Link to="/messages" className="relative block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50" onClick={() => setShowMobileMenu(false)}>
                  Messages
                  {unreadMessageCount > 0 && (
                    <span className="absolute top-2 right-4 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium text-white bg-red-500 rounded-full">
                      {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                    </span>
                  )}
                </Link>
                <Link to="/help" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50" onClick={() => setShowMobileMenu(false)}>Help Center</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
