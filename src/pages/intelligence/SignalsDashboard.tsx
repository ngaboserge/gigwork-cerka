import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { SignalBadge, TrendBadge, SignalAlert } from '../../components/intelligence';
import { 
  getMarketSignals, 
  getSignalSummary, 
  resolveSignal,
  type MarketSignal 
} from '../../services/signals.service';
import { formatCurrency } from '../../lib/currency';
import { 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  MapPin, 
  Filter,
  RefreshCw,
  CheckCircle,
  Calendar
} from '../../lib/icons';
import { toast } from '../../components/ui/Toast';

export default function SignalsDashboard() {
  const navigate = useNavigate();
  const [signals, setSignals] = useState<MarketSignal[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedLocation, selectedType, selectedSeverity]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [signalsData, summaryData] = await Promise.all([
        getMarketSignals({
          location: selectedLocation || undefined,
          signal_type: selectedType || undefined,
          severity: selectedSeverity || undefined,
          limit: 100
        }),
        getSignalSummary(selectedLocation || undefined)
      ]);
      setSignals(signalsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading signals:', error);
      toast('error', 'Failed to load market signals');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveSignal = async (signalId: string) => {
    const success = await resolveSignal(signalId);
    if (success) {
      toast('success', 'Signal marked as resolved');
      loadData();
    } else {
      toast('error', 'Failed to resolve signal');
    }
  };

  const filteredSignals = signals.filter(signal => {
    if (!searchQuery) return true;
    const materialName = signal.material?.name?.toLowerCase() || '';
    return materialName.includes(searchQuery.toLowerCase());
  });

  const locations = ['Kigali', 'Huye', 'Musanze', 'Rubavu', 'Muhanga'];
  const signalTypes = ['volatility', 'shortage', 'surplus', 'trend', 'anomaly'];
  const severityLevels = ['critical', 'high', 'medium', 'low'];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/home')} 
        className="mb-4 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Market Signals Dashboard
              </h1>
              <Badge variant="info" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Badge>
            </div>
            <p className="text-lg text-gray-600">
              Real-time market intelligence detecting <span className="font-semibold text-gray-900">{summary?.total || 0} active signals</span> across Rwanda
            </p>
          </div>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-primary-600 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-primary-700 mb-1">Critical Signals</p>
            <p className="text-3xl font-bold text-primary-900">{summary.critical}</p>
            <p className="text-xs text-primary-600 mt-1">Require immediate attention</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent-50 to-accent-100 border-accent-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-accent-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-accent-700 mb-1">High Priority</p>
            <p className="text-3xl font-bold text-accent-900">{summary.high}</p>
            <p className="text-xs text-accent-600 mt-1">Monitor closely</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-primary-500 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-primary-700 mb-1">Volatility Signals</p>
            <p className="text-3xl font-bold text-primary-900">{summary.byType.volatility}</p>
            <p className="text-xs text-primary-600 mt-1">Price fluctuations detected</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent-50 to-primary-50 border-accent-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-accent-500 rounded-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-accent-700 mb-1">Shortage Alerts</p>
            <p className="text-3xl font-bold text-accent-900">{summary.byType.shortage}</p>
            <p className="text-xs text-accent-600 mt-1">Supply issues identified</p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filter Signals</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Materials</label>
            <Input
              placeholder="Search by material name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Signal Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {signalTypes.map(type => (
                <option key={type} value={type} className="capitalize">{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Levels</option>
              {severityLevels.map(sev => (
                <option key={sev} value={sev} className="capitalize">{sev}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredSignals.length}</span> of <span className="font-semibold text-gray-900">{signals.length}</span> active signals
          </p>
        </div>
      </Card>

      {/* Signals List */}
      {filteredSignals.length === 0 ? (
        <EmptyState
          title="No active signals"
          description="All markets are stable. Check back later for new signals."
        />
      ) : (
        <div className="space-y-4">
          {filteredSignals.map(signal => (
            <SignalAlert
              key={signal.id}
              signal={signal}
              onDismiss={() => handleResolveSignal(signal.id)}
              onViewDetails={() => navigate(`/materials/${signal.material_id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
