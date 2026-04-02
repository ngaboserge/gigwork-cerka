import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSuppliersStore } from '@/store';
import { HeaderSimplified } from '@/components/layout/HeaderSimplified';
import { Footer } from '@/components/layout/Footer';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { Card } from '@/components/ui';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { Search, MapPin, TrendingUp, Building, Leaf, Food, Smartphone, Car, Home, Tool, Cube, Lightning, Hammer, Box, Heart, Shield, Shirt, Package } from '@/lib/icons';
import { formatCurrency } from '@/lib/currency';

export default function HomeSimplified() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { searchResults, searchListings } = useSuppliersStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImages, setSelectedImages] = useState<{ images: string[], alt: string } | null>(null);

  useEffect(() => {
    // Load recent listings
    searchListings({});
  }, []);

  const categories = [
    { id: 'construction', name: t('nav.construction'), icon: <Building className="w-8 h-8" /> },
    { id: 'agriculture', name: t('nav.agriculture'), icon: <Leaf className="w-8 h-8" /> },
    { id: 'food', name: t('nav.food'), icon: <Food className="w-8 h-8" /> },
    { id: 'electronics', name: t('nav.electronics'), icon: <Smartphone className="w-8 h-8" /> },
    { id: 'vehicles', name: t('nav.vehicles'), icon: <Car className="w-8 h-8" /> },
    { id: 'rentals', name: t('nav.rentals'), icon: <Home className="w-8 h-8" /> },
    { id: 'services', name: t('nav.services'), icon: <Tool className="w-8 h-8" /> },
    { id: 'livestock', name: t('nav.livestock'), icon: <Cube className="w-8 h-8" /> },
    { id: 'energy', name: t('nav.energy'), icon: <Lightning className="w-8 h-8" /> },
    { id: 'hardware', name: t('nav.hardware'), icon: <Hammer className="w-8 h-8" /> },
    { id: 'goods', name: t('nav.goods'), icon: <Box className="w-8 h-8" /> },
    { id: 'health', name: t('nav.health'), icon: <Heart className="w-8 h-8" /> },
    { id: 'automotive', name: t('nav.automotive'), icon: <Shield className="w-8 h-8" /> },
    { id: 'textiles', name: t('nav.textiles'), icon: <Shirt className="w-8 h-8" /> },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Search in Price Trends (intelligence marketplace)
      navigate(`/materials/trends?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/materials/trends');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <HeaderSimplified />
      
      {/* Hero Search Section */}
      <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-center mb-3">
            {t('home.heroTitle')}
          </h1>
          <p className="text-center text-lg text-blue-50 mb-8">
            {t('home.heroSubtitle')}
          </p>
          
          {/* Big Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('home.searchPlaceholder')}
                className="w-full px-6 py-4 pl-14 text-lg text-neutral-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300/50 shadow-2xl"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg transition-colors shadow-lg"
              >
                {t('home.searchButton')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Intelligence & Price Trends Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Price Trends Card */}
          <div 
            onClick={() => navigate('/materials/trends')}
            className="cursor-pointer bg-primary-50 border border-primary-200 rounded-lg p-4 hover:bg-primary-100 hover:border-primary-300 transition-all"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-primary-600" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{t('home.priceIndex')}</h3>
                  <p className="text-xs text-gray-600">{t('home.priceIndexDesc')}</p>
                </div>
              </div>
              <button className="text-xs text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap">
                {t('marketplace.viewDetails')} →
              </button>
            </div>
          </div>

          {/* Market Signals Card */}
          <div 
            onClick={() => navigate('/intelligence/signals')}
            className="cursor-pointer bg-accent-50 border border-accent-200 rounded-lg p-4 hover:bg-accent-100 hover:border-accent-300 transition-all"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{t('home.marketSignals')}</h3>
                  <p className="text-xs text-gray-600">{t('home.marketSignalsDesc')}</p>
                </div>
              </div>
              <button className="text-xs text-accent-600 hover:text-accent-700 font-medium whitespace-nowrap">
                {t('marketplace.viewDetails')} →
              </button>
            </div>
          </div>

          {/* Market Insights Card */}
          <div 
            onClick={() => navigate('/intelligence/insights')}
            className="cursor-pointer bg-primary-50 border border-primary-200 rounded-lg p-4 hover:bg-primary-100 hover:border-primary-300 transition-all"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{t('home.marketInsights')}</h3>
                  <p className="text-xs text-gray-600">{t('home.marketInsightsDesc')}</p>
                </div>
              </div>
              <button className="text-xs text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap">
                {t('marketplace.viewDetails')} →
              </button>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-neutral-900 mb-6">{t('home.browseByCategory')}</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => navigate(`/marketplace/${category.id}`)}
              className="flex flex-col items-center gap-2 p-4 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="text-gray-700 hover:text-primary-600 transition-colors">{category.icon}</div>
              <span className="text-xs font-medium text-neutral-700 text-center">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Recent Listings */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">{t('home.recentListings')}</h2>
            <button
              onClick={() => navigate('/materials/trends')}
              className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
            >
              {t('home.viewAll')} →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {searchResults.slice(0, 10).map((listing) => (
              <div
                key={listing.id}
                onClick={() => navigate(`/materials/${listing.material_id}`)}
                className="cursor-pointer group"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full" padding="none">
                  {listing.photos && listing.photos.length > 0 ? (
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
                        className="w-full h-40 object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/img:bg-opacity-20 transition-all flex items-center justify-center">
                        <svg className="w-8 h-8 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                      {listing.photos.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          +{listing.photos.length - 1} more
                        </div>
                      )}
                      {listing.supplier?.is_verified_supplier && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {t('home.verified')}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                      <Package className="w-16 h-16 text-neutral-400" />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="font-bold text-lg text-primary-600 mb-1">
                      {formatCurrency(listing.price)}
                      {listing.material?.unit && (
                        <span className="text-sm text-neutral-600 font-normal">/{listing.material.unit}</span>
                      )}
                    </p>
                    
                    {/* Category / Product Name */}
                    <p className="text-sm font-semibold text-neutral-900 mb-1 line-clamp-2 min-h-[2.5rem]">
                      {(listing.material?.category || listing.material?.sector) && (
                        <span className="text-primary-700 capitalize">
                          {listing.material.category || listing.material.sector} / 
                        </span>
                      )}
                      {listing.material?.name || 'Product'}
                    </p>
                    
                    {/* Supplier Name */}
                    {listing.supplier?.business_name && (
                      <p className="text-xs text-neutral-600 mb-2 line-clamp-1">
                        {t('home.by')} {listing.supplier.business_name}
                      </p>
                    )}
                    
                    {/* Min Order */}
                    {listing.min_quantity && (
                      <p className="text-xs text-neutral-500 mb-1">
                        {t('home.minOrder')}: {listing.min_quantity} {listing.material?.unit || 'units'}
                      </p>
                    )}
                    
                    {/* Location */}
                    <p className="text-xs text-neutral-600 flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" />
                      {listing.city || listing.location}
                      {listing.area && ` • ${listing.area}`}
                    </p>
                    
                    {/* Date Published */}
                    <p className="text-xs text-neutral-500">
                      {t('home.listed')}: {new Date(listing.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {searchResults.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-600">{t('home.noListings')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {selectedImages && (
        <ImageLightbox 
          images={selectedImages.images} 
          alt={selectedImages.alt}
          onClose={() => setSelectedImages(null)}
        />
      )}

      <FloatingActionButton />
      <Footer />
    </div>
  );
}
