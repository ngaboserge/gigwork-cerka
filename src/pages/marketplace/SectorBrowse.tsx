import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Button, Input, Select, Badge, EmptyState } from '@/components/ui';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { HeaderSimplified } from '@/components/layout/HeaderSimplified';
import { Footer } from '@/components/layout/Footer';
import { useMarketplaceStore } from '@/store/marketplaceStore';
import { formatCurrency } from '@/lib/currency';
import { 
  Search, MapPin, Star, MessageCircle, 
  Package, TrendingUp, Grid, List, Brain,
  Building, Wheat, Meat, Smartphone, Car, Home as HomeIcon, 
  Tool, Cow, Lightning, Hammer, Box, Hospital, Tractor, Shirt
} from '@/lib/icons';

const SECTOR_CONFIG = {
  construction: {
    name: 'Construction Materials',
    icon: <Building className="w-16 h-16" />,
    description: 'Building materials, cement, steel, and construction supplies'
  },
  agriculture: {
    name: 'Agriculture',
    icon: <Wheat className="w-16 h-16" />,
    description: 'Seeds, fertilizer, produce, and farming supplies'
  },
  food: {
    name: 'Food & Commodities',
    icon: <Meat className="w-16 h-16" />,
    description: 'Staples, proteins, produce, dairy, and beverages'
  },
  electronics: {
    name: 'Electronics',
    icon: <Smartphone className="w-16 h-16" />,
    description: 'Phones, laptops, solar panels, and electronic devices'
  },
  vehicles: {
    name: 'Vehicles',
    icon: <Car className="w-16 h-16" />,
    description: 'Cars, motorcycles, trucks, and vehicle parts'
  },
  rentals: {
    name: 'House Rentals',
    icon: <HomeIcon className="w-16 h-16" />,
    description: 'Houses, apartments, shops, and commercial spaces'
  },
  services: {
    name: 'Services',
    icon: <Tool className="w-16 h-16" />,
    description: 'Labor, transport, equipment rental, and professional services'
  },
  livestock: {
    name: 'Livestock',
    icon: <Cow className="w-16 h-16" />,
    description: 'Cows, goats, chickens, and animal products'
  },
  energy: {
    name: 'Energy & Utilities',
    icon: <Lightning className="w-16 h-16" />,
    description: 'Charcoal, gas, solar, and energy solutions'
  },
  hardware: {
    name: 'Hardware & Tools',
    icon: <Hammer className="w-16 h-16" />,
    description: 'Tools, equipment, and hardware supplies'
  },
  goods: {
    name: 'Manufactured Goods',
    icon: <Box className="w-16 h-16" />,
    description: 'Clothes, shoes, plastic goods, and consumer products'
  },
  health: {
    name: 'Health & Hygiene',
    icon: <Hospital className="w-16 h-16" />,
    description: 'Soap, sanitizers, medical supplies, and hygiene products'
  },
  automotive: {
    name: 'Automotive & Transport',
    icon: <Tractor className="w-16 h-16" />,
    description: 'Fuel, spare parts, tires, and automotive supplies'
  },
  textiles: {
    name: 'Textiles & Tailoring',
    icon: <Shirt className="w-16 h-16" />,
    description: 'Fabric, thread, buttons, and tailoring supplies'
  }
};

