import { create } from 'zustand';
import { reviewsService, type Review } from '@/services/reviews.service';
import { useAuthStore } from './authStore';
import { mockReviews } from '@/data/mock';

interface ReviewState {
  reviews: Review[];
  myReviews: Review[];
  loading: boolean;
  error: string | null;
  
  // Fetch reviews
  fetchReviewsForUser: (userId: string) => Promise<void>;
  fetchMyReviews: () => Promise<void>;
  
  // Create & update
  createReview: (review: {
    reviewed_id: string;
    deployment_id?: string;
    shift_id?: string;
    rating: number;
    title?: string;
    review_text: string;
    pros?: string[];
    cons?: string[];
    communication_rating?: number;
    professionalism_rating?: number;
    punctuality_rating?: number;
    quality_rating?: number;
  }) => Promise<Review>;
  updateReview: (reviewId: string, updates: Partial<Review>) => Promise<void>;
  respondToReview: (reviewId: string, responseText: string) => Promise<void>;
  
  // Helpfulness
  markReviewHelpful: (reviewId: string, isHelpful: boolean) => Promise<void>;
  
  // Stats
  getReviewStats: (userId: string) => Promise<any>;
}

export const useReviewStore = create<ReviewState>((set) => ({
  reviews: [],
  myReviews: [],
  loading: false,
  error: null,

  fetchReviewsForUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const reviews = await reviewsService.getReviewsForUser(userId);
      set({ reviews, loading: false });
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      set({ reviews: mockReviews as any, loading: false, error: 'Failed to load reviews' });
    }
  },

  fetchMyReviews: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ myReviews: [], loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const reviews = await reviewsService.getReviewsByUser(user.id);
      set({ myReviews: reviews, loading: false });
    } catch (error) {
      console.error('Failed to fetch my reviews:', error);
      set({ myReviews: [], loading: false, error: 'Failed to load your reviews' });
    }
  },

  createReview: async (reviewData) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');

    set({ loading: true, error: null });
    try {
      const review = await reviewsService.createReview(reviewData, user.id);
      set(state => ({
        myReviews: [review, ...state.myReviews],
        loading: false,
      }));
      return review;
    } catch (error: any) {
      console.error('Failed to create review:', error);
      set({ loading: false, error: error.message || 'Failed to create review' });
      throw error;
    }
  },

  updateReview: async (reviewId, updates) => {
    set({ loading: true, error: null });
    try {
      const review = await reviewsService.updateReview(reviewId, updates);
      set(state => ({
        myReviews: state.myReviews.map(r => r.id === reviewId ? review : r),
        reviews: state.reviews.map(r => r.id === reviewId ? review : r),
        loading: false,
      }));
    } catch (error: any) {
      console.error('Failed to update review:', error);
      set({ loading: false, error: error.message || 'Failed to update review' });
      throw error;
    }
  },

  respondToReview: async (reviewId, responseText) => {
    set({ loading: true, error: null });
    try {
      const review = await reviewsService.respondToReview(reviewId, responseText);
      set(state => ({
        reviews: state.reviews.map(r => r.id === reviewId ? review : r),
        loading: false,
      }));
    } catch (error: any) {
      console.error('Failed to respond to review:', error);
      set({ loading: false, error: error.message || 'Failed to respond' });
      throw error;
    }
  },

  markReviewHelpful: async (reviewId, isHelpful) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      await reviewsService.markReviewHelpful(reviewId, user.id, isHelpful);
      
      // Optimistically update the count
      set(state => ({
        reviews: state.reviews.map(r => {
          if (r.id === reviewId) {
            return {
              ...r,
              helpful_count: isHelpful ? r.helpful_count + 1 : r.helpful_count,
              not_helpful_count: !isHelpful ? r.not_helpful_count + 1 : r.not_helpful_count,
            };
          }
          return r;
        }),
      }));
    } catch (error) {
      console.error('Failed to mark review helpful:', error);
    }
  },

  getReviewStats: async (userId) => {
    try {
      return await reviewsService.getReviewStats(userId);
    } catch (error) {
      console.error('Failed to get review stats:', error);
      return null;
    }
  },
}));
