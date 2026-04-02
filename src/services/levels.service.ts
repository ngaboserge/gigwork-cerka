import { supabaseUntyped as supabase } from '@/lib/supabase';
import type { WorkerLevel, WorkerBadge, WorkerLevelInfo } from '@/types';

const LEVEL_THRESHOLDS = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  platinum: 3500,
};

const LEVEL_BENEFITS: Record<WorkerLevel, string[]> = {
  bronze: ['Access to all job listings', 'Basic profile badge'],
  silver: ['Priority job notifications', 'Silver badge on profile', '5% lower platform fees'],
  gold: ['Early access to premium jobs', 'Gold badge on profile', '10% lower platform fees', 'Dedicated support'],
  platinum: ['VIP job access', 'Platinum badge on profile', '15% lower platform fees', '24/7 priority support', 'Featured profile'],
};

function calculateLevel(points: number): WorkerLevel {
  if (points >= LEVEL_THRESHOLDS.platinum) return 'platinum';
  if (points >= LEVEL_THRESHOLDS.gold) return 'gold';
  if (points >= LEVEL_THRESHOLDS.silver) return 'silver';
  return 'bronze';
}

function getNextLevelPoints(level: WorkerLevel): number {
  switch (level) {
    case 'bronze': return LEVEL_THRESHOLDS.silver;
    case 'silver': return LEVEL_THRESHOLDS.gold;
    case 'gold': return LEVEL_THRESHOLDS.platinum;
    case 'platinum': return LEVEL_THRESHOLDS.platinum;
  }
}

export const levelsService = {
  async getWorkerLevelInfo(workerId: string): Promise<WorkerLevelInfo> {
    // Get worker points from profile
    const { data: workerProfile, error: profileError } = await supabase
      .from('worker_profiles')
      .select('points, reliability_score, total_shifts_completed')
      .eq('user_id', workerId)
      .single();

    if (profileError) {
      console.error('Error fetching worker profile:', profileError);
      // Return default level info if profile not found
      return {
        level: 'bronze',
        points: 0,
        nextLevelPoints: LEVEL_THRESHOLDS.silver,
        benefits: LEVEL_BENEFITS.bronze,
        badges: [],
      };
    }

    const points = workerProfile?.points || 0;
    const level = calculateLevel(points);

    // Get worker badges
    const { data: badges, error: badgesError } = await supabase
      .from('worker_badges')
      .select('*')
      .eq('worker_id', workerId)
      .order('earned_at', { ascending: false });

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
    }

    const mappedBadges: WorkerBadge[] = (badges || []).map(b => ({
      id: b.id,
      name: b.name,
      description: b.description || '',
      icon: b.icon || 'shield',
      earnedAt: b.earned_at,
      category: b.category as 'achievement' | 'skill' | 'milestone' | 'special',
    }));

    return {
      level,
      points,
      nextLevelPoints: getNextLevelPoints(level),
      benefits: LEVEL_BENEFITS[level],
      badges: mappedBadges,
    };
  },

  async getWorkerBadges(workerId: string): Promise<WorkerBadge[]> {
    const { data, error } = await supabase
      .from('worker_badges')
      .select('*')
      .eq('worker_id', workerId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching badges:', error);
      return [];
    }

    return (data || []).map(b => ({
      id: b.id,
      name: b.name,
      description: b.description || '',
      icon: b.icon || 'shield',
      earnedAt: b.earned_at,
      category: b.category as 'achievement' | 'skill' | 'milestone' | 'special',
    }));
  },

  async getPointsHistory(workerId: string, limit = 50): Promise<{
    id: string;
    eventType: string;
    pointsChange: number;
    pointsBefore: number;
    pointsAfter: number;
    createdAt: string;
    notes?: string;
  }[]> {
    const { data, error } = await supabase
      .from('worker_points_history')
      .select('*')
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching points history:', error);
      return [];
    }

    return (data || []).map(h => ({
      id: h.id,
      eventType: h.event_type,
      pointsChange: h.points_change,
      pointsBefore: h.points_before,
      pointsAfter: h.points_after,
      createdAt: h.created_at,
      notes: h.notes || undefined,
    }));
  },

  // Add points (typically called by backend triggers, but available for manual use)
  async addPoints(
    workerId: string,
    eventType: string,
    shiftId?: string,
    deploymentId?: string,
    notes?: string
  ): Promise<number> {
    const { data, error } = await supabase.rpc('add_worker_points', {
      p_worker_id: workerId,
      p_event_type: eventType,
      p_shift_id: shiftId || null,
      p_deployment_id: deploymentId || null,
      p_notes: notes || null,
    });

    if (error) {
      console.error('Error adding points:', error);
      throw error;
    }

    return data;
  },
};
