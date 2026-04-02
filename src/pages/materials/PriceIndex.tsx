import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAggregationStore, useMaterialsStore } from '../../store';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../lib/currency';
import { TrendingUp, TrendingDown, Minus, Search, MapPin } from '../../lib/icons';

export default function PriceIndex() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { aggregatedPrices, loading, fetchAggregatedPrices } = useAggregationStore();
  const { materials, fetchMaterials, getCategories } = useMaterialsStore();
  
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMaterials();
    fetchAggregatedPrices(location || undefined);
    loadCategories();
  }, [location]);

  const loadCategories = async () => {
    const cats = await getCategories();
    setCategories(cats);
  };

  const filteredPrices = aggregatedPrices.filter(price => {
    const material = materials.find(m => m.id === price.material_id);
    if (!material) return false;

    const matchesCategory = !selectedCategory || material.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      material.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const getTrendIndicator = (percentage: number) => {
    if (Math.abs(percentage) < 5) {
      return { icon: <Minus className="w-4 h-4" />, color: 'text-gray-400', label: t('priceIndex.stable') };
    }
    if (percentage > 0) {
      return { icon: <TrendingUp className="w-4 h-4" />, color: 'text-red-500', label: `+${percentage.toFixed(1)}%` };
    }
    return { icon: <TrendingDown className="w-4 h-4" />, color: 'text-green-500', label: `${percentage.toFixed(1)}%` };
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('priceIndex.title')}</h1>
        <p className="text-gray-600 mt-1">{t('priceIndex.subtitle')}</p>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder={t('priceIndex.searchMaterials')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">{t('priceIndex.allCategories')}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Input
            placeholder={t('priceIndex.filterByLocation')}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            icon={<MapPin className="w-4 h-4" />}
          />
        </div>
      </Card>

      {/* Price Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('priceIndex.material')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('priceIndex.unit')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('priceIndex.medianPrice')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('priceIndex.minMax')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('priceIndex.trend')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('priceIndex.reports')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('priceIndex.location')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrices.map(price => {
                const material = materials.find(m => m.id === price.material_id);
                if (!material) return null;

                const trend = getTrendIndicator(0); // TODO: Calculate actual trend

                return (
                  <tr
                    key={price.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/materials/${material.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{material.name}</div>
                      <div className="text-sm text-gray-500">{material.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {material.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(price.median_price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {formatCurrency(price.min_price)} - {formatCurrency(price.max_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`flex items-center justify-center gap-1 ${trend.color}`}>
                        {trend.icon}
                        <span className="text-xs">{trend.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {price.submission_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {price.location}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredPrices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">{t('priceIndex.noPriceData')}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card className="p-4">
          <p className="text-sm text-gray-500">{t('priceIndex.totalMaterials')}</p>
          <p className="text-2xl font-bold text-gray-900">{filteredPrices.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">{t('priceIndex.totalReports')}</p>
          <p className="text-2xl font-bold text-gray-900">
            {filteredPrices.reduce((sum, p) => sum + p.submission_count, 0)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">{t('priceIndex.avgPriceRange')}</p>
          <p className="text-2xl font-bold text-gray-900">
            {filteredPrices.length > 0
              ? `${((filteredPrices.reduce((sum, p) => sum + ((p.max_price - p.min_price) / p.median_price * 100), 0) / filteredPrices.length)).toFixed(0)}%`
              : '0%'}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">{t('priceIndex.locations')}</p>
          <p className="text-2xl font-bold text-gray-900">
            {new Set(filteredPrices.map(p => p.location)).size}
          </p>
        </Card>
      </div>
    </div>
  );
}
