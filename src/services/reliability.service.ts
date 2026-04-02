import { supabase } from '../lib/supabase';
import type { ReliabilityScore } from '../types/materials.types';

export const reliabilityService = {
  async getReliabilityScore(userId: string): Promise<ReliabilityScore> {
    const { data, error } = await supabase
      .from('reliability_scores')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No score exists, create one with default
      return await this.initializeScore(userId);
    }

    if (error) throw error;
    return data;
  },

  async initializeScore(userId: string): Promise<ReliabilityScore> {
    const { data, error } = await supabase
      .from('reliability_scores')
      .insert({
        user_id: userId,
        score: 50.0,
        total_submissions: 0,
        approved_count: 0,
        rejected_count: 0,
        flagged_count: 0,
        consistency_bonus: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateReliabilityAfterSubmission(userId: string, submissionId: string, approved: boolean): Promise<ReliabilityScore> {
    const currentScore = await this.getReliabilityScore(userId);

    let adjustment = 0;
    if (approved) {
      adjustment = 2; // +2 for approved submission
    } else {
      adjustment = -5; // -5 for rejected submission
    }

    return await this.adjustReliability(userId, adjustment, approved ? 'submission_approved' : 'submission_rejected');
  },

  async adjustReliability(userId: string, adjustment: number, reason: string): Promise<ReliabilityScore> {
    const currentScore = await this.getReliabilityScore(userId);

    // Calculate new score (clamped between 0 and 100)
    let newScore = currentScore.score + adjustment;
    newScore = Math.max(0, Math.min(100, newScore));

    // Update counts based on reason
    const updates: any = {
      score: newScore,
      last_updated: new Date().toISOString()
    };

    if (reason === 'submission_approved') {
      updates.approved_count = currentScore.approved_count + 1;
      updates.total_submissions = currentScore.total_submissions + 1;
    } else if (reason === 'submission_rejected') {
      updates.rejected_count = currentScore.rejected_count + 1;
      updates.total_submissions = currentScore.total_submissions + 1;
    } else if (reason === 'submission_flagged') {
      updates.flagged_count = currentScore.flagged_count + 1;
    }

    // Calculate consistency bonus (for users with 10+ approved submissions)
    if (updates.approved_count >= 10) {
      const approvalRate = updates.approved_count / updates.total_submissions;
      if (approvalRate >= 0.9) {
        updates.consistency_bonus = 5;
        updates.score = Math.min(100, updates.score + 5);
      }
    }

    const { data, error } = await supabase
      .from('reliability_scores')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTopContributors(limit: number = 10): Promise<ReliabilityScore[]> {
    const { data, error } = await supabase
      .from('reliability_scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
};
