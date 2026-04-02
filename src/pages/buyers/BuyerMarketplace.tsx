import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuppliersStore, useMaterialsStore, useAuthStore } from '../../store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Tabs } from '../../components/ui/Tabs';
import { toast } from '../../components/ui/Toast';
import { HeaderSimplified } from '../../components/layout/HeaderSimplified';
import { Footer } from '../../components/layout/Footer';
import { formatCurrency } from '../../lib/currency';
import { Search, MapPin, Star, CheckCircle, Phone, MessageCircle, Package, TrendingUp, Filter } from '../../lib/icons';
import type { SearchFilters } from '../../types/materials.types';

export default function BuyerMarketplace() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { searchResults, loading, searchListings } = useSuppliersStore();
  const { materials, fetchMaterials } = useMaterialsStore();

  const [filters, setFilters] = useState<SearchFilters>({
    material_id: '',
    location: '',
    min_price: undefined,
    max_price: undefined,
    min_rating: undefined,
    verified_only: false
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

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
    setSelectedCategory('');
    setSearchQuery('');
  };

  // Get unique categories from materials
  const categories = Array.from(new Set(materials.map(m => m.category)));

  // Filter materials by category and search
  const filteredMaterials = materials.filter(material => {
    const matchesCategory = !selectedCategory || material.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      material.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group listings by material
  const listingsByMaterial = searchResults.reduce((acc, listing) => {
    const materialId = listing.material_id;
    if (!acc[materialId]) acc[materialId] = [];
    acc[materialId].push(listing);
    return acc;
  }, {} as Record<string, typeof searchResults>);

  const handleContactSeller = (listing: typeof searchResults[0], e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast('error', 'Please log in to contact sellers');
      navigate('/login');
      return;
    }
    const params = new URLSearchParams({
      userId: listing.supplier_id,
      context: 'materials',
      materialName: listing.material?.name || '',
      price: formatCurrency(listing.price),
      location: listing.location
    });
    navigate(`/messages?${params.toString()}`);
  };

  if (loading && searchResults.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <HeaderSimplified />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Simple Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse All Listings</h1>
          <p className="text-gray-600">Find materials from verified suppliers across Rwanda</p>
        </div>

        {/* Search and Filters Bar */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm md:w-48"
            >
              <option value="">All Sectors</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sector
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Sectors</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Material
              </label>
              <select
                value={filters.material_id || ''}
                onChange={(e) => updateFilter('material_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Any Material</option>
                {filteredMaterials.map(material => (
                  <option key={material.id} value={material.id}>
                    {material.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <Input
                placeholder="e.g., Kigali"
                value={filters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value)}
                icon={<MapPin className="w-4 h-4" />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range (RWF)
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.min_price || ''}
                  onChange={(e) => updateFilter('min_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.max_price || ''}
                  onChange={(e) => updateFilter('max_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.min_rating || ''}
                onChange={(e) => updateFilter('min_rating', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.verified_only || false}
                  onChange={(e) => updateFilter('verified_only', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Verified suppliers only</span>
              </label>
            </div>

            <div className="flex items-end">
              <Button variant="secondary" size="sm" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Results Summary */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          {searchResults.length} {searchResults.length === 1 ? 'listing' : 'listings'} found
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/materials/trends')}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Price Trends
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/buyers/quotes')}
          >
            <Package className="w-4 h-4 mr-1" />
            My Quotes
          </Button>
        </div>
      </div>

      {/* Listings */}
      {searchResults.length === 0 ? (
        <EmptyState
          title="No listings found"
          description="Try adjusting your search filters or check back later for new listings"
          action={
            <Button onClick={() => {
              clearFilters();
              handleSearch();
            }}>
              Clear All Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map(listing => (
            <div
              key={listing.id}
              className="cursor-pointer"
              onClick={() => navigate(`/buyers/listing/${listing.id}`)}
            >
              <Card className="hover:shadow-lg transition-shadow h-full">
                <div className="p-6">
                  {/* Supplier Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {listing.supplier?.business_name || 'Supplier'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {listing.supplier?.is_verified_supplier && (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </Badge>
                        )}
                        {listing.supplier?.average_rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{listing.supplier.average_rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Material Info */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {listing.material?.name}
                    </h4>
                    <p className="text-sm text-gray-500">{listing.material?.category}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(listing.price)}
                    </p>
                    <p className="text-sm text-gray-500">per {listing.material?.unit}</p>
                    {listing.min_quantity && (
                      <p className="text-xs text-gray-500 mt-1">
                        Min. order: {listing.min_quantity} {listing.material?.unit}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{listing.location}</span>
                    {listing.area && <span className="text-gray-400">• {listing.area}</span>}
                  </div>

                  {/* Date Published */}
                  <p className="text-xs text-gray-500 mb-4">
                    Listed: {new Date(listing.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>

                  {/* Delivery Info */}
                  {listing.delivery_info && (
                    <div className="mb-4 p-2 bg-blue-50 rounded text-sm text-gray-700">
                      {listing.delivery_info}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      onClick={(e) => handleContactSeller(listing, e)}
                      className="flex-1"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                    {listing.contact_phone && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${listing.contact_phone}`;
                        }}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Info Banners */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seller CTA */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Sell Materials</h3>
              <p className="text-gray-600 text-sm mb-4">
                List your materials and reach buyers. Your prices automatically contribute to market trends.
              </p>
              <Button size="sm" onClick={() => navigate('/suppliers/create')}>
                Create Listing
              </Button>
            </div>
          </div>
        </Card>

        {/* Price Intelligence Info */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Price Data</h3>
              <p className="text-gray-600 text-sm mb-4">
                All price trends are calculated from real supplier listings. See competitive market prices.
              </p>
              <Button size="sm" variant="secondary" onClick={() => navigate('/materials/trends')}>
                View Trends
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
    
    <Footer />
    </div>
  );
}
