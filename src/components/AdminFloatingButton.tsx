import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { useState } from 'react';

export function AdminFloatingButton() {
  const { user } = useAuthStore();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Only show for admin users
  if (!user || user.role !== 'admin') {
    return null;
  }
  
  // Don't show on admin pages (since header has navigation)
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Menu */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 mb-2 min-w-[200px] animate-fadeIn">
          <Link
            to="/admin/dashboard"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            onClick={() => setIsExpanded(false)}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
            Dashboard
          </Link>
          <Link
            to="/admin/users"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            onClick={() => setIsExpanded(false)}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            Users
          </Link>
          <Link
            to="/admin/shifts"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            onClick={() => setIsExpanded(false)}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Shifts
          </Link>
          <Link
            to="/admin/verifications"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            onClick={() => setIsExpanded(false)}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verifications
          </Link>
          <Link
            to="/admin/support"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            onClick={() => setIsExpanded(false)}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            Support
          </Link>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group relative w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
        title="Admin Panel"
      >
        {/* Icon */}
        <div className="text-white flex items-center justify-center">
          {isExpanded ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </div>
        
        {/* Pulse Animation */}
        <span className="absolute inset-0 rounded-full bg-purple-600 opacity-75 animate-ping"></span>
        
        {/* Tooltip */}
        {!isExpanded && (
          <div className="absolute right-full mr-3 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Admin Panel
          </div>
        )}
      </button>
    </div>
  );
}
