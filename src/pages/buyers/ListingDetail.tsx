import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSuppliersStore, useMarketplaceStore, useAuthStore } from '../../store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { ImageGallery } from '../../components/ui/ImageGallery';
import { AnimatedCard } from '../../components/ui/AnimatedCard';
import { toast } from '../../components/ui/Toast';
import { HeaderSimplified } from '../../components/layout/HeaderSimplified';
import { Footer } from '../../components/layout/Footer';
import { formatCurrency } from '../../lib/currency';
import { 
  ArrowLeft, Star, CheckCircle, MapPin, Package, Truck, 
  MessageCircle, Heart, Send, Share2, Clock, TrendingUp
} from '../../lib/icons';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedListing, loading, fetchListing, recordView } = useSuppliersStore();
  const { createQuoteRequest, addFavorite, removeFavorite } = useMarketplaceStore();

  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quantity, setQuantity] = useState<number>(0);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'delivery' | 'supplier'>('details');

  useEffect(() => {
    if (id) {
      fetchListing(id);
      recordView(id);
    }
  }, [id]);

  const handleQuoteRequest = async () => {
    if (!user || !selectedListing) {
      toast('error', 'Please log in to request quotes');
      return;
    }

    if (!quantity || !deliveryLocation) {
      toast('error', 'Please fill in all required fields');
      return;
    }

    try {
      await createQuoteRequest({
        buyer_id: user.id,
        supplier_id: selectedListing.supplier_id,
        listing_id: selectedListing.id,
        quantity,
        delivery_location: deliveryLocation,
        notes
      });

      toast('success', 'Quote request sent successfully!');
      setShowQuoteModal(false);
      setQuantity(0);
      setDeliveryLocation('');
      setNotes('');
    } catch (error: any) {
      toast('error', error.message || 'Failed to send quote request');
    }
  };

  const toggleFavorite = async () => {
    if (!user || !selectedListing) return;

    try {
      if (isFavorite) {
        await removeFavorite(user.id, selectedListing.supplier_id);
        setIsFavorite(false);
        toast('success', 'Removed from favorites');
      } else {
        await addFavorite(user.id, selectedListing.supplier_id);
        setIsFavorite(true);
        toast('success', 'Added to favorites');
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedListing?.material?.name || 'Material Listing',
        text: `Check out this ${selectedListing?.material?.name} listing`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast('success', 'Link copied to clipboard!');
    }
  };

  if (loading || !selectedListing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <HeaderSimplified />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate('/materials/trends')} className="hover:text-primary-600 transition">
            Marketplace
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{selectedListing.material?.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            {selectedListing.photos && selectedListing.photos.length > 0 && (
              <ImageGallery 
                images={selectedListing.photos} 
                alt={selectedListing.material?.name || 'Material'} 
              />
            )}

            {/* Material Header */}
            <AnimatedCard animation="fadeInUp" className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedListing.material?.name}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="primary">{selectedListing.material?.category}</Badge>
                    {selectedListing.supplier?.is_verified_supplier && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified Supplier
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{selectedListing.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFavorite}
                    className={isFavorite ? 'text-red-500' : 'text-gray-400'}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </AnimatedCard>

            {/* Tabs */}
            <AnimatedCard animation="fadeInUp" className="p-6">
              <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-6">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                      activeTab === 'details'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('delivery')}
                    className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                      activeTab === 'delivery'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Delivery
                  </button>
                  <button
                    onClick={() => setActiveTab('supplier')}
                    className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                      activeTab === 'supplier'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Supplier
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Package className="w-5 h-5 text-primary-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Unit</p>
                        <p className="text-lg text-gray-700">{selectedListing.material?.unit}</p>
                      </div>
                    </div>
                    {selectedListing.min_quantity && (
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-primary-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Minimum Order</p>
                          <p className="text-lg text-gray-700">
                            {selectedListing.min_quantity} {selectedListing.material?.unit}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Clock className="w-5 h-5 text-primary-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Listed</p>
                        <p className="text-lg text-gray-700">
                          {new Date(selectedListing.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'delivery' && (
                <div className="space-y-4">
                  {selectedListing.delivery_info ? (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                      <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Delivery Information</p>
                        <p className="text-gray-700">{selectedListing.delivery_info}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Truck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Contact supplier for delivery details</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'supplier' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {selectedListing.supplier?.business_name?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {selectedListing.supplier?.business_name || 'Supplier'}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">
                            {selectedListing.supplier?.average_rating?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                        {selectedListing.supplier?.is_verified_supplier && (
                          <Badge variant="success" className="flex items-center gap-1 text-xs">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedListing.location}</span>
                        {selectedListing.area && <span>• {selectedListing.area}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </AnimatedCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card - Sticky */}
            <AnimatedCard animation="fadeInUp" className="p-6 sticky top-4">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Price per {selectedListing.material?.unit}</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  {formatCurrency(selectedListing.price)}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <Button
                  className="w-full shadow-lg hover:shadow-xl transition-shadow"
                  onClick={() => setShowQuoteModal(true)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Request Quote
                </Button>

                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    if (!user) {
                      toast('error', 'Please log in to message sellers');
                      return;
                    }
                    const params = new URLSearchParams({
                      userId: selectedListing.supplier_id,
                      context: 'materials',
                      materialName: selectedListing.material?.name || '',
                      price: formatCurrency(selectedListing.price),
                      location: selectedListing.location
                    });
                    navigate(`/messages?${params.toString()}`);
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Seller
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Secure transactions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span>Delivery available</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MessageCircle className="w-4 h-4 text-purple-500" />
                  <span>Direct communication</span>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>

      {/* Quote Request Modal */}
      {showQuoteModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowQuoteModal(false)}
          title="Request Quote"
        >
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <Input
                  type="number"
                  placeholder={`Enter quantity in ${selectedListing.material?.unit}`}
                  value={quantity || ''}
                  onChange={(e) => setQuantity(parseFloat(e.target.value))}
                  icon={<Package className="w-4 h-4" />}
                />
                {selectedListing.min_quantity && (
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum: {selectedListing.min_quantity} {selectedListing.material?.unit}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Location *
                </label>
                <Input
                  placeholder="Enter delivery address"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <Textarea
                  placeholder="Any special requirements or questions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="p-4 bg-blue-50 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Estimated Total:</strong> {formatCurrency(selectedListing.price * (quantity || 0))}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowQuoteModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleQuoteRequest}>
                Send Request
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
    
    <Footer />
    </div>
  );
}
