import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui';
import { useState } from 'react';

interface PlatformHeaderProps {
  platform: 'gigwork' | 'marketplace';
}

export function PlatformHeader({ platform }: PlatformHeaderProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const platformConfig = {
    gigwork: {
      name: 'Gig Work',
      color: 'blue',
      logo: '/assets/cerka-logo.png',
      navigation: [
        { name: 'Find Work', href: '/employee/jobs', role: 'worker' },
        { name: 'Post Jobs', href: '/employer/jobs', role: 'employer' },
        { name: 'Dashboard', href: user?.role === 'employer' ? '/employer/dashboard' : '/employee/dashboard' },
      ]
    },
    marketplace: {
      name: 'Materials Marketplace',
      color: 'green',
      logo: '/assets/cerka-logo.png',
      navigation: [
        { name: 'Price Index', href: '/materials/price-index' },
        { name: 'Find Suppliers', href: '/buyers/search' },
        { name: 'Submit Prices', href: '/materials/price-submit' },
        { name: 'Trends', href: '/materials/price-trends' },
      ]
    }
  };

  const config = platformConfig[platform];

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Platform Name */}
          <div className="flex items-center space-x-4">
            <Link to={`/${platform === 'gigwork' ? 'gig-work' : 'marketplace'}`} className="flex items-center space-x-3">
              <img src={config.logo} alt="Cerka" className="h-8 w-auto" />
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-neutral-900">{config.name}</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {config.navigation.map((item) => {
              // Skip role-specific items if user doesn't have the role
              if (item.role && user?.role !== item.role) return null;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${location.pathname === item.href
                      ? `bg-${config.color}-100 text-${config.color}-700`
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }
                  `}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Platform Switcher */}
            <div className="hidden sm:block">
              <Link
                to="/platform-selection"
                className="text-sm text-neutral-600 hover:text-neutral-900 px-3 py-1 rounded-md border border-neutral-300 hover:border-neutral-400 transition-colors"
              >
                Switch Platform
              </Link>
            </div>

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link to="/messages" className="text-neutral-600 hover:text-neutral-900">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                </Link>
                
                <div className="relative">
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900"
                  >
                    <div className="w-8 h-8 bg-neutral-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-neutral-700">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </button>

                  {/* User Dropdown */}
                  {showMobileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-neutral-200 py-1 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/help"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Help
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-neutral-600 hover:text-neutral-900"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-neutral-200 py-4">
            <div className="space-y-2">
              {config.navigation.map((item) => {
                // Skip role-specific items if user doesn't have the role
                if (item.role && user?.role !== item.role) return null;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-3 py-2 text-base font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
              
              <Link
                to="/platform-selection"
                className="block px-3 py-2 text-base font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md border-t border-neutral-200 mt-4 pt-4"
                onClick={() => setShowMobileMenu(false)}
              >
                Switch Platform
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}