export default function SectorBrowse() {
  const { sector } = useParams<{ sector: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { listings, loading, fetchListingsBySector } = useMarketplaceStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('all');
  const [condition, setCondition] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImages, setSelectedImages] = useState<{ images: string[], alt: string } | null>(null);
  
  const config = sector ? SECTOR_CONFIG[sector as keyof typeof SECTOR_CONFIG] : null;
  
  useEffect(() => {
    if (sector) {
      fetchListingsBySector(sector);
    }
  }, [sector, fetchListingsBySector]);
  
  if (!config) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <HeaderSimplified />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <EmptyState
            icon={<Package className="w-12 h-12 text-neutral-400" />}
            title={t('sectorBrowse.sectorNotFound')}
            description={t('sectorBrowse.sectorNotFoundDesc')}
            action={{
              label: t('sectorBrowse.browseAllCategories'),
              onClick: () => navigate('/marketplace/categories')
            }}
          />
        </div>
        <Footer />
      </div>
    );
  }
  
  const filteredListings = listings.filter(listing => {
    const materialName = listing.material?.name || '';
    const supplierName = listing.supplier?.business_name || '';
    const matchesSearch = materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.delivery_info?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = location === 'all' || listing.location === location;
    const matchesCondition = condition === 'all' || listing.condition === condition;
    return matchesSearch && matchesLocation && matchesCondition;
  });
  
  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.supplier?.rating || 0) - (a.supplier?.rating || 0);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
  
  return (
    <div className="min-h-screen bg-neutral-50">
      <HeaderSimplified />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-white">{config.icon}</div>
            <div>
              <h1 className="text-4xl font-bold">{config.name}</h1>
              <p className="text-lg opacity-90 mt-2">{config.description}</p>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <Badge variant="info" className="bg-white/20 text-white border-white/30">
              {sortedListings.length} {t('sectorBrowse.listings')}
            </Badge>
            <Badge variant="info" className="bg-white/20 text-white border-white/30 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {t('sectorBrowse.priceIntelligenceAvailable')}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Input
                icon={<Search className="w-4 h-4 text-neutral-400" />}
                placeholder={t('sectorBrowse.searchListings')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              options={[
                { value: 'all', label: t('sectorBrowse.allLocations') },
                { value: 'Kigali', label: 'Kigali' },
                { value: 'Huye', label: 'Huye' },
                { value: 'Musanze', label: 'Musanze' },
                { value: 'Rubavu', label: 'Rubavu' },
                { value: 'Muhanga', label: 'Muhanga' }
              ]}
            />
            <Select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              options={[
                { value: 'all', label: t('sectorBrowse.allConditions') },
                { value: 'new', label: t('sectorBrowse.new') },
                { value: 'used', label: t('sectorBrowse.used') },
                { value: 'refurbished', label: t('sectorBrowse.refurbished') }
              ]}
            />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'recent', label: t('sectorBrowse.mostRecent') },
                { value: 'price-low', label: t('sectorBrowse.priceLowToHigh') },
                { value: 'price-high', label: t('sectorBrowse.priceHighToLow') },
                { value: 'rating', label: t('sectorBrowse.highestRated') }
              ]}
            />
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-neutral-600">
              {t('sectorBrowse.showing')} {sortedListings.length} {t('sectorBrowse.of')} {listings.length} {t('sectorBrowse.listings')}
            </p>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : sortedListings.length === 0 ? (
          <EmptyState
            icon={<Package className="w-12 h-12 text-neutral-400" />}
            title={t('sectorBrowse.noListingsFound')}
            description={t('sectorBrowse.noListingsDesc')}
            action={{
              label: t('sectorBrowse.clearFilters'),
              onClick: () => {
                setSearchQuery('');
                setLocation('all');
                setCondition('all');
              }
            }}
          />
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {sortedListings.map((listing) => (
              <div
                key={listing.id}
                className="cursor-pointer"
                onClick={() => navigate(`/materials/${listing.material_id}`)}
              >
              <Card
                className="hover:shadow-lg transition-shadow h-full"
                padding="none"
              >
                {listing.photos && listing.photos.length > 0 && (
                  <div 
                    className="relative cursor-pointer group/img"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImages({ 
                        images: listing.photos, 
                        alt: listing.material?.name || 'Material' 
                      });
                    }}
                  >
                    <img
                      src={listing.photos[0]}
                      alt={listing.material?.name || 'Product'}
                      className="w-full h-48 object-cover rounded-t-lg group-hover/img:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/img:bg-opacity-20 transition-all flex items-center justify-center rounded-t-lg">
                      <svg className="w-10 h-10 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                    {listing.photos.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                        +{listing.photos.length - 1} more
                      </div>
                    )}
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-neutral-900">
                        {listing.material?.name || 'Material'}
                      </h3>
                      {listing.supplier?.business_name && (
                        <p className="text-sm text-neutral-600 flex items-center gap-1 mt-1">
                          {t('sectorBrowse.by')} {listing.supplier.business_name}
                          {listing.supplier.is_verified_supplier && (
                            <Badge variant="success" className="text-xs flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {t('sectorBrowse.verified')}
                            </Badge>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-2xl font-bold text-primary-600">
                      {formatCurrency(listing.price)}
                      {listing.material?.unit && (
                        <span className="text-sm text-neutral-600 font-normal"> {t('sectorBrowse.per')} {listing.material.unit}</span>
                      )}
                    </p>
                    {listing.min_quantity && (
                      <p className="text-sm text-neutral-600 mt-1">
                        {t('sectorBrowse.minOrder')}: {listing.min_quantity} {listing.material?.unit || t('sectorBrowse.units')}
                      </p>
                    )}
                  </div>
                  
                  {listing.delivery_info && (
                    <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                      {listing.delivery_info}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-neutral-600 mb-2 pb-3 border-b">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {listing.city && listing.area ? `${listing.city} • ${listing.area}` : listing.location}
                    </div>
                    {listing.supplier?.average_rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {listing.supplier.average_rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  
                  {/* Date Published */}
                  <p className="text-xs text-neutral-500 mb-3">
                    {t('sectorBrowse.listed')}: {new Date(listing.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/materials/${listing.material_id}`);
                      }}
                    >
                      <Brain className="w-4 h-4 mr-1" />
                      {t('sectorBrowse.viewIntelligence')}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Open message modal
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Image Lightbox Modal */}
      {selectedImages && (
        <ImageLightbox 
          images={selectedImages.images} 
          alt={selectedImages.alt}
          onClose={() => setSelectedImages(null)}
        />
      )}

      <Footer />
    </div>
  );
}
