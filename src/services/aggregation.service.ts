import { supabase } from '../lib/supabase';
import type { AggregatedPrice, PriceHistoryPoint } from '../types/materials.types';

export const aggregationService = {
  async getAggregatedPrice(materialId: string, location: string): Promise<AggregatedPrice | null> {
    const { data, error } = await supabase
      .from('aggregated_prices')
      .select('*, materials(*)')
      .eq('material_id', materialId)
      .eq('location', location)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getAllAggregatedPrices(location?: string): Promise<AggregatedPrice[]> {
    let query = supabase
      .from('aggregated_prices')
      .select('*, materials(*)')
      .order('last_updated', { ascending: false });

    if (location) {
      query = query.eq('location', location);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getPriceHistory(materialId: string, location: string, days: number = 30): Promise<PriceHistoryPoint[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('material_id', materialId)
      .eq('location', location)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async computeAggregation(materialId: string, location: string): Promise<AggregatedPrice> {
    // Get approved submissions from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: submissions, error: submissionsError } = await supabase
      .from('price_submissions')
      .select('price, user_id')
      .eq('material_id', materialId)
      .eq('location', location)
      .eq('status', 'approved')
      .gte('submitted_at', thirtyDaysAgo.toISOString());

    if (submissionsError) throw submissionsError;

    if (!submissions || submissions.length === 0) {
      throw new Error('No approved submissions found for aggregation');
    }

    // Get reliability scores for weighting
    const userIds = [...new Set(submissions.map(s => s.user_id))];
    const { data: scores, error: scoresError } = await supabase
      .from('reliability_scores')
      .select('user_id, score')
      .in('user_id', userIds);

    if (scoresError) throw scoresError;

    const scoreMap = new Map(scores?.map(s => [s.user_id, s.score]) || []);

    // Calculate weighted median, min, max
    const prices = submissions.map(s => s.price).sort((a, b) => a - b);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Simple median calculation (can be enhanced with reliability weighting)
    const medianPrice = prices[Math.floor(prices.length / 2)];

    // Upsert aggregated price
    const { data, error } = await supabase
      .from('aggregated_prices')
      .upsert({
        material_id: materialId,
        location: location,
        median_price: medianPrice,
        min_price: minPrice,
        max_price: maxPrice,
        submission_count: submissions.length,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'material_id,location'
      })
      .select('*, materials(*)')
      .single();

    if (error) throw error;

    // Also update price history for today
    await this.updatePriceHistory(materialId, location, medianPrice, minPrice, maxPrice, submissions.length);

    return data;
  },

  async updatePriceHistory(
    materialId: string,
    location: string,
    medianPrice: number,
    minPrice: number,
    maxPrice: number,
    count: number
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('price_history')
      .upsert({
        material_id: materialId,
        location: location,
        date: today,
        median_price: medianPrice,
        min_price: minPrice,
        max_price: maxPrice,
        submission_count: count
      }, {
        onConflict: 'material_id,location,date'
      });

    if (error) throw error;
  },

  calculateTrend(history: PriceHistoryPoint[]): { indicator: 'up' | 'down' | 'stable'; percentage: number } {
    if (history.length < 2) {
      return { indicator: 'stable', percentage: 0 };
    }

    const latest = history[history.length - 1];
    const previous = history[history.length - 2];

    const change = ((latest.median_price - previous.median_price) / previous.median_price) * 100;

    if (Math.abs(change) < 5) {
      return { indicator: 'stable', percentage: change };
    } else if (change > 0) {
      return { indicator: 'up', percentage: change };
    } else {
      return { indicator: 'down', percentage: change };
    }
  }
};
