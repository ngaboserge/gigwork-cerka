import { create } from 'zustand';
import type { PriceSubmission, PriceSubmissionForm, ReliabilityScore } from '../types/materials.types';
import { priceSubmissionsService } from '../services/priceSubmissions.service';
import { reliabilityService } from '../services/reliability.service';
import { aggregationService } from '../services/aggregation.service';

interface PriceSubmissionsState {
  submissions: PriceSubmission[];
  currentSubmission: Partial<PriceSubmissionForm>;
  reliabilityScore: ReliabilityScore | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setCurrentSubmission: (data: Partial<PriceSubmissionForm>) => void;
  submitPrice: (userId: string) => Promise<PriceSubmission>;
  fetchUserSubmissions: (userId: string, limit?: number) => Promise<void>;
  fetchSubmissionsByMaterial: (materialId: string, location?: string, limit?: number) => Promise<void>;
  fetchReliabilityScore: (userId: string) => Promise<void>;
  reset: () => void;
}

export const usePriceSubmissionsStore = create<PriceSubmissionsState>((set, get) => ({
  submissions: [],
  currentSubmission: {},
  reliabilityScore: null,
  loading: false,
  error: null,

  setCurrentSubmission: (data) => {
    set((state) => ({
      currentSubmission: { ...state.currentSubmission, ...data }
    }));
  },

  submitPrice: async (userId: string) => {
    const { currentSubmission } = get();
    
    if (!currentSubmission.material_id || !currentSubmission.price || !currentSubmission.location) {
      throw new Error('Material, price, and location are required');
    }

    set({ loading: true, error: null });
    try {
      const submission = await priceSubmissionsService.submitPrice(
        currentSubmission as PriceSubmissionForm,
        userId
      );

      // Since we auto-approve, trigger aggregation immediately
      try {
        await aggregationService.computeAggregation(
          submission.material_id,
          submission.location
        );
      } catch (aggError) {
        console.error('Aggregation failed:', aggError);
        // Don't throw - submission was successful
      }

      // Refresh user submissions
      await get().fetchUserSubmissions(userId);
      
      // Refresh reliability score
      await get().fetchReliabilityScore(userId);

      set({ currentSubmission: {}, loading: false });
      return submission;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchUserSubmissions: async (userId: string, limit?: number) => {
    set({ loading: true, error: null });
    try {
      const submissions = await priceSubmissionsService.getUserSubmissions(userId, limit);
      set({ submissions, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchSubmissionsByMaterial: async (materialId: string, location?: string, limit?: number) => {
    set({ loading: true, error: null });
    try {
      const submissions = await priceSubmissionsService.getSubmissions({
        material_id: materialId,
        location,
        status: 'approved',
        limit: limit || 20
      });
      set({ submissions, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchReliabilityScore: async (userId: string) => {
    try {
      const score = await reliabilityService.getReliabilityScore(userId);
      set({ reliabilityScore: score });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  reset: () => {
    set({
      submissions: [],
      currentSubmission: {},
      reliabilityScore: null,
      loading: false,
      error: null
    });
  }
}));
