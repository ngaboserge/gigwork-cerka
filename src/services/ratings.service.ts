import { supabaseUntyped as supabase } from '@/lib/supabase';

export interface Rating {
  id: string;
  deployment_id: string;
  rater_id: string;
  rated_id: string;
  rating: number;
  feedback?: string;
  rating_type: 'worker_to_employer' | 'employer_to_worker';
  created_at: string;
}

export interface RatingWithDetails extends Rating {
  shift?: {
    id: string;
    title: string;
    shift_date: string;
  };
  rater?: {
    name: string;
    avatar_url?: string;
  };
}

// Helper to safely access nested data
const getNestedValue = (obj: any, path: string): any => {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = Array.isArray(current) ? current[0]?.[part] : current[part];
  }
  return current;
};

export const ratingsService = {
  // =====================================================
  // SUBMIT RATINGS
  // =====================================================

  // Worker rates employer after shift
  async rateEmployer(
    deploymentId: string,
    workerId: string,
    rating: number,
    feedback?: string
  ) {
    // Update deployment with worker's rating
    const { data: deployment, error: depError } = await supabase
      .from('deployments')
      .update({
        worker_rating: rating,
        worker_feedback: feedback,
      })
      .eq('id', deploymentId)
      .eq('worker_id', workerId)
      .select('shifts(employer_id)')
      .single();

    if (depError) throw depError;

    // Update employer's average rating
    const employerId = getNestedValue(deployment, 'shifts.employer_id');
    if (employerId) {
      await this.updateEmployerAverageRating(employerId);
    }

    return deployment;
  },

  // Employer rates worker after shift
  async rateWorker(
    deploymentId: string,
    employerId: string,
    rating: number,
    feedback?: string
  ) {
    // Verify employer owns the shift
    const { data: deployment, error: verifyError } = await supabase
      .from('deployments')
      .select('worker_id, shifts!inner(employer_id)')
      .eq('id', deploymentId)
      .single();

    if (verifyError) throw verifyError;
    
    const shiftEmployerId = getNestedValue(deployment, 'shifts.employer_id');
    if (shiftEmployerId !== employerId) {
      throw new Error('Unauthorized to rate this worker');
    }

    // Update deployment with employer's rating
    const { error: updateError } = await supabase
      .from('deployments')
      .update({
        employer_rating: rating,
        employer_feedback: feedback,
      })
      .eq('id', deploymentId);

    if (updateError) throw updateError;

    // Update worker's average rating and reliability score
    const workerId = deployment?.worker_id;
    if (workerId) {
      await this.updateWorkerAverageRating(workerId);
      
      // Update reliability score based on rating
      if (rating >= 4) {
        await supabase.rpc('update_reliability_score', {
          p_worker_id: workerId,
          p_event_type: rating === 5 ? 'five_star_rating' : 'four_star_rating',
          p_deployment_id: deploymentId,
        });
      } else if (rating <= 2) {
        await supabase.rpc('update_reliability_score', {
          p_worker_id: workerId,
          p_event_type: 'low_rating',
          p_deployment_id: deploymentId,
        });
      }
    }

    return deployment;
  },

  // =====================================================
  // GET RATINGS
  // =====================================================

  // Get ratings received by a worker
  async getWorkerRatings(workerId: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<RatingWithDetails[]> {
    let query = supabase
      .from('deployments')
      .select(`
        id,
        employer_rating,
        employer_feedback,
        created_at,
        shifts(
          id,
          title,
          shift_date,
          employer_id,
          profiles!shifts_employer_id_fkey(
            employer_profiles(company_name, user_id)
          )
        )
      `)
      .eq('worker_id', workerId)
      .not('employer_rating', 'is', null)
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((d: any) => {
      const shifts = Array.isArray(d.shifts) ? d.shifts[0] : d.shifts;
      const profiles = shifts?.profiles;
      const employerProfiles = Array.isArray(profiles) ? profiles[0]?.employer_profiles : profiles?.employer_profiles;
      const employer = Array.isArray(employerProfiles) ? employerProfiles[0] : employerProfiles;
      
      return {
        id: d.id,
        deployment_id: d.id,
        rater_id: employer?.user_id || '',
        rated_id: workerId,
        rating: d.employer_rating!,
        feedback: d.employer_feedback || undefined,
        rating_type: 'employer_to_worker' as const,
        created_at: d.created_at,
        shift: shifts ? {
          id: shifts.id,
          title: shifts.title,
          shift_date: shifts.shift_date,
        } : undefined,
        rater: employer ? {
          name: employer.company_name,
        } : undefined,
      };
    });
  },

  // Get ratings received by an employer
  async getEmployerRatings(employerId: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<RatingWithDetails[]> {
    let query = supabase
      .from('deployments')
      .select(`
        id,
        worker_rating,
        worker_feedback,
        created_at,
        profiles!deployments_worker_id_fkey(
          worker_profiles(user_id, first_name, last_name)
        ),
        shifts!inner(
          id,
          title,
          shift_date,
          employer_id
        )
      `)
      .eq('shifts.employer_id', employerId)
      .not('worker_rating', 'is', null)
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((d: any) => {
      const profiles = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
      const workerProfiles = profiles?.worker_profiles;
      const worker = Array.isArray(workerProfiles) ? workerProfiles[0] : workerProfiles;
      const shifts = Array.isArray(d.shifts) ? d.shifts[0] : d.shifts;
      
      return {
        id: d.id,
        deployment_id: d.id,
        rater_id: worker?.user_id || '',
        rated_id: employerId,
        rating: d.worker_rating!,
        feedback: d.worker_feedback || undefined,
        rating_type: 'worker_to_employer' as const,
        created_at: d.created_at,
        shift: shifts ? {
          id: shifts.id,
          title: shifts.title,
          shift_date: shifts.shift_date,
        } : undefined,
        rater: worker ? {
          name: `${worker.first_name} ${worker.last_name}`,
        } : undefined,
      };
    });
  },

  // Get pending ratings (shifts completed but not yet rated)
  async getPendingRatings(userId: string, role: 'worker' | 'employer') {
    if (role === 'worker') {
      const { data, error } = await supabase
        .from('deployments')
        .select(`
          id,
          shifts(
            id,
            title,
            shift_date,
            profiles!shifts_employer_id_fkey(
              employer_profiles(company_name)
            )
          )
        `)
        .eq('worker_id', userId)
        .eq('status', 'completed')
        .is('worker_rating', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the response
      return (data || []).map((d: any) => {
        const shifts = Array.isArray(d.shifts) ? d.shifts[0] : d.shifts;
        const profiles = shifts?.profiles;
        const employerProfiles = Array.isArray(profiles) ? profiles[0]?.employer_profiles : profiles?.employer_profiles;
        const employer = Array.isArray(employerProfiles) ? employerProfiles[0] : employerProfiles;
        
        return {
          ...d,
          shift: shifts ? {
            ...shifts,
            employer
          } : null
        };
      });
    } else {
      const { data, error } = await supabase
        .from('deployments')
        .select(`
          id,
          profiles!deployments_worker_id_fkey(
            worker_profiles(user_id, first_name, last_name)
          ),
          shifts!inner(
            id,
            title,
            shift_date,
            employer_id
          )
        `)
        .eq('shifts.employer_id', userId)
        .eq('status', 'completed')
        .is('employer_rating', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  },

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  async updateWorkerAverageRating(workerId: string) {
    const { data: ratings } = await supabase
      .from('deployments')
      .select('employer_rating')
      .eq('worker_id', workerId)
      .not('employer_rating', 'is', null);

    if (ratings && ratings.length > 0) {
      const avgRating = ratings.reduce((sum: number, r: any) => sum + r.employer_rating!, 0) / ratings.length;
      await supabase
        .from('worker_profiles')
        .update({ 
          average_rating: Math.round(avgRating * 10) / 10,
          total_ratings: ratings.length,
        })
        .eq('user_id', workerId);
    }
  },

  async updateEmployerAverageRating(employerId: string) {
    const { data: ratings } = await supabase
      .from('deployments')
      .select('worker_rating, shifts!inner(employer_id)')
      .eq('shifts.employer_id', employerId)
      .not('worker_rating', 'is', null);

    if (ratings && ratings.length > 0) {
      const avgRating = ratings.reduce((sum: number, r: any) => sum + r.worker_rating!, 0) / ratings.length;
      await supabase
        .from('employer_profiles')
        .update({ 
          average_rating: Math.round(avgRating * 10) / 10,
          total_ratings: ratings.length,
        })
        .eq('user_id', employerId);
    }
  },

  // Get rating statistics
  async getRatingStats(userId: string, role: 'worker' | 'employer') {
    const ratings = role === 'worker' 
      ? await this.getWorkerRatings(userId, { limit: 100 })
      : await this.getEmployerRatings(userId, { limit: 100 });

    const distribution = [0, 0, 0, 0, 0]; // 1-5 stars
    ratings.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating - 1]++;
      }
    });

    const total = ratings.length;
    const average = total > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / total 
      : 0;

    return {
      total,
      average: Math.round(average * 10) / 10,
      distribution: distribution.map((count, i) => ({
        stars: i + 1,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      })),
    };
  },
};
