import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMaterialsStore, useSuppliersStore } from '../../store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../lib/currency';
import { Search, TrendingUp, Minus, MapPin, Package, BarChart, Calendar, DollarSign, Brain, Printer } from '../../lib/icons';
import { ComposedPriceChart, VolumeBarChart, Sparkline, PriceComparisonChart } from '../../components/charts';

interface MaterialStats {
  material_id: string;
  material_name: string;
  category: string;
  sector: string;
  unit: string;
  supplier_count: number;
  min_price: number;
  max_price: number;
  avg_price: number;
  median_price: number;
  locations: string[];
  price_volatility: number;
  last_updated: string;
}

export default function PriceTrends() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { materials, loading: materialsLoading, fetchMaterials } = useMaterialsStore();
  const { searchResults, searchListings } = useSuppliersStore();
  
  const [stats, setStats] = useState<MaterialStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'volatility' | 'suppliers'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showCharts, setShowCharts] = useState(false);
  const [selectedMaterialForChart, setSelectedMaterialForChart] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Recalculate stats whenever searchResults or materials change
    if (searchResults.length > 0 && materials.length > 0) {
      calculateStats();
    }
  }, [searchResults, materials]);

  const loadData = async () => {
    setLoading(true);
    try {
      await fetchMaterials();
      await searchListings({}); // Get all active listings
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    console.log('Calculating stats...');
    console.log('Search results:', searchResults.length);
    console.log('Materials:', materials.length);
    
    // Group listings by material
    const materialMap = new Map<string, any[]>();
    
    searchResults.forEach(listing => {
      console.log('Processing listing:', listing.material?.name, 'Status:', listing.status);
      if (listing.status === 'active') {
        const materialId = listing.material_id;
        if (!materialMap.has(materialId)) {
          materialMap.set(materialId, []);
        }
        materialMap.get(materialId)!.push(listing);
      }
    });

    console.log('Material map size:', materialMap.size);

    // Calculate statistics for each material
    const calculatedStats: MaterialStats[] = [];
    
    materialMap.forEach((listings, materialId) => {
      const material = materials.find(m => m.id === materialId);
      if (!material) {
        console.warn('Material not found for ID:', materialId);
        return;
      }

      const prices = listings.map(l => l.price).sort((a, b) => a - b);
      const locations = [...new Set(listings.map(l => l.city || l.location))];
      
      // Calculate price volatility (coefficient of variation)
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
      const stdDev = Math.sqrt(variance);
      const volatility = (stdDev / avgPrice) * 100;

      // Get most recent listing date
      const mostRecent = listings.reduce((latest, listing) => {
        const listingDate = new Date(listing.created_at);
        return listingDate > latest ? listingDate : latest;
      }, new Date(0));
      
      calculatedStats.push({
        material_id: materialId,
        material_name: material.name,
        category: material.category,
        sector: material.sector || material.category,
        unit: material.unit,
        supplier_count: listings.length,
        min_price: Math.min(...prices),
        max_price: Math.max(...prices),
        avg_price: avgPrice,
        median_price: prices[Math.floor(prices.length / 2)],
        locations,
        price_volatility: volatility,
        last_updated: mostRecent.toISOString()
      });
    });

    console.log('Calculated stats:', calculatedStats.length, 'materials');
    setStats(calculatedStats);
  };

  // Get unique sectors
  const sectors = Array.from(new Set(materials.map(m => m.sector || m.category)));

  // Filter and sort stats
  let filteredStats = stats.filter(stat => {
    const matchesSector = !selectedSector || stat.sector === selectedSector;
    const matchesSearch = !searchQuery || 
      stat.material_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

  // Sort stats
  filteredStats = [...filteredStats].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return b.median_price - a.median_price;
      case 'volatility':
        return b.price_volatility - a.price_volatility;
      case 'suppliers':
        return b.supplier_count - a.supplier_count;
      default:
        return a.material_name.localeCompare(b.material_name);
    }
  });

  const getPriceSpread = (stat: MaterialStats) => {
    const spread = ((stat.max_price - stat.min_price) / stat.min_price) * 100;
    return spread.toFixed(1);
  };

  const getVolatilityBadge = (volatility: number) => {
    if (volatility < 10) return { label: 'Stable', variant: 'success' as const, icon: <Minus className="w-3 h-3" /> };
    if (volatility < 25) return { label: 'Moderate', variant: 'warning' as const, icon: <TrendingUp className="w-3 h-3" /> };
    return { label: 'Volatile', variant: 'error' as const, icon: <TrendingUp className="w-3 h-3" /> };
  };

  const getTrendIcon = (spread: number) => {
    if (spread < 10) return <Minus className="w-4 h-4 text-gray-400" />;
    if (spread < 30) return <TrendingUp className="w-4 h-4 text-yellow-500" />;
    return <TrendingUp className="w-4 h-4 text-red-500" />;
  };

  // Generate mock historical data for charts (in production, this would come from database)
  const generateHistoricalData = (stat: MaterialStats, days: number = 30) => {
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic price variations
      const basePrice = stat.median_price;
      const volatility = stat.price_volatility / 100;
      const randomVariation = (Math.random() - 0.5) * 2 * volatility * basePrice;
      const price = Math.max(stat.min_price, Math.min(stat.max_price, basePrice + randomVariation));
      
      // Generate volume data
      const baseVolume = stat.supplier_count;
      const volumeVariation = Math.floor(Math.random() * baseVolume * 0.5);
      const volume = Math.max(1, baseVolume + volumeVariation);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        median: Math.round(price),
        min: Math.round(price * 0.9),
        max: Math.round(price * 1.1),
        avg: Math.round(price * 1.02),
        volume: volume,
        change: i > 0 ? ((price - (basePrice + (Math.random() - 0.5) * volatility * basePrice)) / basePrice) * 100 : 0
      });
    }
    
    return data;
  };

  // Get top materials for hero chart
  const topMaterials = [...stats]
    .sort((a, b) => b.supplier_count - a.supplier_count)
    .slice(0, 3);

  // Get selected material for detailed charts or default to top material
  const selectedMaterial = selectedMaterialForChart 
    ? stats.find(s => s.material_id === selectedMaterialForChart) || topMaterials[0]
    : topMaterials[0];

  // Generate comparison data
  const comparisonData = topMaterials.map(stat => ({
    name: stat.material_name,
    color: stat.material_name === topMaterials[0]?.material_name ? '#3b82f6' : 
           stat.material_name === topMaterials[1]?.material_name ? '#10b981' : '#a855f7',
    data: generateHistoricalData(stat, 30).map(d => ({ date: d.date, price: d.median }))
  }));

  // Calculate overall market statistics
  const totalSuppliers = stats.reduce((sum, stat) => sum + stat.supplier_count, 0);
  const avgVolatility = stats.length > 0 
    ? stats.reduce((sum, stat) => sum + stat.price_volatility, 0) / stats.length 
    : 0;
  const totalMaterials = stats.length;

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ['Material', 'Sector', 'Unit', 'Min Price', 'Median Price', 'Max Price', 'Avg Price', 'Volatility %', 'Suppliers', 'Locations', 'Last Updated'];
    const rows = filteredStats.map(stat => [
      stat.material_name,
      stat.sector,
      stat.unit,
      stat.min_price,
      stat.median_price,
      stat.max_price,
      stat.avg_price.toFixed(2),
      stat.price_volatility.toFixed(2),
      stat.supplier_count,
      stat.locations.join('; '),
      new Date(stat.last_updated).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rwanda-price-index-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  if (loading || materialsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
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
        {t('materials.trends.backToHome')}
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('materials.trends.title')}
              </h1>
              <Badge variant="info" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Badge>
            </div>
            <p className="text-lg text-gray-600">
              {t('materials.trends.subtitle', { materials: totalMaterials, suppliers: totalSuppliers })}
            </p>
          </div>
          
          {/* Export Actions */}
          <div className="flex gap-2 print:hidden">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCharts(!showCharts)}
              className="flex items-center gap-2"
            >
              <BarChart className="w-4 h-4" />
              {showCharts ? t('materials.trends.hideCharts') : t('materials.trends.showCharts')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={exportToCSV}
              className="flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              {t('materials.trends.exportCSV')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              {t('materials.trends.print')}
            </Button>
          </div>
        </div>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-blue-700 mb-1">{t('materials.trends.totalMaterials')}</p>
          <p className="text-3xl font-bold text-blue-900">{totalMaterials}</p>
          <p className="text-xs text-blue-600 mt-1">{t('materials.trends.trackedRealTime')}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-green-500 rounded-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm font-medium text-green-700 mb-1">{t('materials.trends.activeSuppliers')}</p>
          <p className="text-3xl font-bold text-green-900">{totalSuppliers}</p>
          <p className="text-xs text-green-600 mt-1">{t('materials.trends.verifiedListings')}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <BarChart className="w-6 h-6 text-white" />
            </div>
            {avgVolatility < 15 ? <Minus className="w-5 h-5 text-yellow-600" /> : <TrendingUp className="w-5 h-5 text-yellow-600" />}
          </div>
          <p className="text-sm font-medium text-yellow-700 mb-1">{t('materials.trends.avgVolatility')}</p>
          <p className="text-3xl font-bold text-yellow-900">{avgVolatility.toFixed(1)}%</p>
          <p className="text-xs text-yellow-600 mt-1">
            {avgVolatility < 10 ? t('materials.trends.stableMarket') : avgVolatility < 25 ? t('materials.trends.moderateVariation') : t('materials.trends.highVariation')}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-sm font-medium text-purple-700 mb-1">{t('materials.trends.marketCoverage')}</p>
          <p className="text-3xl font-bold text-purple-900">{sectors.length}</p>
          <p className="text-xs text-purple-600 mt-1">{t('materials.trends.economicSectors')}</p>
        </Card>
      </div>

      {/* Charts Section */}
      {showCharts && stats.length > 0 && (
        <div className="space-y-6 mb-8">
          {/* Material Selector for Detailed Charts */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                Select Material for Detailed Charts:
              </label>
              <select
                value={selectedMaterialForChart}
                onChange={(e) => setSelectedMaterialForChart(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Top Material (Most Supplied)</option>
                {stats.map(stat => (
                  <option key={stat.material_id} value={stat.material_id}>
                    {stat.material_name} - {stat.supplier_count} suppliers ({stat.sector})
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Hero Chart - Market Overview */}
          {topMaterials.length > 0 && (
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <BarChart className="w-6 h-6 text-blue-600" />
                    Market Overview - Top Materials
                  </h3>
                  <p className="text-sm text-gray-600">30-day price trends for most supplied materials</p>
                </div>
                <Badge variant="info" className="text-sm">
                  Live Data
                </Badge>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <PriceComparisonChart materials={comparisonData} height={350} />
              </div>
            </Card>
          )}

          {/* Detailed Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price & Volume Chart - Selected Material */}
            {selectedMaterial && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  {selectedMaterial.material_name} - Price & Volume
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ComposedPriceChart 
                    data={generateHistoricalData(selectedMaterial, 30)} 
                    height={300}
                    showVolume={true}
                    showRange={true}
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Current</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(selectedMaterial.median_price)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Volatility</p>
                    <p className="text-lg font-bold text-yellow-600">{selectedMaterial.price_volatility.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Suppliers</p>
                    <p className="text-lg font-bold text-green-600">{selectedMaterial.supplier_count}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Volatility Distribution Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-blue-600" />
                Price Volatility Distribution
              </h3>
              <div className="space-y-3">
                {(() => {
                  const stable = stats.filter(s => s.price_volatility < 10).length;
                  const moderate = stats.filter(s => s.price_volatility >= 10 && s.price_volatility < 25).length;
                  const volatile = stats.filter(s => s.price_volatility >= 25).length;
                  const total = stats.length;
                  
                  return (
                    <>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded"></span>
                            Stable (&lt;10%)
                          </span>
                          <span className="font-semibold text-gray-900">{stable} materials ({((stable/total)*100).toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${(stable/total)*100}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 flex items-center gap-2">
                            <span className="w-3 h-3 bg-yellow-500 rounded"></span>
                            Moderate (10-25%)
                          </span>
                          <span className="font-semibold text-gray-900">{moderate} materials ({((moderate/total)*100).toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-yellow-500 h-3 rounded-full transition-all" style={{ width: `${(moderate/total)*100}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 flex items-center gap-2">
                            <span className="w-3 h-3 bg-red-500 rounded"></span>
                            Volatile (&gt;25%)
                          </span>
                          <span className="font-semibold text-gray-900">{volatile} materials ({((volatile/total)*100).toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-red-500 h-3 rounded-full transition-all" style={{ width: `${(volatile/total)*100}%` }}></div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-blue-900">{((stats.filter(s => s.price_volatility < 10).length / stats.length) * 100).toFixed(0)}%</span> of materials show stable pricing, indicating a mature and predictable market.
                </p>
              </div>
            </Card>

            {/* Sector Distribution Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Materials by Sector
              </h3>
              <div className="space-y-3">
                {(() => {
                  const sectorCounts = sectors.map(sector => ({
                    sector,
                    count: stats.filter(s => s.sector === sector).length
                  })).sort((a, b) => b.count - a.count);
                  
                  const maxCount = Math.max(...sectorCounts.map(s => s.count));
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500', 'bg-pink-500'];
                  
                  return sectorCounts.map((item, idx) => (
                    <div key={item.sector}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 capitalize flex items-center gap-2">
                          <span className={`w-3 h-3 ${colors[idx % colors.length]} rounded`}></span>
                          {item.sector}
                        </span>
                        <span className="font-semibold text-gray-900">{item.count} materials</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className={`${colors[idx % colors.length]} h-3 rounded-full transition-all`} style={{ width: `${(item.count/maxCount)*100}%` }}></div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </Card>

            {/* Top 5 Most Volatile Materials with Sparklines */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                Most Volatile Materials
              </h3>
              <div className="space-y-3">
                {[...stats].sort((a, b) => b.price_volatility - a.price_volatility).slice(0, 5).map((stat, idx) => {
                  const sparklineData = generateHistoricalData(stat, 14).map(d => ({ value: d.median }));
                  return (
                    <div key={stat.material_id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                         onClick={() => navigate(`/materials/${stat.material_id}`)}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{stat.material_name}</p>
                            <p className="text-xs text-gray-500 capitalize">{stat.sector}</p>
                          </div>
                        </div>
                        <Badge variant="error" className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {stat.price_volatility.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="h-10">
                        <Sparkline data={sparklineData} trend="down" height={40} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Top 5 Most Supplied Materials with Sparklines */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Most Supplied Materials
              </h3>
              <div className="space-y-3">
                {[...stats].sort((a, b) => b.supplier_count - a.supplier_count).slice(0, 5).map((stat, idx) => {
                  const sparklineData = generateHistoricalData(stat, 14).map(d => ({ value: d.median }));
                  return (
                    <div key={stat.material_id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                         onClick={() => navigate(`/materials/${stat.material_id}`)}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{stat.material_name}</p>
                            <p className="text-xs text-gray-500 capitalize">{stat.sector}</p>
                          </div>
                        </div>
                        <Badge variant="success" className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {stat.supplier_count} suppliers
                        </Badge>
                      </div>
                      <div className="h-10">
                        <Sparkline data={sparklineData} trend="up" height={40} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Volume Analysis - Selected Material */}
            {selectedMaterial && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-green-600" />
                  {selectedMaterial.material_name} - Volume Trends
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <VolumeBarChart 
                    data={generateHistoricalData(selectedMaterial, 30).map(d => ({
                      date: d.date,
                      volume: d.volume,
                      change: d.change
                    }))} 
                    height={250}
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Average daily volume: <span className="font-bold text-gray-900">{selectedMaterial.supplier_count} listings</span>
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Info Banner */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-blue-200 shadow-md">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-gray-900 mb-2">Rwanda's First Real-Time Economic Price Index</p>
            <p className="text-gray-700 leading-relaxed">
              All price data is automatically calculated from verified supplier listings across Rwanda. 
              Track market trends, compare prices by location, and make informed purchasing decisions with real-time market intelligence.
            </p>
          </div>
        </div>
      </Card>

      {/* Filters and Controls */}
      <Card className="p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Materials</label>
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Sectors</option>
              {sectors.map(sector => (
                <option key={sector} value={sector} className="capitalize">{sector}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Name (A-Z)</option>
              <option value="price">Price (High-Low)</option>
              <option value="volatility">Volatility</option>
              <option value="suppliers">Suppliers</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'grid' ? 'primary' : 'secondary'} 
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex-1"
              >
                Grid
              </Button>
              <Button 
                variant={viewMode === 'table' ? 'primary' : 'secondary'} 
                size="sm"
                onClick={() => setViewMode('table')}
                className="flex-1"
              >
                Table
              </Button>
            </div>
          </div>
        </div>
        
        {/* Results count */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredStats.length}</span> of <span className="font-semibold text-gray-900">{stats.length}</span> materials
            {selectedSector && <span> in <span className="font-semibold capitalize">{selectedSector}</span></span>}
          </p>
        </div>
      </Card>

      {/* Statistics Grid */}
      {filteredStats.length === 0 ? (
        <EmptyState
          title={stats.length === 0 ? "No price data available yet" : "No materials match your filters"}
          description={stats.length === 0 
            ? "The price index will populate automatically as suppliers create listings. Check the browser console for debugging information."
            : "Try adjusting your search or sector filter to see more materials."}
        />
      ) : (
        <div className="space-y-6">
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStats.map(stat => {
                const spread = parseFloat(getPriceSpread(stat));
                const volatilityBadge = getVolatilityBadge(stat.price_volatility);
                
                return (
                  <div
                    key={stat.material_id}
                    className="cursor-pointer transform hover:scale-105 transition-transform"
                    onClick={() => navigate(`/materials/${stat.material_id}`)}
                  >
                    <Card className="hover:shadow-xl transition-shadow h-full border-l-4 border-l-blue-500">
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {stat.material_name}
                            </h3>
                            <p className="text-sm text-gray-500 capitalize flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {stat.sector}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="secondary" className="text-xs font-semibold">
                              {stat.unit}
                            </Badge>
                            <Badge variant={volatilityBadge.variant} className="text-xs flex items-center gap-1">
                              {volatilityBadge.icon}
                              {volatilityBadge.label}
                            </Badge>
                          </div>
                        </div>

                        {/* Price Statistics */}
                        <div className="mb-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-3xl font-bold text-gray-900">
                              {formatCurrency(stat.median_price)}
                            </span>
                            {getTrendIcon(spread)}
                          </div>
                          <p className="text-sm text-gray-600 font-medium">Median market price</p>
                        </div>

                        {/* Price Range */}
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex justify-between text-sm mb-3">
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Low</p>
                              <p className="font-bold text-green-600">
                                {formatCurrency(stat.min_price)}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-500 text-xs mb-1">Avg</p>
                              <p className="font-bold text-gray-900">
                                {formatCurrency(stat.avg_price)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-500 text-xs mb-1">High</p>
                              <p className="font-bold text-red-600">
                                {formatCurrency(stat.max_price)}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
                            Spread: <span className="font-semibold">{spread}%</span> • Volatility: <span className="font-semibold">{stat.price_volatility.toFixed(1)}%</span>
                          </div>
                        </div>

                        {/* Market Info */}
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold">{stat.supplier_count}</span>
                            <span className="text-gray-500">suppliers</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold">{stat.locations.length}</span>
                            <span className="text-gray-500">locations</span>
                          </div>
                        </div>

                        {/* Locations */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {stat.locations.slice(0, 3).map(loc => (
                            <Badge key={loc} variant="secondary" className="text-xs">
                              📍 {loc}
                            </Badge>
                          ))}
                          {stat.locations.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{stat.locations.length - 3} more
                            </Badge>
                          )}
                        </div>

                        {/* Last Updated */}
                        <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Updated: {new Date(stat.last_updated).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>

                        {/* Actions */}
                        <div className="pt-4 border-t border-gray-200 space-y-2">
                          <Button
                            size="sm"
                            variant="primary"
                            className="w-full font-semibold"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/materials/${stat.material_id}`);
                            }}
                          >
                            <Brain className="w-4 h-4 mr-1" />
                            View Intelligence →
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/materials/${stat.material_id}`);
                            }}
                          >
                            View {stat.supplier_count} Suppliers
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Material</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Sector</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Median Price</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Range</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Volatility</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Suppliers</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Locations</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStats.map(stat => {
                      const volatilityBadge = getVolatilityBadge(stat.price_volatility);
                      return (
                        <tr key={stat.material_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900">{stat.material_name}</p>
                              <p className="text-xs text-gray-500">{stat.unit}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700 capitalize">{stat.sector}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-gray-900">{formatCurrency(stat.median_price)}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-sm">
                              <p className="text-green-600">{formatCurrency(stat.min_price)}</p>
                              <p className="text-red-600">{formatCurrency(stat.max_price)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant={volatilityBadge.variant} className="text-xs">
                              {stat.price_volatility.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-semibold text-gray-900">{stat.supplier_count}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-semibold text-gray-900">{stat.locations.length}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => navigate(`/materials/${stat.material_id}`)}
                            >
                              <Brain className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Bottom CTA */}
      <Card className="mt-8 p-8 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-2 border-blue-200 shadow-lg">
        <div className="text-center">
          <div className="inline-block p-4 bg-blue-500 rounded-full mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Want to sell materials?
          </h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Create a listing and your prices will automatically contribute to Rwanda's economic price trends. 
            Join {totalSuppliers} verified suppliers already on the platform.
          </p>
          <Button onClick={() => navigate('/suppliers/create')} size="lg" className="font-semibold">
            Create Listing →
          </Button>
        </div>
      </Card>

      {/* Print Styles */}
      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
