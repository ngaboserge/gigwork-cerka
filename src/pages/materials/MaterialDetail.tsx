import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMaterialsStore, useAggregationStore, usePriceSubmissionsStore, useAuthStore, useSuppliersStore } from '../../store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { ImageLightbox } from '../../components/ui/ImageLightbox';
import { toast } from '../../components/ui/Toast';
import { formatCurrency } from '../../lib/currency';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, MessageCircle, MapPin, CheckCircle, X, Star, Package, Brain, ChartBar, Lightbulb } from '../../lib/icons';
import { 
  LocalitySelector, 
  FreshnessBadge, 
  TrustBadge, 
  PriceWithConfidence,
  DataQualityBadge 
} from '../../components/intelligence';
import { getLocalPrice, getUserTrustScore, validatePrice, type Neighborhood } from '../../services/intelligence.service';

export default function MaterialDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { user } = useAuthStore();
  const { materials, fetchMaterials } = useMaterialsStore();
  const { selectedPrice, priceHistory, trend, loading, fetchAggregatedPrice, fetchPriceHistory } = useAggregationStore();
  const { submissions, fetchSubmissionsByMaterial } = usePriceSubmissionsStore();
  const { searchResults, searchListings, loading: suppliersLoading } = useSuppliersStore();
  
  const [location, setLocation] = useState('Kigali');
  const [dateRange, setDateRange] = useState(30);
  const [activeTab, setActiveTab] = useState('suppliers'); // Default to suppliers for better UX
  const [selectedImages, setSelectedImages] = useState<{ images: string[], alt: string } | null>(null);
  
  // Intelligence Layer State
  const [localPriceData, setLocalPriceData] = useState<any>(null);
  const [selectedLat, setSelectedLat] = useState(-1.9706); // Kigali default
  const [selectedLng, setSelectedLng] = useState(30.0587);
  const [radiusKm, setRadiusKm] = useState(5);
  const [submitterTrustScores, setSubmitterTrustScores] = useState<Record<string, any>>({});
  const [useIntelligence, setUseIntelligence] = useState(true);

  const material = materials.find(m => m.id === id);

  useEffect(() => {
    if (!materials.length) {
      fetchMaterials();
    }
  }, []);

  // Always fetch suppliers on load for better UX
  useEffect(() => {
    if (id) {
      searchListings({ material_id: id });
    }
  }, [id]);

  useEffect(() => {
    if (id && location) {
      fetchAggregatedPrice(id, location).catch(() => {
        console.log('No aggregated price data yet');
      });
      fetchPriceHistory(id, location, dateRange).catch(() => {
        console.log('No price history yet');
      });
    }
  }, [id, location, dateRange]);

  useEffect(() => {
    if (id && activeTab === 'submissions') {
      fetchSubmissionsByMaterial(id, undefined, 20);
    }
  }, [id, activeTab]);

  // Suppliers already loaded on mount, just refresh if tab changes
  useEffect(() => {
    if (id && activeTab === 'suppliers') {
      searchListings({ material_id: id });
    }
  }, [id, activeTab]);

  // Fetch local price with intelligence
  useEffect(() => {
    if (id && selectedLat && selectedLng && useIntelligence) {
      loadLocalPrice();
    }
  }, [id, selectedLat, selectedLng, radiusKm, useIntelligence]);

  // Load trust scores for submitters
  useEffect(() => {
    if (submissions.length > 0 && useIntelligence) {
      loadSubmitterTrustScores();
    }
  }, [submissions, useIntelligence]);

  const loadLocalPrice = async () => {
    if (!id) return;
    const data = await getLocalPrice(id, selectedLat, selectedLng, radiusKm);
    setLocalPriceData(data);
  };

  const loadSubmitterTrustScores = async () => {
    const scores: Record<string, any> = {};
    for (const submission of submissions.slice(0, 10)) {
      if (!scores[submission.user_id]) {
        const trustScore = await getUserTrustScore(submission.user_id);
        if (trustScore) {
          scores[submission.user_id] = trustScore;
        }
      }
    }
    setSubmitterTrustScores(scores);
  };

  const handleLocationChange = (lat: number, lng: number, radius: number, neighborhood?: Neighborhood) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    setRadiusKm(radius);
    if (neighborhood) {
      setLocation(neighborhood.city);
    }
  };

  const handleValidatePrice = async (submissionId: string, type: 'confirm' | 'dispute') => {
    if (!user) {
      toast('error', 'Please log in to validate prices');
      return;
    }
    
    const success = await validatePrice(submissionId, type);
    if (success) {
      toast('success', `Price ${type === 'confirm' ? 'confirmed' : 'disputed'} successfully`);
      if (id) {
        fetchSubmissionsByMaterial(id, location || undefined, 20);
      }
    } else {
      toast('error', 'Failed to validate price');
    }
  };

  const getTrendIcon = () => {
    if (!trend) return <Minus className="w-5 h-5 text-gray-400" />;
    if (trend.indicator === 'up') return <TrendingUp className="w-5 h-5 text-red-500" />;
    if (trend.indicator === 'down') return <TrendingDown className="w-5 h-5 text-green-500" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  if (loading || !material) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/materials/trends')} 
          className="mb-4 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{material.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {material.category}
              </span>
              <span className="text-gray-600">Unit: {material.unit}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={useIntelligence ? 'primary' : 'secondary'}
              onClick={() => setUseIntelligence(!useIntelligence)}
              size="sm"
            >
              {useIntelligence ? (
                <>
                  <Brain className="w-4 h-4 mr-1" />
                  Intelligence ON
                </>
              ) : (
                <>
                  <ChartBar className="w-4 h-4 mr-1" />
                  Basic Mode
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Intelligence Layer: Locality Selector */}
      {useIntelligence && (
        <div className="mb-6">
          <LocalitySelector
            onLocationChange={handleLocationChange}
            defaultRadius={radiusKm}
          />
        </div>
      )}

      {/* Price Overview with Intelligence */}
      {useIntelligence && localPriceData && localPriceData.dataPoints > 0 ? (
        <div className="mb-6">
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  Local Market Price
                </h2>
                <p className="text-sm text-gray-500">
                  Within {radiusKm}km radius • {localPriceData.dataPoints} sources
                </p>
              </div>
              <div className="flex gap-2">
                <FreshnessBadge
                  avgAgeDays={localPriceData.avgAgeDays}
                  dataPoints={localPriceData.dataPoints}
                />
                <DataQualityBadge
                  quality={localPriceData.confidence}
                  grade={localPriceData.qualityGrade}
                  freshnessScore={Math.max(0, 100 - localPriceData.avgAgeDays * 5)}
                  trustScore={localPriceData.avgTrustScore}
                />
              </div>
            </div>
            
            <PriceWithConfidence
              price={localPriceData.localPrice}
              confidence={localPriceData.confidence}
              dataPoints={localPriceData.dataPoints}
              qualityGrade={localPriceData.qualityGrade}
            />

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                Prices automatically collected from supplier listings, weighted by time decay, distance, and supplier trust.
              </p>
            </div>
          </Card>
        </div>
      ) : selectedPrice ? (
        <Card className="p-8 mb-6 bg-gradient-to-br from-blue-50 via-white to-blue-50">
          <div className="max-w-4xl mx-auto">
            {/* Main Price Display */}
            <div className="text-center mb-8">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Current Market Price in {location}
              </p>
              <div className="flex items-center justify-center gap-3 mb-2">
                <p className="text-5xl font-bold text-gray-900">
                  {formatCurrency(selectedPrice.median_price)}
                </p>
                {trend && (
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                    trend.indicator === 'up' ? 'bg-red-100' : 
                    trend.indicator === 'down' ? 'bg-green-100' : 
                    'bg-gray-100'
                  }`}>
                    {getTrendIcon()}
                    <span className={`text-sm font-semibold ${
                      trend.indicator === 'up' ? 'text-red-600' : 
                      trend.indicator === 'down' ? 'text-green-600' : 
                      'text-gray-600'
                    }`}>
                      {trend.percentage > 0 ? '+' : ''}{trend.percentage.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              <p className="text-gray-600">per {material.unit}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6">
              {/* Low Price */}
              <div className="text-center p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Lowest Price
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(selectedPrice.min_price)}
                </p>
              </div>

              {/* Data Points */}
              <div className="text-center p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Data Sources
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {selectedPrice.submission_count}
                </p>
                <p className="text-xs text-gray-500 mt-1">price reports</p>
              </div>

              {/* High Price */}
              <div className="text-center p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Highest Price
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(selectedPrice.max_price)}
                </p>
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Last updated: {new Date(selectedPrice.last_updated).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </Card>
      ) : searchResults.length > 0 ? (
        <Card className="p-8 mb-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Price Intelligence Building</h3>
            <p className="text-gray-600 mb-4">
              We're collecting price data from {searchResults.length} supplier{searchResults.length !== 1 ? 's' : ''} for {material?.name}
            </p>
            <p className="text-sm text-gray-500">
              Check the "Available Suppliers" tab below to see current listings
            </p>
          </div>
        </Card>
      ) : (
        <Card className="p-8 mb-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Yet</h3>
            <p className="text-gray-600 mb-4">
              Price intelligence will appear here once suppliers list {material?.name}
            </p>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'suppliers', label: 'Available Suppliers', count: searchResults.length },
            { id: 'overview', label: 'Price History' },
            { id: 'submissions', label: 'Recent Submissions' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === tab.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Price History */}
      {activeTab === 'overview' && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Price History</h2>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>

          {priceHistory.length > 0 ? (
            <div className="space-y-3">
              {priceHistory.map((point, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(point.date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{point.submission_count} price {point.submission_count === 1 ? 'report' : 'reports'}</p>
                  </div>
                  <div className="flex gap-8 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Low</p>
                      <p className="font-semibold text-gray-700">{formatCurrency(point.min_price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Average</p>
                      <p className="font-semibold text-blue-600">{formatCurrency(point.median_price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">High</p>
                      <p className="font-semibold text-gray-700">{formatCurrency(point.max_price)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Price History Yet</h3>
              <p className="text-gray-500 mb-4">
                Price history will appear here as suppliers list {material?.name}
              </p>
              {searchResults.length > 0 && (
                <p className="text-sm text-blue-600 flex items-center gap-1">
                  <ChartBar className="w-4 h-4" />
                  {searchResults.length} supplier{searchResults.length !== 1 ? 's are' : ' is'} currently listing this material
                </p>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Recent Submissions with Trust Badges */}
      {activeTab === 'submissions' && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Price Submissions</h2>
            <select
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (id) {
                  fetchSubmissionsByMaterial(id, e.target.value || undefined, 20);
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Locations</option>
              <option value="Kigali">Kigali</option>
              <option value="Huye">Huye</option>
              <option value="Musanze">Musanze</option>
              <option value="Rubavu">Rubavu</option>
              <option value="Muhanga">Muhanga</option>
            </select>
          </div>
          {submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map((submission) => {
                const trustScore = submitterTrustScores[submission.user_id];
                return (
                  <div key={submission.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(submission.price)}
                          </p>
                          <Badge variant={
                            submission.status === 'approved' ? 'success' :
                            submission.status === 'rejected' ? 'error' :
                            submission.status === 'flagged' ? 'warning' :
                            'neutral'
                          }>
                            {submission.status}
                          </Badge>
                          {useIntelligence && trustScore && (
                            <TrustBadge
                              tier={trustScore.trustTier}
                              score={trustScore.overallScore}
                              showDetails={true}
                              accuracyScore={trustScore.accuracyScore}
                              consistencyScore={trustScore.consistencyScore}
                              validationScore={trustScore.validationScore}
                              experienceScore={trustScore.experienceScore}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{submission.location}</span>
                          </div>
                          <span>Qty: {submission.quantity} {material?.unit}</span>
                          <span>{new Date(submission.submitted_at).toLocaleDateString()}</span>
                        </div>
                        {submission.notes && (
                          <p className="text-sm text-gray-600 mt-2">{submission.notes}</p>
                        )}
                      </div>
                      {submission.photo_url && (
                        <img 
                          src={submission.photo_url} 
                          alt="Price evidence" 
                          className="w-20 h-20 object-cover rounded ml-4"
                        />
                      )}
                    </div>
                    
                    {/* Validation Buttons */}
                    {useIntelligence && user && (
                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleValidatePrice(submission.id, 'confirm')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Confirm Price
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleValidatePrice(submission.id, 'dispute')}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Dispute
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const params = new URLSearchParams({
                              userId: submission.user_id,
                              context: 'materials',
                              materialName: material?.name || '',
                              price: formatCurrency(submission.price),
                              location: submission.location
                            });
                            navigate(`/messages?${params.toString()}`);
                          }}
                          className="ml-auto"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Ask Submitter
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No submissions yet{location ? ` for ${location}` : ''}
            </div>
          )}
        </Card>
      )}

      {/* Find Suppliers */}
      {activeTab === 'suppliers' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Suppliers for {material.name}</h2>
          
          {suppliersLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((listing) => (
                <div key={listing.id} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {listing.supplier?.business_name || 'Unknown Supplier'}
                        </h3>
                        {listing.supplier?.is_verified_supplier && (
                          <Badge variant="success" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {listing.supplier?.average_rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{listing.supplier.average_rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{listing.city || listing.location}</span>
                        </div>
                        <span>Min. order: {listing.min_quantity} {material?.unit}</span>
                      </div>
                      
                      {listing.delivery_info && (
                        <p className="text-sm text-gray-600 mb-2">{listing.delivery_info}</p>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        Listed: {new Date(listing.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-primary-600">
                        {formatCurrency(listing.price)}
                      </p>
                      <p className="text-sm text-gray-500">per {material?.unit}</p>
                    </div>
                  </div>
                  
                  {listing.photos && listing.photos.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {listing.photos.slice(0, 3).map((photo, idx) => (
                        <div
                          key={idx}
                          className="relative cursor-pointer group/img"
                          onClick={() => setSelectedImages({ 
                            images: listing.photos || [], 
                            alt: material?.name || 'Material' 
                          })}
                        >
                          <img 
                            src={photo} 
                            alt={`${material?.name} ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded group-hover/img:opacity-90 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/img:bg-opacity-30 transition-all rounded flex items-center justify-center">
                            <svg className="w-6 h-6 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                      ))}
                      {listing.photos && listing.photos.length > 3 && (
                        <div 
                          className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                          onClick={() => setSelectedImages({ 
                            images: listing.photos || [], 
                            alt: material?.name || 'Material' 
                          })}
                        >
                          <span className="text-sm font-medium text-gray-600">+{listing.photos.length - 3}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        const params = new URLSearchParams({
                          userId: listing.supplier_id,
                          context: 'listing',
                          listingId: listing.id,
                          materialName: material?.name || '',
                          price: formatCurrency(listing.price)
                        });
                        navigate(`/messages?${params.toString()}`);
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Message Seller
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/buyers/listing/${listing.id}`)}
                    >
                      View Full Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No suppliers found for {material?.name}</p>
              <p className="text-sm text-gray-400 mb-4">Be the first to list this material</p>
              <Button variant="primary" onClick={() => navigate('/suppliers/create')}>
                Create Listing
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Image Lightbox Modal */}
      {selectedImages && (
        <ImageLightbox 
          images={selectedImages.images} 
          alt={selectedImages.alt}
          onClose={() => setSelectedImages(null)}
        />
      )}
    </div>
  );
}
