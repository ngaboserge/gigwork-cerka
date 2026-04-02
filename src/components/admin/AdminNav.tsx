import { useNavigate, useLocation } from 'react-router-dom';
import { 
  TrendingUp,
  Users, 
  Calendar, 
  CheckCircle, 
  Package, 
  DollarSign,
  Box,
  FileText,
  Eye
} from '@/lib/icons';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

interface AdminNavProps {
  pendingCounts?: {
    support?: number;
    verifications?: number;
    priceSubmissions?: number;
    supplierVerifications?: number;
  };
}

export function AdminNav({ pendingCounts = {} }: AdminNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const gigWorkNav: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      label: 'Users',
      path: '/admin/users',
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'Shifts',
      path: '/admin/shifts',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      label: 'Verifications',
      path: '/admin/verifications',
      icon: <CheckCircle className="w-5 h-5" />,
      badge: pendingCounts.verifications
    },
    {
      label: 'Support',
      path: '/admin/support',
      icon: <Eye className="w-5 h-5" />,
      badge: pendingCounts.support
    }
  ];

  const marketplaceNav: NavItem[] = [
    {
      label: 'Listings',
      path: '/admin/listings',
      icon: <Package className="w-5 h-5" />
    },
    {
      label: 'Materials',
      path: '/admin/materials',
      icon: <Box className="w-5 h-5" />
    },
    {
      label: 'Quote Requests',
      path: '/admin/quotes',
      icon: <FileText className="w-5 h-5" />
    },
    {
      label: 'Price Moderation',
      path: '/admin/price-moderation',
      icon: <DollarSign className="w-5 h-5" />,
      badge: pendingCounts.priceSubmissions
    },
    {
      label: 'Supplier Verification',
      path: '/admin/supplier-verification',
      icon: <CheckCircle className="w-5 h-5" />,
      badge: pendingCounts.supplierVerifications
    },
    {
      label: 'Intelligence',
      path: '/admin/intelligence',
      icon: <TrendingUp className="w-5 h-5" />
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-8 overflow-x-auto py-4">
          {/* Gig Work Section */}
          <div className="flex items-center gap-2 min-w-fit">
            <span className="text-xs font-semibold text-gray-500 uppercase">Gig Work</span>
          </div>
          {gigWorkNav.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition min-w-fit ${
                isActive(item.path)
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          {/* Divider */}
          <div className="h-8 w-px bg-gray-300"></div>

          {/* Marketplace Section */}
          <div className="flex items-center gap-2 min-w-fit">
            <span className="text-xs font-semibold text-gray-500 uppercase">Marketplace</span>
          </div>
          {marketplaceNav.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition min-w-fit ${
                isActive(item.path)
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
