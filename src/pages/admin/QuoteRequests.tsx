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
import { Search, Eye, MessageSquare } from '@/lib/icons';

interface QuoteRequest {
  id: string;
  buyer_id: string;
  listing_id: string;
  quantity: number;
  message: string;
  status: string;
  created_at: string;
  buyer: {
    full_name: string;
    business_name: string;
  };
  listing: {
    price: number;
    material: {
      name: string;
      unit: string;
    };
    supplier: {
      business_name: string;
    };
  };
}

export default function QuoteRequests() {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchQuery, statusFilter, requests]);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select(`
          *,
          buyer:profiles!quote_requests_buyer_id_fkey(full_name, business_name),
          listing:supplier_listings(
            price,
            material:materials(name, unit),
            supplier:profiles!supplier_listings_supplier_id_fkey(business_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading quote requests:', error);
      toast('error', 'Failed to load quote requests');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.buyer?.full_name?.toLowerCase().includes(query) ||
        r.buyer?.business_name?.toLowerCase().includes(query) ||
        r.listing?.material?.name?.toLowerCase().includes(query) ||
        r.listing?.supplier?.business_name?.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'quoted':
        return <Badge>Quoted</Badge>;
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
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
          <h1 className="text-3xl font-bold text-gray-900">Quote Requests</h1>
          <p className="text-gray-600 mt-2">Monitor buyer quote requests</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by buyer, material, or supplier..."
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
              <option value="pending">Pending</option>
              <option value="quoted">Quoted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'pending').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Quoted</p>
            <p className="text-2xl font-bold text-blue-600">
              {requests.filter(r => r.status === 'quoted').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Accepted</p>
            <p className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'accepted').length}
            </p>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{request.buyer?.full_name}</p>
                        {request.buyer?.business_name && (
                          <p className="text-sm text-gray-500">{request.buyer.business_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{request.listing?.material?.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{request.listing?.supplier?.business_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {request.quantity} {request.listing?.material?.unit}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(request.listing?.price * request.quantity)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedRequest(request);
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

          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No quote requests found</p>
            </div>
          )}
        </Card>

        {showDetailModal && selectedRequest && (
          <Modal
            isOpen={true}
            onClose={() => setShowDetailModal(false)}
            title="Quote Request Details"
          >
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Buyer</label>
                <p className="text-lg font-semibold">{selectedRequest.buyer?.full_name}</p>
                {selectedRequest.buyer?.business_name && (
                  <p className="text-sm text-gray-600">{selectedRequest.buyer.business_name}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Material</label>
                <p className="text-gray-900">{selectedRequest.listing?.material?.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Supplier</label>
                <p className="text-gray-900">{selectedRequest.listing?.supplier?.business_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Quantity</label>
                  <p className="text-gray-900">
                    {selectedRequest.quantity} {selectedRequest.listing?.material?.unit}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Unit Price</label>
                  <p className="text-gray-900">{formatCurrency(selectedRequest.listing?.price)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Estimated Total</label>
                <p className="text-xl font-bold text-primary-600">
                  {formatCurrency(selectedRequest.listing?.price * selectedRequest.quantity)}
                </p>
              </div>

              {selectedRequest.message && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{selectedRequest.message}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Requested</label>
                <p className="text-gray-900">
                  {new Date(selectedRequest.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
}
