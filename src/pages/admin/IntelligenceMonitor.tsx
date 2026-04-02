import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { supabaseUntyped as supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/currency';
import { TrendingUp, TrendingDown, AlertTriangle, RefreshCw, Eye } from '@/lib/icons';

interface Signal {
  id: string;
  material_id: string;
  signal_type: string;
  severity: string;
  title: string;
  description: string;
  detected_at: string;
  is_active: boolean;
  material: {
    name: string;
    sector: string;
  };
}

interface Narrative {
  id: string;
  material_id: string;
  narrative_type: string;
  title: string;
  content: string;
  generated_at: string;
  is_published: boolean;
  material: {
    name: string;
  };
}

interface AggregatedPrice {
  id: string;
  material_id: string;
  location: string;
  avg_price: number;
  min_price: number;
  max_price: number;
  sample_count: number;
  confidence_score: number;
  last_updated: string;
  material: {
    name: string;
    unit: string;
  };
}

export default function IntelligenceMonitor() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [prices, setPrices] = useState<AggregatedPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'signals' | 'narratives' | 'prices'>('signals');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [signalsRes, narrativesRes, pricesRes] = await Promise.all([
        supabase
          .from('market_signals')
          .select('*, material:materials(name, sector)')
          .order('detected_at', { ascending: false })
          .limit(50),
        supabase
          .from('market_narratives')
          .select('*, material:materials(name)')
          .order('generated_at', { ascending: false })
          .limit(50),
        supabase
          .from('aggregated_prices')
          .select('*, material:materials(name, unit)')
          .order('last_updated', { ascending: false })
          .limit(50)
      ]);

      if (signalsRes.error) throw signalsRes.error;
      if (narrativesRes.error) throw narrativesRes.error;
      if (pricesRes.error) throw pricesRes.error;

      setSignals(signalsRes.data || []);
      setNarratives(narrativesRes.data || []);
      setPrices(pricesRes.data || []);
    } catch (error) {
      console.error('Error loading intelligence data:', error);
      toast('error', 'Failed to load intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const regenerateSignals = async () => {
    try {
      const { error } = await supabase.rpc('generate_market_signals');
      if (error) throw error;
      toast('success', 'Signals regenerated successfully');
      loadData();
    } catch (error) {
      console.error('Error regenerating signals:', error);
      toast('error', 'Failed to regenerate signals');
    }
  };

  const regenerateNarratives = async () => {
    try {
      const { error } = await supabase.rpc('generate_market_narratives');
      if (error) throw error;
      toast('success', 'Narratives regenerated successfully');
      loadData();
    } catch (error) {
      console.error('Error regenerating narratives:', error);
      toast('error', 'Failed to regenerate narratives');
    }
  };

  const toggleSignalStatus = async (signalId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('market_signals')
        .update({ is_active: !isActive })
        .eq('id', signalId);

      if (error) throw error;
      toast('success', `Signal ${!isActive ? 'activated' : 'deactivated'}`);
      loadData();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error updating signal:', error);
      toast('error', 'Failed to update signal');
    }
  };

  const toggleNarrativeStatus = async (narrativeId: string, isPublished: boolean) => {
    try {
      const { error } = await supabase
        .from('market_narratives')
        .update({ is_published: !isPublished })
        .eq('id', narrativeId);

      if (error) throw error;
      toast('success', `Narrative ${!isPublished ? 'published' : 'unpublished'}`);
      loadData();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error updating narrative:', error);
      toast('error', 'Failed to update narrative');
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="danger">Critical</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge>Medium</Badge>;
      case 'low':
        return <Badge variant="success">Low</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'price_spike':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'price_drop':
        return <TrendingDown className="w-5 h-5 text-green-500" />;
      case 'volatility':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Intelligence Monitor</h1>
            <p className="text-gray-600 mt-2">Monitor market signals, narratives, and price data</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={regenerateSignals}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Signals
            </Button>
            <Button variant="outline" onClick={regenerateNarratives}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Narratives
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Active Signals</p>
            <p className="text-2xl font-bold text-gray-900">
              {signals.filter(s => s.is_active).length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Published Narratives</p>
            <p className="text-2xl font-bold text-gray-900">
              {narratives.filter(n => n.is_published).length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Tracked Materials</p>
            <p className="text-2xl font-bold text-gray-900">{prices.length}</p>
          </Card>
        </div>

        <Card className="mb-6">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('signals')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'signals'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Market Signals ({signals.length})
              </button>
              <button
                onClick={() => setActiveTab('narratives')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'narratives'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Narratives ({narratives.length})
              </button>
              <button
                onClick={() => setActiveTab('prices')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'prices'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Aggregated Prices ({prices.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'signals' && (
              <div className="space-y-4">
                {signals.map((signal) => (
                  <div
                    key={signal.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="p-2 bg-gray-100 rounded">
                      {getSignalIcon(signal.signal_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{signal.title}</h3>
                        {getSeverityBadge(signal.severity)}
                        {signal.is_active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge>Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{signal.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{signal.material?.name}</span>
                        <span className="capitalize">{signal.material?.sector}</span>
                        <span>{new Date(signal.detected_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedItem(signal);
                        setShowDetailModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {signals.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No signals found</p>
                )}
              </div>
            )}

            {activeTab === 'narratives' && (
              <div className="space-y-4">
                {narratives.map((narrative) => (
                  <div
                    key={narrative.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{narrative.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className="capitalize">{narrative.narrative_type}</Badge>
                        {narrative.is_published ? (
                          <Badge variant="success">Published</Badge>
                        ) : (
                          <Badge>Draft</Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedItem(narrative);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{narrative.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{narrative.material?.name}</span>
                      <span>{new Date(narrative.generated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {narratives.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No narratives found</p>
                )}
              </div>
            )}

            {activeTab === 'prices' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Range</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Samples</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {prices.map((price) => (
                      <tr key={price.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{price.material?.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{price.location}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">{formatCurrency(price.avg_price)}</p>
                            <p className="text-xs text-gray-500">per {price.material?.unit}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatCurrency(price.min_price)} - {formatCurrency(price.max_price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{price.sample_count}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${price.confidence_score * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">
                              {Math.round(price.confidence_score * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(price.last_updated).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {prices.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No price data found</p>
                )}
              </div>
            )}
          </div>
        </Card>

        {showDetailModal && selectedItem && (
          <Modal
            isOpen={true}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedItem(null);
            }}
            title={activeTab === 'signals' ? 'Signal Details' : 'Narrative Details'}
          >
            <div className="p-6 space-y-4">
              {activeTab === 'signals' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Title</label>
                    <p className="text-gray-900">{selectedItem.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900">{selectedItem.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Type</label>
                      <p className="text-gray-900 capitalize">{selectedItem.signal_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Severity</label>
                      <div className="mt-1">{getSeverityBadge(selectedItem.severity)}</div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => toggleSignalStatus(selectedItem.id, selectedItem.is_active)}
                      className="flex-1"
                    >
                      {selectedItem.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </>
              )}

              {activeTab === 'narratives' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Title</label>
                    <p className="text-gray-900">{selectedItem.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Content</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedItem.content}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <p className="text-gray-900 capitalize">{selectedItem.narrative_type}</p>
                  </div>
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => toggleNarrativeStatus(selectedItem.id, selectedItem.is_published)}
                      className="flex-1"
                    >
                      {selectedItem.is_published ? 'Unpublish' : 'Publish'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
}
