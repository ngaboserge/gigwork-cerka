import { supabaseUntyped as supabase } from '@/lib/supabase';

export interface Review {
  id: string;
  reviewer_id: string;
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
  status: 'draft' | 'published' | 'flagged' | 'removed';
  verified: boolean;
  helpful_count: number;
  not_helpful_count: number;
  response_text?: string;
  response_at?: string;
  created_at: string;
  updated_at: string;
}

export const reviewsService = {
  // =====================================================
  // CREATE & UPDATE REVIEWS
  // =====================================================

  async createReview(review: {
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
  }, reviewerId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        ...review,
        reviewer_id: reviewerId,
        status: 'published',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  },

  async updateReview(reviewId: string, updates: Partial<Review>) {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  },

  async respondToReview(reviewId: string, responseText: string) {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        response_text: responseText,
        response_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  },

  // =====================================================
  // GET REVIEWS
  // =====================================================

  async getReviewsForUser(userId: string, options?: {
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('reviews')
      .select(`
        *,
        reviewer:profiles!reviews_reviewer_id_fkey(
          id,
          worker_profiles(first_name, last_name),
          employer_profiles(company_name)
        )
      `)
      .eq('reviewed_id', userId)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Review[];
  },

  async getReviewsByUser(userId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewed:profiles!reviews_reviewed_id_fkey(
          id,
          worker_profiles(first_name, last_name),
          employer_profiles(company_name)
        )
      `)
      .eq('reviewer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Review[];
  },

  async getReview(reviewId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', reviewId)
      .single();

    if (error) throw error;
    return data as Review;
  },

  // =====================================================
  // HELPFULNESS
  // =====================================================

  async markReviewHelpful(reviewId: string, userId: string, isHelpful: boolean) {
    const { data, error } = await supabase
      .from('review_helpfulness')
      .upsert({
        review_id: reviewId,
        user_id: userId,
        is_helpful: isHelpful,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserHelpfulnessVote(reviewId: string, userId: string) {
    const { data, error } = await supabase
      .from('review_helpfulness')
      .select('is_helpful')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.is_helpful;
  },

  // =====================================================
  // STATISTICS
  // =====================================================

  async getReviewStats(userId: string) {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating, communication_rating, professionalism_rating, punctuality_rating, quality_rating')
      .eq('reviewed_id', userId)
      .eq('status', 'published');

    if (error) throw error;

    const reviewList = reviews || [];
    const totalReviews = reviewList.length;

    if (totalReviews === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: [0, 0, 0, 0, 0],
        categoryAverages: {
          communication: 0,
          professionalism: 0,
          punctuality: 0,
          quality: 0,
        },
      };
    }

    const avgRating = reviewList.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews;
    
    const distribution = [0, 0, 0, 0, 0];
    reviewList.forEach((r: any) => {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating - 1]++;
      }
    });

    const categoryAverages = {
      communication: reviewList.filter((r: any) => r.communication_rating).reduce((sum: number, r: any) => sum + r.communication_rating, 0) / reviewList.filter((r: any) => r.communication_rating).length || 0,
      professionalism: reviewList.filter((r: any) => r.professionalism_rating).reduce((sum: number, r: any) => sum + r.professionalism_rating, 0) / reviewList.filter((r: any) => r.professionalism_rating).length || 0,
      punctuality: reviewList.filter((r: any) => r.punctuality_rating).reduce((sum: number, r: any) => sum + r.punctuality_rating, 0) / reviewList.filter((r: any) => r.punctuality_rating).length || 0,
      quality: reviewList.filter((r: any) => r.quality_rating).reduce((sum: number, r: any) => sum + r.quality_rating, 0) / reviewList.filter((r: any) => r.quality_rating).length || 0,
    };

    return {
      totalReviews,
      averageRating: Math.round(avgRating * 10) / 10,
      ratingDistribution: distribution,
      categoryAverages,
    };
  },
};
