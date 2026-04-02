import { supabase } from '../lib/supabase';
import type { PriceSubmission, VerificationRequest } from '../types/materials.types';
import { notificationsService } from './notifications.service';
import { reliabilityService } from './reliability.service';
import { aggregationService } from './aggregation.service';

export const moderationService = {
  async getFlaggedSubmissions(): Promise<PriceSubmission[]> {
    const { data, error } = await supabase
      .from('price_submissions')
      .select(`
        *,
        materials(*),
        profiles!price_submissions_user_id_fkey(id, full_name)
      `)
      .eq('status', 'flagged')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async moderateSubmission(submissionId: string, action: 'approve' | 'reject', adminId: string, adminNotes?: string): Promise<PriceSubmission> {
    const status = action === 'approve' ? 'approved' : 'rejected';

    const { data: submission, error } = await supabase
      .from('price_submissions')
      .update({
        status,
        moderated_at: new Date().toISOString(),
        moderated_by: adminId,
        admin_notes: adminNotes
      })
      .eq('id', submissionId)
      .select('*, materials(*)')
      .single();

    if (error) throw error;

    // Update reliability score
    await reliabilityService.updateReliabilityAfterSubmission(
      submission.user_id,
      submissionId,
      action === 'approve'
    );

    // If approved, recompute aggregation
    if (action === 'approve') {
      try {
        await aggregationService.computeAggregation(submission.material_id, submission.location);
      } catch (e) {
        console.error('Failed to recompute aggregation:', e);
      }
    }

    // Notify user
    await notificationsService.createNotification({
      user_id: submission.user_id,
      type: 'moderation_action',
      title: `Price Submission ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      message: `Your price submission for ${submission.materials?.name} has been ${action === 'approve' ? 'approved' : 'rejected'}.${adminNotes ? ` Reason: ${adminNotes}` : ''}`,
      data: { submission_id: submissionId }
    });

    return submission;
  },

  async checkOutlier(materialId: string, location: string, price: number): Promise<boolean> {
    const aggregated = await aggregationService.getAggregatedPrice(materialId, location);

    if (!aggregated) {
      return false; // No baseline to compare against
    }

    const deviation = Math.abs((price - aggregated.median_price) / aggregated.median_price);
    return deviation > 0.5; // 50% deviation threshold
  },

  async flagSubmissionAsOutlier(submissionId: string): Promise<void> {
    const { error } = await supabase
      .from('price_submissions')
      .update({ status: 'flagged' })
      .eq('id', submissionId);

    if (error) throw error;

    // Get submission details
    const { data: submission } = await supabase
      .from('price_submissions')
      .select('*, materials(*)')
      .eq('id', submissionId)
      .single();

    if (submission) {
      // Update reliability score
      await reliabilityService.adjustReliability(submission.user_id, -2, 'submission_flagged');

      // Notify admins (get all admin users)
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (admins) {
        for (const admin of admins) {
          await notificationsService.createNotification({
            user_id: admin.id,
            type: 'price_flagged',
            title: 'Price Submission Flagged',
            message: `A price submission for ${submission.materials?.name} has been flagged as an outlier.`,
            data: { submission_id: submissionId }
          });
        }
      }
    }
  },

  async getVerificationRequests(status?: 'pending' | 'approved' | 'rejected'): Promise<VerificationRequest[]> {
    let query = supabase
      .from('verification_requests')
      .select(`
        *,
        profiles!verification_requests_user_id_fkey(id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async processVerification(userId: string, approved: boolean, adminId: string, reason?: string): Promise<void> {
    const status = approved ? 'approved' : 'rejected';

    // Update verification request
    const { error: requestError } = await supabase
      .from('verification_requests')
      .update({
        status,
        processed_at: new Date().toISOString(),
        processed_by: adminId,
        admin_notes: reason
      })
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (requestError) throw requestError;

    // Update profile
    if (approved) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_verified_supplier: true })
        .eq('id', userId);

      if (profileError) throw profileError;
    }

    // Notify user
    await notificationsService.createNotification({
      user_id: userId,
      type: approved ? 'verification_approved' : 'verification_rejected',
      title: `Verification ${approved ? 'Approved' : 'Rejected'}`,
      message: approved
        ? 'Congratulations! Your supplier verification has been approved.'
        : `Your supplier verification has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      data: { verification_status: status }
    });
  },

  async createVerificationRequest(userId: string, data: {
    business_name?: string;
    business_description?: string;
    documents?: string[];
  }): Promise<VerificationRequest> {
    const { data: request, error } = await supabase
      .from('verification_requests')
      .insert({
        user_id: userId,
        ...data,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return request;
  }
};
