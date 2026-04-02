import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { supabaseUntyped as supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/currency';
import { Search, Eye, Trash2, CheckCircle, X } from '@/lib/icons';

interface Listing {
  id: string;
  material_id: string;
  supplier_id: string;
  price: number;
  min_quantity: number;
  location: string;
  city: string;
  area: string;
  status: string;
  created_at: string;
  material: {
    name: string;
    category: string;
    sector: string;
    unit: string;
  };
  supplier: {
    business_name: string;
    is_verified_supplier: boolean;
  };
}

export default function MarketplaceListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [searchQuery, statusFilter, listings]);

  const loadListings = async () => {
    try {
      const { data, error } = await supabase
        .from('supplier_listings')
        .select(`
          *,
          material:materials(*),
          supplier:profiles!supplier_listings_supplier_id_fkey(business_name, is_verified_supplier)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error loading listings:', error);
      toast('error', 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const filterListings = () => {
    let filtered = [...listings];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(l => l.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(l =>
        l.material?.name.toLowerCase().includes(query) ||
        l.supplier?.business_name?.toLowerCase().includes(query) ||
        l.location.toLowerCase().includes(query) ||
        l.city?.toLowerCase().includes(query)
      );
    }

    setFilteredListings(filtered);
  };

  const updateListingStatus = async (listingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('supplier_listings')
        .update({ status: newStatus })
        .eq('id', listingId);

      if (error) throw error;

      toast('success', `Listing ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      loadListings();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error updating listing:', error);
      toast('error', 'Failed to update listing');
    }
  };

  const deleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      const { error } = await supabase
        .from('supplier_listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      toast('success', 'Listing deleted');
      loadListings();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast('error', 'Failed to delete listing');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge>Inactive</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Marketplace Listings</h1>
          <p className="text-gray-600 mt-2">Manage all supplier listings</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by material, supplier, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Listings</p>
            <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {listings.filter(l => l.status === 'active').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Inactive</p>
            <p className="text-2xl font-bold text-gray-600">
              {listings.filter(l => l.status === 'inactive').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {listings.filter(l => l.status === 'pending').length}
            </p>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{listing.material?.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{listing.material?.category}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{listing.supplier?.business_name}</span>
                        {listing.supplier?.is_verified_supplier && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{formatCurrency(listing.price)}</p>
                      <p className="text-sm text-gray-500">per {listing.material?.unit}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{listing.city}</p>
                      {listing.area && <p className="text-xs text-gray-500">{listing.area}</p>}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(listing.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedListing(listing);
                          setShowDetailModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No listings found</p>
            </div>
          )}
        </Card>

        {showDetailModal && selectedListing && (
          <Modal
            isOpen={true}
            onClose={() => setShowDetailModal(false)}
            title="Listing Details"
          >
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Material</label>
                <p className="text-lg font-semibold">{selectedListing.material?.name}</p>
                <p className="text-sm text-gray-600 capitalize">
                  {selectedListing.material?.sector} / {selectedListing.material?.category}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Supplier</label>
                <div className="flex items-center gap-2">
                  <p className="text-gray-900">{selectedListing.supplier?.business_name}</p>
                  {selectedListing.supplier?.is_verified_supplier && (
                    <Badge variant="success">Verified</Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Price</label>
                  <p className="text-xl font-bold text-primary-600">
                    {formatCurrency(selectedListing.price)}
                    <span className="text-sm font-normal text-gray-600"> / {selectedListing.material?.unit}</span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Min. Quantity</label>
                  <p className="text-gray-900">{selectedListing.min_quantity} {selectedListing.material?.unit}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Location</label>
                <p className="text-gray-900">{selectedListing.city}</p>
                {selectedListing.area && <p className="text-sm text-gray-600">{selectedListing.area}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">{getStatusBadge(selectedListing.status)}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Created</label>
                <p className="text-gray-900">
                  {new Date(selectedListing.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                {selectedListing.status === 'active' ? (
                  <Button
                    variant="secondary"
                    onClick={() => updateListingStatus(selectedListing.id, 'inactive')}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    onClick={() => updateListingStatus(selectedListing.id, 'active')}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Activate
                  </Button>
                )}
                <Button
                  variant="danger"
                  onClick={() => deleteListing(selectedListing.id)}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
}
