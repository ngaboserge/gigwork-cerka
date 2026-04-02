import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuppliersStore, useAuthStore } from '../../store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency } from '../../lib/currency';
import { Plus, Edit, Trash2, Eye, TrendingUp } from '../../lib/icons';

export default function MyListings() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { listings, loading, fetchSupplierListings, deleteListing } = useSuppliersStore();
  
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSupplierListings(user.id);
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await deleteListing(id);
      setDeleteModal(null);
    } catch (error) {
      console.error('Failed to delete listing:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="warning">Inactive</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

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
      {/* Back to Home Button */}
      <button 
        onClick={() => navigate('/home')} 
        className="mb-4 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-600 mt-1">Manage your material supplier listings</p>
        </div>
        <Button onClick={() => navigate('/suppliers/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Listing
        </Button>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description="Create your first listing to start selling materials"
          action={
            <Button onClick={() => navigate('/suppliers/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Listing
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {listings.map(listing => (
            <Card key={listing.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {listing.material?.name}
                    </h3>
                    {getStatusBadge(listing.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(listing.price)}
                      </p>
                      <p className="text-xs text-gray-500">per {listing.material?.unit}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900">{listing.location}</p>
                      {listing.area && (
                        <p className="text-xs text-gray-500">{listing.area}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Min. Quantity</p>
                      <p className="text-sm font-medium text-gray-900">
                        {listing.min_quantity || 'None'} {listing.min_quantity ? listing.material?.unit : ''}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Photos</p>
                      <p className="text-sm font-medium text-gray-900">
                        {listing.photos && listing.photos.length > 0 ? `${listing.photos.length} photo(s)` : 'No photos'}
                      </p>
                    </div>
                  </div>

                  {/* Photo thumbnails */}
                  {listing.photos && listing.photos.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Photos:</p>
                      <div className="flex gap-2 flex-wrap">
                        {listing.photos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`${listing.material?.name} ${index + 1}`}
                            className="w-20 h-20 object-cover rounded border border-gray-300"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {listing.delivery_info && (
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">{listing.delivery_info}</p>
                    </div>
                  )}
                </div>

                <div className="ml-6 flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/suppliers/analytics/${listing.id}`)}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Analytics
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/suppliers/edit/${listing.id}`)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteModal(listing.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteModal(null)}
          title="Delete Listing"
        >
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this listing? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteModal(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDelete(deleteModal)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
