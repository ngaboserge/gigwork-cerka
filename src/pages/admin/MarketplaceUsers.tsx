import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { supabaseUntyped as supabase } from '@/lib/supabase';
import { Search, CheckCircle, X } from '@/lib/icons';

interface MarketplaceUser {
  id: string;
  email: string;
  business_name: string;
  phone: string;
  is_verified_supplier: boolean;
  supplier_verification_status: string;
  created_at: string;
  listing_count?: number;
  quote_count?: number;
}

export default function MarketplaceUsers() {
  const [users, setUsers] = useState<MarketplaceUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Get all profiles with marketplace activity
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get listing counts for each user
      const { data: listingCounts } = await supabase
        .from('supplier_listings')
        .select('supplier_id');

      // Get quote request counts for each user
      const { data: quoteCounts } = await supabase
        .from('quote_requests')
        .select('buyer_id');

      const usersWithCounts = (profiles || []).map(profile => {
        const listingCount = listingCounts?.filter(l => l.supplier_id === profile.id).length || 0;
        const quoteCount = quoteCounts?.filter(q => q.buyer_id === profile.id).length || 0;
        
        return {
          ...profile,
          listing_count: listingCount,
          quote_count: quoteCount
        };
      });

      // Filter to only show users with marketplace activity
      const marketplaceUsers = usersWithCounts.filter(u => 
        u.listing_count > 0 || u.quote_count > 0 || u.is_verified_supplier
      );

      setUsers(marketplaceUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSupplierVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_verified_supplier: !currentStatus,
          supplier_verification_status: !currentStatus ? 'approved' : 'pending'
        })
        .eq('id', userId);

      if (error) throw error;
      loadUsers();
    } catch (error) {
      console.error('Error updating verification:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterType === 'suppliers') {
      matchesFilter = (user.listing_count || 0) > 0;
    } else if (filterType === 'buyers') {
      matchesFilter = (user.quote_count || 0) > 0;
    } else if (filterType === 'verified') {
      matchesFilter = user.is_verified_supplier === true;
    }
    
    return matchesSearch && matchesFilter;
  });

  const supplierCount = users.filter(u => (u.listing_count || 0) > 0).length;
  const buyerCount = users.filter(u => (u.quote_count || 0) > 0).length;
  const verifiedCount = users.filter(u => u.is_verified_supplier).length;

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Marketplace Users</h1>
          <p className="text-gray-600 mt-2">Manage suppliers and buyers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Total Users</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{users.length}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Suppliers</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{supplierCount}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Buyers</div>
            <div className="text-3xl font-bold text-purple-600 mt-2">{buyerCount}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Verified Suppliers</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{verifiedCount}</div>
          </Card>
        </div>

        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by email or business name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Users</option>
              <option value="suppliers">Suppliers Only</option>
              <option value="buyers">Buyers Only</option>
              <option value="verified">Verified Only</option>
            </select>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quotes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-800 font-medium">
                            {user.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{user.business_name || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{user.phone || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.listing_count || 0} listings
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {user.quote_count || 0} quotes
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_verified_supplier ? (
                        <Badge variant="success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge>Unverified</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant={user.is_verified_supplier ? 'secondary' : 'success'}
                        onClick={() => toggleSupplierVerification(user.id, user.is_verified_supplier)}
                      >
                        {user.is_verified_supplier ? (
                          <>
                            <X className="w-4 h-4 mr-1" />
                            Unverify
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Verify
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
