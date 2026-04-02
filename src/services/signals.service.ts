// Signal Extraction Service - Layer 3
import { supabase } from '../lib/supabase';

export interface MarketSignal {
  id: string;
  material_id: string;
  location: string;
  signal_type: 'volatility' | 'shortage' | 'surplus' | 'trend' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  detected_at: string;
  resolved_at?: string;
  metadata: Record<string, any>;
  material?: {
    name: string;
    category: string;
    unit: string;
  };
}

export interface PriceTrend {
  id: string;
  material_id: string;
  location: string;
  period: 'daily' | 'weekly' | 'monthly';
  trend_direction: 'up' | 'down' | 'stable';
  change_percent: number;
  momentum: number;
  strength: 'weak' | 'moderate' | 'strong';
  calculated_at: string;
  period_start: string;
  period_end: string;
  material?: {
    name: string;
    category: string;
    unit: string;
  };
}

export interface VolatilityData {
  volatility: number;
  severity: string;
  avg_price: number;
  std_dev: number;
  data_points: number;
}

export interface ShortageData {
  has_shortage: boolean;
  severity: string;
  confidence: number;
  price_change: number;
  availability_change: number;
}

// Get active market signals
export async function getMarketSignals(filters?: {
  location?: string;
  material_id?: string;
  signal_type?: string;
  severity?: string;
  limit?: number;
}) {
  let query = supabase
    .from('market_signals')
    .select(`
      *,
      material:materials(name, category, unit)
    `)
    .is('resolved_at', null)
    .order('detected_at', { ascending: false });

  if (filters?.location) {
    query = query.eq('location', filters.location);
  }
  if (filters?.material_id) {
    query = query.eq('material_id', filters.material_id);
  }
  if (filters?.signal_type) {
    query = query.eq('signal_type', filters.signal_type);
  }
  if (filters?.severity) {
    query = query.eq('severity', filters.severity);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching market signals:', error);
    return [];
  }

  return data as MarketSignal[];
}

// Get price trends
export async function getPriceTrends(filters?: {
  location?: string;
  material_id?: string;
  period?: string;
  limit?: number;
}) {
  let query = supabase
    .from('price_trends')
    .select(`
      *,
      material:materials(name, category, unit)
    `)
    .order('calculated_at', { ascending: false });

  if (filters?.location) {
    query = query.eq('location', filters.location);
  }
  if (filters?.material_id) {
    query = query.eq('material_id', filters.material_id);
  }
  if (filters?.period) {
    query = query.eq('period', filters.period);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching price trends:', error);
    return [];
  }

  return data as PriceTrend[];
}

// Calculate volatility for a material/location
export async function calculateVolatility(
  materialId: string,
  location: string,
  days: number = 30
): Promise<VolatilityData | null> {
  const { data, error } = await supabase.rpc('calculate_volatility', {
    p_material_id: materialId,
    p_location: location,
    p_days: days
  });

  if (error) {
    console.error('Error calculating volatility:', error);
    return null;
  }

  return data?.[0] || null;
}

// Detect shortage for a material/location
export async function detectShortage(
  materialId: string,
  location: string
): Promise<ShortageData | null> {
  const { data, error } = await supabase.rpc('detect_shortage', {
    p_material_id: materialId,
    p_location: location
  });

  if (error) {
    console.error('Error detecting shortage:', error);
    return null;
  }

  return data?.[0] || null;
}

// Calculate trend for a material/location
export async function calculateTrend(
  materialId: string,
  location: string,
  days: number = 30
): Promise<Partial<PriceTrend> | null> {
  const { data, error } = await supabase.rpc('calculate_trend', {
    p_material_id: materialId,
    p_location: location,
    p_days: days
  });

  if (error) {
    console.error('Error calculating trend:', error);
    return null;
  }

  return data?.[0] || null;
}

// Auto-detect all signals (admin function)
export async function autoDetectSignals(): Promise<number> {
  const { data, error } = await supabase.rpc('auto_detect_signals');

  if (error) {
    console.error('Error auto-detecting signals:', error);
    return 0;
  }

  return data || 0;
}

// Get signal summary for dashboard
export async function getSignalSummary(location?: string) {
  const signals = await getMarketSignals({ location, limit: 100 });

  const summary = {
    total: signals.length,
    critical: signals.filter(s => s.severity === 'critical').length,
    high: signals.filter(s => s.severity === 'high').length,
    medium: signals.filter(s => s.severity === 'medium').length,
    low: signals.filter(s => s.severity === 'low').length,
    byType: {
      volatility: signals.filter(s => s.signal_type === 'volatility').length,
      shortage: signals.filter(s => s.signal_type === 'shortage').length,
      surplus: signals.filter(s => s.signal_type === 'surplus').length,
      trend: signals.filter(s => s.signal_type === 'trend').length,
      anomaly: signals.filter(s => s.signal_type === 'anomaly').length,
    }
  };

  return summary;
}

// Resolve a signal (mark as resolved)
export async function resolveSignal(signalId: string) {
  const { error } = await supabase
    .from('market_signals')
    .update({ resolved_at: new Date().toISOString() })
    .eq('id', signalId);

  if (error) {
    console.error('Error resolving signal:', error);
    return false;
  }

  return true;
}
