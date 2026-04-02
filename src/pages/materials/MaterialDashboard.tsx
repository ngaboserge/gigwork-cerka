import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMaterialsStore, useAggregationStore, useAuthStore } from '../../store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../components/ui/Toast';
import { formatCurrency } from '../../lib/currency';
import { Plus, TrendingUp, TrendingDown, Minus, Search, MapPin, MessageCircle } from '../../lib/icons';
import { priceSubmissionsService } from '../../services/priceSubmissions.service';

export default function MaterialDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { materials, loading: materialsLoading, fetchMaterials, getCategories } = useMaterialsStore();
  const { aggregatedPrices, loading: pricesLoading, fetchAggregatedPrices } = useAggregationStore();
  
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'submissions'>(
    (location.state as any)?.viewMode || 'grid'
  );
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  useEffect(() => {
    fetchMaterials();
    fetchAggregatedPrices();
    loadCategories();
    loadRecentSubmissions();
    
    // Check if we should switch to submissions view
    if ((location.state as any)?.viewMode === 'submissions') {
      setViewMode('submissions');
    }
  }, []);

  // Reload submissions when view mode changes to submissions or when refresh is requested
  useEffect(() => {
    if (viewMode === 'submissions' || (location.state as any)?.refresh) {
      loadRecentSubmissions();
    }
  }, [viewMode, (location.state as any)?.refresh]);

  const loadCategories = async () => {
    const cats = await getCategories();
    setCategories(cats);
  };

  const loadRecentSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const submissions = await priceSubmissionsService.getSubmissions({
        status: 'approved',
        limit: 50
      });
      setRecentSubmissions(submissions);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesCategory = !selectedCategory || material.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      material.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredSubmissions = recentSubmissions.filter(submission => {
    const material = (submission as any).materials;
    if (!material) return false;
    const matchesCategory = !selectedCategory || material.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      material.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group submissions by category
  const submissionsByCategory = filteredSubmissions.reduce((acc, submission) => {
    const category = (submission as any).materials?.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(submission);
    return acc;
  }, {} as Record<string, any[]>);

  const getPriceData = (materialId: string) => {
    return aggregatedPrices.find(p => p.material_id === materialId);
  };

  const getTrendIcon = (percentage: number) => {
    if (Math.abs(percentage) < 5) return <Minus className="w-4 h-4 text-gray-400" />;
    if (percentage > 0) return <TrendingUp className="w-4 h-4 text-red-500" />;
    return <TrendingDown className="w-4 h-4 text-green-500" />;
  };

  if (materialsLoading || pricesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('materials.dashboard.title')}</h1>
          <p className="text-gray-600 mt-1">{t('materials.dashboard.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => {
              fetchMaterials();
              fetchAggregatedPrices();
              loadRecentSubmissions();
              toast('success', t('materials.dashboard.refresh'));
            }}
          >
            {t('materials.dashboard.refresh')}
          </Button>
          <Button onClick={() => navigate('/materials/submit')}>
            <Plus className="w-4 h-4 mr-2" />
            {t('materials.dashboard.submitPrice')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder={t('materials.dashboard.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48"
          >
            <option value="">{t('materials.dashboard.allCategories')}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            {t('materials.dashboard.priceOverview')}
          </Button>
          <Button
            variant={viewMode === 'submissions' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('submissions')}
          >
            {t('materials.dashboard.recentSubmissions')}
          </Button>
        </div>
      </div>

      {/* Materials Grid or Submissions View */}
      {viewMode === 'grid' ? (
        filteredMaterials.length === 0 ? (
          <EmptyState
            title={t('materials.dashboard.noMaterialsFound')}
            description={t('materials.dashboard.tryAdjusting')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map(material => {
              const priceData = getPriceData(material.id);
              
              return (
                <div
                  key={material.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/materials/${material.id}`)}
                >
                  <Card className="hover:shadow-lg transition-shadow h-full">
                    <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{material.name}</h3>
                        <p className="text-sm text-gray-500">{material.category}</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {material.unit}
                      </span>
                    </div>

                    {priceData ? (
                      <>
                        <div className="mb-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-900">
                              {formatCurrency(priceData.median_price)}
                            </span>
                            {getTrendIcon(0)}
                          </div>
                          <p className="text-sm text-gray-500">{t('materials.dashboard.medianPrice')}</p>
                        </div>

                        <div className="flex justify-between text-sm">
                          <div>
                            <p className="text-gray-500">{t('materials.dashboard.min')}</p>
                            <p className="font-semibold">{formatCurrency(priceData.min_price)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">{t('materials.dashboard.max')}</p>
                            <p className="font-semibold">{formatCurrency(priceData.max_price)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">{t('materials.dashboard.reports')}</p>
                            <p className="font-semibold">{priceData.submission_count}</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-gray-500">
                            {t('materials.dashboard.lastUpdated')}: {new Date(priceData.last_updated).toLocaleDateString()}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">{t('materials.dashboard.noPriceData')}</p>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/materials/submit', { state: { materialId: material.id } });
                          }}
                        >
                          {t('materials.dashboard.beFirstToSubmit')}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
              );
            })}
          </div>
        )
      ) : (
        /* Recent Submissions by Category */
        loadingSubmissions ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : Object.keys(submissionsByCategory).length === 0 ? (
          <EmptyState
            title="No submissions found"
            description="Be the first to submit a price"
            action={{
              label: 'Submit Price',
              onClick: () => navigate('/materials/submit')
            }}
          />
        ) : (
          <div className="space-y-8">
            {Object.entries(submissionsByCategory).map(([category, submissions]) => (
              <div key={category}>
                <h2 className="text-xl font-bold text-gray-900 mb-4">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(submissions as any[]).map((submission: any) => (
                    <div
                      key={submission.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/materials/${submission.material_id}`)}
                    >
                      <Card className="hover:shadow-md transition-shadow h-full">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {submission.materials?.name || 'Unknown'}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{submission.location}</span>
                            </div>
                          </div>
                          <Badge variant="success">Approved</Badge>
                        </div>
                        <div className="mb-3">
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(submission.price)}
                          </p>
                          <p className="text-xs text-gray-500">
                            per {submission.materials?.unit || 'unit'}
                          </p>
                        </div>
                        {submission.quantity && (
                          <p className="text-sm text-gray-600 mb-2">
                            Qty: {submission.quantity} {submission.materials?.unit}
                          </p>
                        )}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-400">
                            {new Date(submission.submitted_at).toLocaleDateString()}
                          </p>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!user) {
                                toast('error', 'Please log in to contact posters');
                                return;
                              }
                              const params = new URLSearchParams({
                                userId: submission.user_id,
                                context: 'materials',
                                materialName: submission.materials?.name || '',
                                price: formatCurrency(submission.price),
                                location: submission.location
                              });
                              navigate(`/messages?${params.toString()}`);
                            }}
                          >
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="cursor-pointer" onClick={() => navigate('/materials/price-index')}>
          <Card className="p-6 hover:shadow-md transition-shadow h-full">
            <h3 className="font-semibold text-gray-900 mb-2">{t('materials.dashboard.priceIndex')}</h3>
            <p className="text-sm text-gray-600">{t('materials.dashboard.priceIndexDesc')}</p>
          </Card>
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/materials/map')}>
          <Card className="p-6 hover:shadow-md transition-shadow h-full">
            <h3 className="font-semibold text-gray-900 mb-2">{t('materials.dashboard.mapView')}</h3>
            <p className="text-sm text-gray-600">{t('materials.dashboard.mapViewDesc')}</p>
          </Card>
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/materials/trends')}>
          <Card className="p-6 hover:shadow-md transition-shadow h-full">
            <h3 className="font-semibold text-gray-900 mb-2">{t('materials.dashboard.findSuppliers')}</h3>
            <p className="text-sm text-gray-600">{t('materials.dashboard.findSuppliersDesc')}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
