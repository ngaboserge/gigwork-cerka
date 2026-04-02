import { create } from 'zustand';
import type { AggregatedPrice, PriceHistoryPoint, TrendIndicator } from '../types/materials.types';
import { aggregationService } from '../services/aggregation.service';

interface AggregationState {
  aggregatedPrices: AggregatedPrice[];
  selectedPrice: AggregatedPrice | null;
  priceHistory: PriceHistoryPoint[];
  trend: { indicator: TrendIndicator; percentage: number } | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAggregatedPrices: (location?: string) => Promise<void>;
  fetchAggregatedPrice: (materialId: string, location: string) => Promise<void>;
  fetchPriceHistory: (materialId: string, location: string, days?: number) => Promise<void>;
  computeTrend: () => void;
  reset: () => void;
}

export const useAggregationStore = create<AggregationState>((set, get) => ({
  aggregatedPrices: [],
  selectedPrice: null,
  priceHistory: [],
  trend: null,
  loading: false,
  error: null,

  fetchAggregatedPrices: async (location?: string) => {
    set({ loading: true, error: null });
    try {
      const prices = await aggregationService.getAllAggregatedPrices(location);
      set({ aggregatedPrices: prices, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchAggregatedPrice: async (materialId: string, location: string) => {
    set({ loading: true, error: null });
    try {
      const price = await aggregationService.getAggregatedPrice(materialId, location);
      set({ selectedPrice: price, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchPriceHistory: async (materialId: string, location: string, days = 30) => {
    set({ loading: true, error: null });
    try {
      const history = await aggregationService.getPriceHistory(materialId, location, days);
      set({ priceHistory: history, loading: false });
      
      // Auto-compute trend after fetching history
      get().computeTrend();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  computeTrend: () => {
    const { priceHistory } = get();
    if (priceHistory.length > 0) {
      const trend = aggregationService.calculateTrend(priceHistory);
      set({ trend });
    }
  },

  reset: () => {
    set({
      aggregatedPrices: [],
      selectedPrice: null,
      priceHistory: [],
      trend: null,
      loading: false,
      error: null
    });
  }
}));
