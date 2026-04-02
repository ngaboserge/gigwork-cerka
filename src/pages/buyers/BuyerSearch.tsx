import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, PageContainer } from '@/components/layout';
import { 
  Card, Button, Input, Badge, EmptyState, Skeleton, ImageLightbox
} from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { useSuppliersStore, useMaterialsStore, useAuthStore } from '@/store';
import { formatCurrency } from '@/lib/currency';
import { Search, MapPin, Star, CheckCircle, MessageCircle, ArrowLeft, Filter } from '@/lib/icons';
import type { SearchFilters } from '@/types/materials.types';

type SortOption = 'price_asc' | 'price_desc' | 'rating' | 'recent';

export default function BuyerSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { searchResults, loading, searchListings } = useSuppliersStore();
  const { materials, fetchMaterials } = useMaterialsStore();

  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedImages, setSelectedImages] = useState<{ images: string[], alt: string } | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    material_id: location.state?.materialId || '',
    location: '',
    min_price: undefined,
    max_price: undefined,
    min_rating: undefined,
    verified_only: false
  });

  useEffect(() => {
    fetchMaterials();
    handleSearch();
  }, []);

  const handleSearch = () => {
    searchListings(filters);
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      material_id: '',
      location: '',
      min_price: undefined,
      max_price: undefined,
      min_rating: undefined,
      verified_only: false
    });
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '' && v !== undefined && v !== false).length;

  const sortedResults = [...searchResults].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'rating':
        return (b.supplier?.average_rating || 0) - (a.supplier?.average_rating || 0);
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (loading && searchResults.length === 0) {
    return (
      <Layout>
        <PageContainer>
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96" />
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
            </div>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen pb-20 md:pb-0">
        <PageContainer>
          <div className="flex items-center justify-between py-4 mb-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/home')}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Find Suppliers</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <Card className="sticky top-20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-900">Filters</h2>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                      Clear
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Material</label>
                    <select
                      value={filters.material_id || ''}
                      onChange={(e) => updateFilter('material_id', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Materials</option>
                      {materials.map(material => (
                        <option key={material.id} value={material.id}>{material.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                    <Input
                      placeholder="e.g., Kigali"
                      value={filters.location || ''}
                      onChange={(e) => updateFilter('location', e.target.value)}
                      icon={<MapPin className="w-4 h-4" />}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Price Range</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.min_price || ''}
                        onChange={(e) => updateFilter('min_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.max_price || ''}
                        onChange={(e) => updateFilter('max_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Min Rating</label>
                    <select
                      value={filters.min_rating || ''}
                      onChange={(e) => updateFilter('min_rating', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Any</option>
                      <option value="4">4+</option>
                      <option value="3">3+</option>
                      <option value="2">2+</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-1">
                    <input
                      type="checkbox"
                      id="verified"
                      checked={filters.verified_only || false}
                      onChange={(e) => updateFilter('verified_only', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="verified" className="ml-2 text-xs text-gray-700">Verified only</label>
                  </div>

                  <Button onClick={handleSearch} fullWidth size="sm">
                    <Search className="w-4 h-4 mr-1" />
                    Apply
                  </Button>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Card className="mb-4 p-3">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">{sortedResults.length}</span> results
                    </p>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="px-2 py-1 border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="recent">Recent</option>
                      <option value="price_asc">Price: Low</option>
                      <option value="price_desc">Price: High</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>

                  <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
                    <Filter className="w-4 h-4 mr-1" />
                    Filters
                    {activeFilterCount > 0 && <Badge variant="info" className="ml-1 text-xs">{activeFilterCount}</Badge>}
                  </Button>
                </div>
              </Card>

              {sortedResults.length === 0 ? (
                <EmptyState
                  illustration="search"
                  title="No suppliers found"
                  description="Try adjusting your search filters or browse all categories"
                  action={{ label: 'Browse Categories', onClick: () => navigate('/marketplace/categories') }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {sortedResults.map(listing => (
                    <Card 
                      key={listing.id} 
                      className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/buyers/listing/${listing.id}`)}
                    >
                      {listing.photos?.[0] && (
                        <img 
                          src={listing.photos[0]} 
                          alt={listing.supplier?.business_name}
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                      )}
                      
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-900 truncate">
                            {listing.supplier?.business_name || 'Supplier'}
                          </h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {listing.city || listing.location}
                          </p>
                        </div>
                        {listing.supplier?.is_verified_supplier && (
                          <Badge variant="success" className="text-xs flex items-center gap-0.5 ml-2">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-2 text-xs">
                        <span className="text-gray-600">{listing.material?.name}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-gray-700">{listing.supplier?.average_rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>

                      <div className="text-lg font-bold text-blue-600 mb-2">
                        {formatCurrency(listing.price)}
                        <span className="text-xs text-gray-500 font-normal ml-1">/ {listing.material?.unit}</span>
                      </div>

                      {user?.role !== 'admin' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (user) {
                                const params = new URLSearchParams({
                                  userId: listing.supplier_id,
                                  context: 'materials',
                                  materialName: listing.material?.name || '',
                                  price: formatCurrency(listing.price),
                                  location: listing.location
                                });
                                navigate(`/messages?${params.toString()}`);
                              } else {
                                toast('error', 'Please log in');
                              }
                            }}
                          >
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Message
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/buyers/listing/${listing.id}`);
                            }}
                          >
                            Quote
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </PageContainer>
      </div>

      {selectedImages && (
        <ImageLightbox 
          images={selectedImages.images} 
          alt={selectedImages.alt}
          onClose={() => setSelectedImages(null)}
        />
      )}
    </Layout>
  );
}
