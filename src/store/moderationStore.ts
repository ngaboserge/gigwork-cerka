import { create } from 'zustand';
import type { PriceSubmission, VerificationRequest } from '../types/materials.types';
import { moderationService } from '../services/moderation.service';

interface ModerationState {
  flaggedSubmissions: PriceSubmission[];
  verificationRequests: VerificationRequest[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchFlaggedSubmissions: () => Promise<void>;
  moderateSubmission: (submissionId: string, action: 'approve' | 'reject', adminId: string, adminNotes?: string) => Promise<void>;
  fetchVerificationRequests: (status?: 'pending' | 'approved' | 'rejected') => Promise<void>;
  processVerification: (userId: string, approved: boolean, adminId: string, reason?: string) => Promise<void>;
  createVerificationRequest: (userId: string, data: {
    business_name?: string;
    business_description?: string;
    documents?: string[];
  }) => Promise<void>;
  reset: () => void;
}

export const useModerationStore = create<ModerationState>((set, get) => ({
  flaggedSubmissions: [],
  verificationRequests: [],
  loading: false,
  error: null,

  fetchFlaggedSubmissions: async () => {
    set({ loading: true, error: null });
    try {
      const submissions = await moderationService.getFlaggedSubmissions();
      set({ flaggedSubmissions: submissions, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  moderateSubmission: async (submissionId, action, adminId, adminNotes) => {
    set({ loading: true, error: null });
    try {
      await moderationService.moderateSubmission(submissionId, action, adminId, adminNotes);
      
      // Remove from flagged list
      set((state) => ({
        flaggedSubmissions: state.flaggedSubmissions.filter(s => s.id !== submissionId),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchVerificationRequests: async (status) => {
    set({ loading: true, error: null });
    try {
      const requests = await moderationService.getVerificationRequests(status);
      set({ verificationRequests: requests, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  processVerification: async (userId, approved, adminId, reason) => {
    set({ loading: true, error: null });
    try {
      await moderationService.processVerification(userId, approved, adminId, reason);
      
      // Refresh verification requests
      await get().fetchVerificationRequests('pending');
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createVerificationRequest: async (userId, data) => {
    set({ loading: true, error: null });
    try {
      await moderationService.createVerificationRequest(userId, data);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  reset: () => {
    set({
      flaggedSubmissions: [],
      verificationRequests: [],
      loading: false,
      error: null
    });
  }
}));
