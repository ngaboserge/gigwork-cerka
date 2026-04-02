// Narrative Authority Service - Layer 6
import { supabase } from '../lib/supabase';

export interface MarketNarrative {
  id: string;
  narrative_type: 'weekly' | 'monthly' | 'special' | 'alert' | 'insight';
  title: string;
  summary: string;
  full_narrative: string;
  location: string;
  sectors: string[];
  key_insights: any[];
  supporting_data: Record<string, any>;
  published_at: string;
  author: string;
  views: number;
  featured: boolean;
}

export interface NarrativeTemplate {
  id: string;
  template_name: string;
  trigger_conditions: Record<string, any>;
  narrative_structure: string;
  priority: number;
  active: boolean;
}

// Get market narratives
export async function getMarketNarratives(filters?: {
  location?: string;
  narrative_type?: string;
  featured?: boolean;
  limit?: number;
}) {
  let query = supabase
    .from('market_narratives')
    .select('*')
    .order('published_at', { ascending: false });

  if (filters?.location) {
    query = query.eq('location', filters.location);
  }
  if (filters?.narrative_type) {
    query = query.eq('narrative_type', filters.narrative_type);
  }
  if (filters?.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching narratives:', error);
    return [];
  }

  return data as MarketNarrative[];
}

// Get single narrative by ID
export async function getNarrativeById(id: string): Promise<MarketNarrative | null> {
  const { data, error } = await supabase
    .from('market_narratives')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching narrative:', error);
    return null;
  }

  // Increment view count
  await incrementNarrativeViews(id);

  return data as MarketNarrative;
}

// Get featured narratives
export async function getFeaturedNarratives(limit: number = 3) {
  return getMarketNarratives({ featured: true, limit });
}

// Get latest weekly report
export async function getLatestWeeklyReport(location: string = 'Kigali'): Promise<MarketNarrative | null> {
  const { data, error } = await supabase
    .from('market_narratives')
    .select('*')
    .eq('narrative_type', 'weekly')
    .eq('location', location)
    .order('published_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching weekly report:', error);
    return null;
  }

  return data as MarketNarrative;
}

// Get recent alerts
export async function getRecentAlerts(location?: string, limit: number = 5) {
  return getMarketNarratives({
    location,
    narrative_type: 'alert',
    limit
  });
}

// Generate weekly insight (admin function)
export async function generateWeeklyInsight(location: string = 'Kigali'): Promise<string | null> {
  const { data, error } = await supabase.rpc('generate_weekly_insight', {
    p_location: location
  });

  if (error) {
    console.error('Error generating weekly insight:', error);
    return null;
  }

  return data;
}

// Generate alert narrative for a signal (admin function)
export async function generateAlertNarrative(signalId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('generate_alert_narrative', {
    p_signal_id: signalId
  });

  if (error) {
    console.error('Error generating alert narrative:', error);
    return null;
  }

  return data;
}

// Increment view count
export async function incrementNarrativeViews(narrativeId: string) {
  const { error } = await supabase.rpc('increment_narrative_views', {
    p_narrative_id: narrativeId
  });

  if (error) {
    console.error('Error incrementing views:', error);
  }
}

// Get narrative templates
export async function getNarrativeTemplates() {
  const { data, error } = await supabase
    .from('narrative_templates')
    .select('*')
    .eq('active', true)
    .order('priority', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }

  return data as NarrativeTemplate[];
}

// Get narrative statistics
export async function getNarrativeStats(location?: string) {
  const narratives = await getMarketNarratives({ location, limit: 1000 });

  const stats = {
    total: narratives.length,
    byType: {
      weekly: narratives.filter(n => n.narrative_type === 'weekly').length,
      monthly: narratives.filter(n => n.narrative_type === 'monthly').length,
      alert: narratives.filter(n => n.narrative_type === 'alert').length,
      insight: narratives.filter(n => n.narrative_type === 'insight').length,
      special: narratives.filter(n => n.narrative_type === 'special').length,
    },
    totalViews: narratives.reduce((sum, n) => sum + n.views, 0),
    featured: narratives.filter(n => n.featured).length,
    mostViewed: narratives.sort((a, b) => b.views - a.views).slice(0, 5)
  };

  return stats;
}

// Search narratives
export async function searchNarratives(query: string, filters?: {
  location?: string;
  narrative_type?: string;
  limit?: number;
}) {
  let dbQuery = supabase
    .from('market_narratives')
    .select('*')
    .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
    .order('published_at', { ascending: false });

  if (filters?.location) {
    dbQuery = dbQuery.eq('location', filters.location);
  }
  if (filters?.narrative_type) {
    dbQuery = dbQuery.eq('narrative_type', filters.narrative_type);
  }
  if (filters?.limit) {
    dbQuery = dbQuery.limit(filters.limit);
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error('Error searching narratives:', error);
    return [];
  }

  return data as MarketNarrative[];
}
