import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore, useMaterialsStore } from '../../store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../lib/currency';
import { Search, TrendingUp, Package, MessageCircle, MapPin } from '../../lib/icons';
import { priceSubmissionsService } from '../../services/priceSubmissions.service';
import { toast } from '../../components/ui/Toast';

export default function BuyerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { materials, fetchMaterials } = useMaterialsStore();
  const [popularMaterials, setPopularMaterials] = useState<any[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  useEffect(() => {
    fetchMaterials();
    loadRecentSubmissions();
  }, []);

  useEffect(() => {
    if (materials.length > 0) {
      setPopularMaterials(materials.slice(0, 6));
    }
  }, [materials]);

  const loadRecentSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const submissions = await priceSubmissionsService.getSubmissions({
        status: 'approved',
        limit: 20
      });
      setRecentSubmissions(submissions);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('buyerDashboard.title')}</h1>
        <p className="text-gray-600 mt-2">{t('buyerDashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="cursor-pointer" onClick={() => navigate('/materials/trends')}>
          <Card className="p-6 hover:shadow-lg transition-shadow h-full">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{t('buyerDashboard.findSuppliers')}</h3>
                <p className="text-sm text-gray-600">{t('buyerDashboard.findSuppliersDesc')}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="cursor-pointer" onClick={() => navigate('/materials/trends')}>
          <Card className="p-6 hover:shadow-lg transition-shadow h-full">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{t('buyerDashboard.priceIndex')}</h3>
                <p className="text-sm text-gray-600">{t('buyerDashboard.priceIndexDesc')}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="cursor-pointer" onClick={() => navigate('/materials/submit')}>
          <Card className="p-6 hover:shadow-lg transition-shadow h-full">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{t('buyerDashboard.submitPrice')}</h3>
                <p className="text-sm text-gray-600">{t('buyerDashboard.submitPriceDesc')}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{t('buyerDashboard.communityMarketplace')}</h2>
          <Button variant="secondary" size="sm" onClick={() => navigate('/materials/trends')}>
            {t('buyerDashboard.viewAll')}
          </Button>
        </div>

        {loadingSubmissions ? (
          <Skeleton className="h-48" />
        ) : recentSubmissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSubmissions.slice(0, 6).map((submission: any) => (
              <div
                key={submission.id}
                className="cursor-pointer"
                onClick={() => navigate('/materials/' + submission.material_id)}
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
                      <Badge variant="success">{t('buyerDashboard.available')}</Badge>
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
                        {t('buyerDashboard.qty')}: {submission.quantity} {submission.materials?.unit}
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
                            toast('error', t('buyerDashboard.contactLoginRequired'));
                            return;
                          }
                          const messageParams = new URLSearchParams({
                            userId: submission.user_id,
                            context: 'materials',
                            materialName: submission.materials?.name || '',
                            price: formatCurrency(submission.price),
                            location: submission.location
                          });
                          navigate('/messages?' + messageParams.toString());
                        }}
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        {t('buyerDashboard.contact')}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('buyerDashboard.noSubmissionsYet')}</h3>
            <p className="text-gray-600 mb-4">
              {t('buyerDashboard.beFirstToSubmit')}
            </p>
            <Button onClick={() => navigate('/materials/submit')}>
              {t('buyerDashboard.submitPrice')}
            </Button>
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('buyerDashboard.popularMaterials')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularMaterials.map((material) => (
            <div key={material.id} className="cursor-pointer" onClick={() => navigate('/materials/' + material.id)}>
              <Card className="p-4 hover:shadow-md transition-shadow text-center h-full">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="font-medium text-gray-900 text-sm mb-1">{material.name}</h3>
                <p className="text-xs text-gray-500">{material.category}</p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
