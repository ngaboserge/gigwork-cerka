import { supabaseUntyped as supabase } from '@/lib/supabase';
import type { FavoriteWorker, FavoriteEmployer } from '@/types';

interface FavoriteWorkerRow {
  id: string;
  employer_id: string;
  worker_id: string;
  notes: string | null;
  hired_count: number;
  last_hired_at: string | null;
  added_at: string;
  worker_profile?: {
    first_name: string;
    last_name: string;
    average_rating: number | null;
  };
  profile?: {
    avatar_url: string | null;
  };
  certifications?: { certification_type: string }[];
}

interface FavoriteEmployerRow {
  id: string;
  worker_id: string;
  employer_id: string;
  notes: string | null;
  worked_count: number;
  last_worked_at: string | null;
  added_at: string;
  employer_profile?: {
    company_name: string;
    average_rating: number | null;
  };
  profile?: {
    avatar_url: string | null;
  };
}

export const favoritesService = {
  // ==================== FAVORITE WORKERS (for employers) ====================
  
  async getFavoriteWorkers(employerId: string): Promise<FavoriteWorker[]> {
    const { data, error } = await supabase
      .from('favorite_workers')
      .select(`
        *,
        worker_profile:worker_id(
          first_name:worker_profiles(first_name),
          last_name:worker_profiles(last_name),
          average_rating:worker_profiles(average_rating)
        ),
        profile:worker_id(avatar_url),
        certifications:worker_id(certification_type:certifications(certification_type))
      `)
      .eq('employer_id', employerId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorite workers:', error);
      throw error;
    }

    return (data || []).map((row: FavoriteWorkerRow) => ({
      id: row.id,
      workerId: row.worker_id,
      workerName: `${row.worker_profile?.first_name || ''} ${row.worker_profile?.last_name || ''}`.trim() || 'Unknown Worker',
      workerAvatar: row.profile?.avatar_url || undefined,
      workerRating: row.worker_profile?.average_rating || 0,
      workerSkills: row.certifications?.map(c => c.certification_type) || [],
      employerId: row.employer_id,
      notes: row.notes || undefined,
      hiredCount: row.hired_count,
      lastHiredAt: row.last_hired_at || undefined,
      addedAt: row.added_at,
    }));
  },

  async addFavoriteWorker(employerId: string, workerId: string, notes?: string): Promise<FavoriteWorker> {
    const { data, error } = await supabase
      .from('favorite_workers')
      .insert({
        employer_id: employerId,
        worker_id: workerId,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      workerId: data.worker_id,
      workerName: 'Worker',
      workerAvatar: undefined,
      workerRating: 0,
      workerSkills: [],
      employerId: data.employer_id,
      notes: data.notes || undefined,
      hiredCount: data.hired_count,
      lastHiredAt: data.last_hired_at || undefined,
      addedAt: data.added_at,
    };
  },

  async removeFavoriteWorker(employerId: string, workerId: string): Promise<void> {
    const { error } = await supabase
      .from('favorite_workers')
      .delete()
      .eq('employer_id', employerId)
      .eq('worker_id', workerId);

    if (error) throw error;
  },

  async updateFavoriteWorkerNotes(employerId: string, workerId: string, notes: string): Promise<void> {
    const { error } = await supabase
      .from('favorite_workers')
      .update({ notes })
      .eq('employer_id', employerId)
      .eq('worker_id', workerId);

    if (error) throw error;
  },

  async isWorkerFavorite(employerId: string, workerId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorite_workers')
      .select('id')
      .eq('employer_id', employerId)
      .eq('worker_id', workerId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  // ==================== FAVORITE EMPLOYERS (for workers) ====================

  async getFavoriteEmployers(workerId: string): Promise<FavoriteEmployer[]> {
    const { data, error } = await supabase
      .from('favorite_employers')
      .select(`
        *,
        employer_profile:employer_id(
          company_name:employer_profiles(company_name),
          average_rating:employer_profiles(average_rating)
        ),
        profile:employer_id(avatar_url)
      `)
      .eq('worker_id', workerId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorite employers:', error);
      throw error;
    }

    return (data || []).map((row: FavoriteEmployerRow) => ({
      id: row.id,
      employerId: row.employer_id,
      employerName: row.employer_profile?.company_name || 'Unknown Company',
      employerLogo: row.profile?.avatar_url || undefined,
      employerRating: row.employer_profile?.average_rating || 0,
      companyName: row.employer_profile?.company_name || 'Unknown Company',
      workerId: row.worker_id,
      notes: row.notes || undefined,
      workedCount: row.worked_count,
      lastWorkedAt: row.last_worked_at || undefined,
      addedAt: row.added_at,
    }));
  },

  async addFavoriteEmployer(workerId: string, employerId: string, notes?: string): Promise<FavoriteEmployer> {
    const { data, error } = await supabase
      .from('favorite_employers')
      .insert({
        worker_id: workerId,
        employer_id: employerId,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      employerId: data.employer_id,
      employerName: 'Employer',
      employerLogo: undefined,
      employerRating: 0,
      companyName: 'Company',
      workerId: data.worker_id,
      notes: data.notes || undefined,
      workedCount: data.worked_count,
      lastWorkedAt: data.last_worked_at || undefined,
      addedAt: data.added_at,
    };
  },

  async removeFavoriteEmployer(workerId: string, employerId: string): Promise<void> {
    const { error } = await supabase
      .from('favorite_employers')
      .delete()
      .eq('worker_id', workerId)
      .eq('employer_id', employerId);

    if (error) throw error;
  },

  async updateFavoriteEmployerNotes(workerId: string, employerId: string, notes: string): Promise<void> {
    const { error } = await supabase
      .from('favorite_employers')
      .update({ notes })
      .eq('worker_id', workerId)
      .eq('employer_id', employerId);

    if (error) throw error;
  },

  async isEmployerFavorite(workerId: string, employerId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorite_employers')
      .select('id')
      .eq('worker_id', workerId)
      .eq('employer_id', employerId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },
};
