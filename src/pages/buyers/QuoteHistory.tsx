import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarketplaceStore, useAuthStore } from '../../store';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../lib/currency';
import { useState } from 'react';

export default function QuoteHistory() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { quoteRequests, loading, fetchBuyerRequests } = useMarketplaceStore();
  
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchBuyerRequests(user.id);
    }
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'responded':
        return <Badge variant="info">Responded</Badge>;
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'declined':
        return <Badge variant="neutral">Declined</Badge>;
      case 'cancelled':
        return <Badge variant="neutral">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const filteredRequests = statusFilter
    ? quoteRequests.filter(r => r.status === statusFilter)
    : quoteRequests;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quote Requests</h1>
        <p className="text-gray-600 mt-1">Track your quote requests and responses</p>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="responded">Responded</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {filteredRequests.length === 0 ? (
        <EmptyState
          title="No quote requests"
          description={statusFilter ? "No requests with this status" : "You haven't requested any quotes yet"}
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(request => (
            <div
              key={request.id}
              className="cursor-pointer"
              onClick={() => navigate(`/buyers/listing/${request.listing_id}`)}
            >
              <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.listing?.material?.name}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Quantity</p>
                          <p className="text-sm font-medium text-gray-900">
                            {request.quantity} {request.listing?.material?.unit}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Delivery Location</p>
                          <p className="text-sm font-medium text-gray-900">
                            {request.delivery_location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Requested</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-500">Supplier</p>
                      <p className="text-sm font-medium text-gray-900">
                        {request.supplier?.business_name || request.supplier?.full_name}
                      </p>
                    </div>

                    {request.notes && (
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">{request.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(request.listing?.price || 0)}
                    </p>
                    <p className="text-sm text-gray-500">per {request.listing?.material?.unit}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Est. Total: {formatCurrency((request.listing?.price || 0) * request.quantity)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
