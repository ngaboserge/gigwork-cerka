import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { supabaseUntyped as supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/currency';
import { AdminNav } from '@/components/admin/AdminNav';

interface PlatformStats {
  totalUsers: number;
  totalWorkers: number;
  totalEmployers: number;
  totalShifts: number;
  activeShifts: number;
  completedShifts: number;
  totalRevenue: number;
  pendingIssues: number;
  newUsersToday: number;
  activeDeployments: number;
  // Marketplace stats
  totalListings: number;
  activeListings: number;
  totalSuppliers: number;
  verifiedSuppliers: number;
  pendingVerifications: number;
  totalQuoteRequests: number;
  pendingPriceSubmissions: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalWorkers: 0,
    totalEmployers: 0,
    totalShifts: 0,
    activeShifts: 0,
    completedShifts: 0,
    totalRevenue: 0,
    pendingIssues: 0,
    newUsersToday: 0,
    activeDeployments: 0,
    // Marketplace stats
    totalListings: 0,
    activeListings: 0,
    totalSuppliers: 0,
    verifiedSuppliers: 0,
    pendingVerifications: 0,
    totalQuoteRequests: 0,
    pendingPriceSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get user counts
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalWorkers } = await supabase
        .from('worker_profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalEmployers } = await supabase
        .from('employer_profiles')
        .select('*', { count: 'exact', head: true });

      // Get shift counts
      const { count: totalShifts } = await supabase
        .from('shifts')
        .select('*', { count: 'exact', head: true });

      const { count: activeShifts } = await supabase
        .from('shifts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: completedShifts } = await supabase
        .from('shifts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Get deployment count
      const { count: activeDeployments } = await supabase
        .from('deployments')
        .select('*', { count: 'exact', head: true })
        .in('status', ['confirmed', 'active']);

      // Get revenue (sum of paid invoices)
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('status', 'paid');

      const totalRevenue = invoices?.reduce((sum, inv) => sum + parseFloat(inv.total_amount || '0'), 0) || 0;

      // Get pending support tickets
      const { count: pendingIssues } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Get new users today
      const today = new Date().toISOString().split('T')[0];
      const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      // Get marketplace stats
      const { count: totalListings } = await supabase
        .from('supplier_listings')
        .select('*', { count: 'exact', head: true });

      const { count: activeListings } = await supabase
        .from('supplier_listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: totalSuppliers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified_supplier', true);

      const { count: verifiedSuppliers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified_supplier', true)
        .eq('supplier_verification_status', 'approved');

      const { count: pendingVerifications } = await supabase
        .from('supplier_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: totalQuoteRequests } = await supabase
        .from('quote_requests')
        .select('*', { count: 'exact', head: true });

      const { count: pendingPriceSubmissions } = await supabase
        .from('price_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalUsers: totalUsers || 0,
        totalWorkers: totalWorkers || 0,
        totalEmployers: totalEmployers || 0,
        totalShifts: totalShifts || 0,
        activeShifts: activeShifts || 0,
        completedShifts: completedShifts || 0,
        totalRevenue,
        pendingIssues: pendingIssues || 0,
        newUsersToday: newUsersToday || 0,
        activeDeployments: activeDeployments || 0,
        totalListings: totalListings || 0,
        activeListings: activeListings || 0,
        totalSuppliers: totalSuppliers || 0,
        verifiedSuppliers: verifiedSuppliers || 0,
        pendingVerifications: pendingVerifications || 0,
        totalQuoteRequests: totalQuoteRequests || 0,
        pendingPriceSubmissions: pendingPriceSubmissions || 0,
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      iconPath: 'M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      subtitle: `${stats.newUsersToday} new today`,
    },
    {
      title: 'Workers',
      value: stats.totalWorkers,
      iconPath: 'M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      subtitle: 'Active worker profiles',
    },
    {
      title: 'Employers',
      value: stats.totalEmployers,
      iconPath: 'M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      subtitle: 'Active employer profiles',
    },
    {
      title: 'Total Shifts',
      value: stats.totalShifts,
      iconPath: 'M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      subtitle: `${stats.activeShifts} active`,
    },
    {
      title: 'Active Deployments',
      value: stats.activeDeployments,
      iconPath: 'M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      subtitle: 'Confirmed workers',
    },
    {
      title: 'Platform Revenue',
      value: formatCurrency(stats.totalRevenue),
      iconPath: 'M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267zM10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      subtitle: 'From paid invoices',
    },
    {
      title: 'Completed Shifts',
      value: stats.completedShifts,
      iconPath: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      subtitle: 'Successfully finished',
    },
    {
      title: 'Pending Issues',
      value: stats.pendingIssues,
      iconPath: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      subtitle: 'Support tickets',
    },
    // Marketplace stats
    {
      title: 'Total Listings',
      value: stats.totalListings,
      iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      subtitle: `${stats.activeListings} active`,
    },
    {
      title: 'Suppliers',
      value: stats.totalSuppliers,
      iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      subtitle: `${stats.verifiedSuppliers} verified`,
    },
    {
      title: 'Quote Requests',
      value: stats.totalQuoteRequests,
      iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      subtitle: 'Buyer requests',
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingVerifications + stats.pendingPriceSubmissions,
      iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      subtitle: 'Needs moderation',
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AdminNav 
        pendingCounts={{
          support: stats.pendingIssues,
          verifications: stats.pendingVerifications,
          priceSubmissions: stats.pendingPriceSubmissions,
          supplierVerifications: stats.pendingVerifications
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Platform overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <svg className={`w-6 h-6 ${stat.color}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d={stat.iconPath} clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Gig Work Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/admin/users')}
              className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
            >
              <div className="font-medium text-blue-900">View All Users</div>
              <div className="text-sm text-blue-600">Manage user accounts</div>
            </button>
            <button 
              onClick={() => navigate('/admin/support')}
              className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
            >
              <div className="font-medium text-purple-900">Review Support Tickets</div>
              <div className="text-sm text-purple-600">{stats.pendingIssues} pending</div>
            </button>
            <button 
              onClick={() => navigate('/admin/shifts')}
              className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition"
            >
              <div className="font-medium text-green-900">Manage Shifts</div>
              <div className="text-sm text-green-600">{stats.activeShifts} active shifts</div>
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Marketplace Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/admin/listings')}
              className="w-full text-left px-4 py-3 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition"
            >
              <div className="font-medium text-cyan-900">All Listings</div>
              <div className="text-sm text-cyan-600">{stats.activeListings} active listings</div>
            </button>
            <button 
              onClick={() => navigate('/admin/supplier-verification')}
              className="w-full text-left px-4 py-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
            >
              <div className="font-medium text-amber-900">Supplier Verifications</div>
              <div className="text-sm text-amber-600">{stats.pendingVerifications} pending</div>
            </button>
            <button 
              onClick={() => navigate('/admin/price-moderation')}
              className="w-full text-left px-4 py-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition"
            >
              <div className="font-medium text-pink-900">Price Submissions</div>
              <div className="text-sm text-pink-600">{stats.pendingPriceSubmissions} pending</div>
            </button>
            <button 
              onClick={() => navigate('/admin/materials')}
              className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
            >
              <div className="font-medium text-indigo-900">Materials Catalog</div>
              <div className="text-sm text-indigo-600">Manage materials</div>
            </button>
            <button 
              onClick={() => navigate('/admin/quotes')}
              className="w-full text-left px-4 py-3 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
            >
              <div className="font-medium text-teal-900">Quote Requests</div>
              <div className="text-sm text-teal-600">{stats.totalQuoteRequests} total requests</div>
            </button>
            <button 
              onClick={() => navigate('/admin/intelligence')}
              className="w-full text-left px-4 py-3 bg-violet-50 hover:bg-violet-100 rounded-lg transition"
            >
              <div className="font-medium text-violet-900">Intelligence Monitor</div>
              <div className="text-sm text-violet-600">Signals & narratives</div>
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Platform Health</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Active Shifts</span>
                <span className="font-medium">{stats.activeShifts}/{stats.totalShifts}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${stats.totalShifts ? (stats.activeShifts / stats.totalShifts) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Worker Utilization</span>
                <span className="font-medium">{stats.activeDeployments}/{stats.totalWorkers}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${stats.totalWorkers ? (stats.activeDeployments / stats.totalWorkers) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-medium">{stats.completedShifts}/{stats.totalShifts}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-600 h-2 rounded-full" 
                  style={{ width: `${stats.totalShifts ? (stats.completedShifts / stats.totalShifts) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
    </Layout>
  );
}
