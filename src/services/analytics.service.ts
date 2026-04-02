import { supabaseUntyped as supabase } from '@/lib/supabase';
import { subDays, format, eachDayOfInterval } from 'date-fns';

export interface WorkerAnalytics {
  totalShiftsCompleted: number;
  totalShiftsApplied: number;
  totalEarnings: number;
  totalHoursWorked: number;
  avgHourlyRate: number;
  reliabilityScore: number;
  avgRating: number;
  noShowCount: number;
  lateCount: number;
  onTimeRate: number;
  earningsByMonth: { month: string; amount: number }[];
  shiftsByCategory: { category: string; count: number }[];
  recentActivity: { date: string; type: string; description: string }[];
}

export interface EmployerAnalytics {
  totalShiftsPosted: number;
  totalWorkersDeployed: number;
  totalSpent: number;
  avgFillRate: number;
  avgTimeToFill: number;
  avgRating: number;
  noShowRate: number;
  shiftsByStatus: { status: string; count: number }[];
  shiftsByCategory: { category: string; count: number }[];
  applicationsByDay: { date: string; count: number }[];
  spendingByMonth: { month: string; amount: number }[];
  topWorkers: { id: string; name: string; shiftsCompleted: number; rating: number }[];
}

export const analyticsService = {
  // =====================================================
  // WORKER ANALYTICS
  // =====================================================

  async getWorkerAnalytics(workerId: string, period: string = '30d'): Promise<WorkerAnalytics> {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = subDays(new Date(), days).toISOString();

    // Get worker profile
    const { data: profile } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('user_id', workerId)
      .single();

    // Get completed deployments
    const { data: deployments } = await supabase
      .from('deployments')
      .select(`
        *,
        shifts(
          category, 
          title,
          employer_id,
          profiles!shifts_employer_id_fkey(
            employer_profiles(company_name)
          )
        )
      `)
      .eq('worker_id', workerId)
      .gte('created_at', startDate);

    // Map deployments to include employer data
    const mappedDeployments = (deployments || []).map(d => ({
      ...d,
      shift: d.shifts ? {
        ...d.shifts,
        employer: d.shifts.profiles?.employer_profiles
      } : null
    }));

    const completedDeployments = mappedDeployments.filter(d => d.status === 'completed');
    const totalEarnings = completedDeployments.reduce((sum, d) => sum + (d.total_pay || 0), 0);
    const totalHours = completedDeployments.reduce((sum, d) => sum + (d.total_hours || 0), 0);

    // Calculate earnings by month
    const earningsByMonth: { month: string; amount: number }[] = [];
    const monthMap = new Map<string, number>();
    completedDeployments.forEach(d => {
      const month = format(new Date(d.scheduled_start), 'MMM yyyy');
      monthMap.set(month, (monthMap.get(month) || 0) + (d.total_pay || 0));
    });
    monthMap.forEach((amount, month) => earningsByMonth.push({ month, amount }));

    // Shifts by category
    const categoryMap = new Map<string, number>();
    completedDeployments.forEach(d => {
      const category = d.shift?.category || 'other';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    const shiftsByCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }));

    // Recent activity
    const recentActivity = mappedDeployments.slice(0, 10).map(d => ({
      date: d.created_at,
      type: d.status,
      description: `${d.shift?.title} at ${d.shift?.employer?.company_name || 'Unknown'}`,
    }));

    const lateDeployments = completedDeployments.filter(d => d.is_late).length;
    const onTimeRate = completedDeployments.length > 0 
      ? Math.round(((completedDeployments.length - lateDeployments) / completedDeployments.length) * 100)
      : 100;

    return {
      totalShiftsCompleted: profile?.total_shifts_completed || 0,
      totalShiftsApplied: profile?.total_shifts_applied || 0,
      totalEarnings,
      totalHoursWorked: Math.round(totalHours * 10) / 10,
      avgHourlyRate: totalHours > 0 ? Math.round((totalEarnings / totalHours) * 100) / 100 : 0,
      reliabilityScore: profile?.reliability_score || 70,
      avgRating: profile?.average_rating || 0,
      noShowCount: profile?.no_show_count || 0,
      lateCount: profile?.late_count || 0,
      onTimeRate,
      earningsByMonth,
      shiftsByCategory,
      recentActivity,
    };
  },

  // =====================================================
  // EMPLOYER ANALYTICS
  // =====================================================

  async getEmployerAnalytics(employerId: string, period: string = '30d'): Promise<EmployerAnalytics> {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = subDays(new Date(), days);

    // Get employer profile
    const { data: profile } = await supabase
      .from('employer_profiles')
      .select('*')
      .eq('user_id', employerId)
      .single();

    // Get shifts
    const { data: shifts } = await supabase
      .from('shifts')
      .select('*')
      .eq('employer_id', employerId)
      .gte('created_at', startDate.toISOString());

    // Get deployments for these shifts
    const shiftIds = shifts?.map(s => s.id) || [];
    const { data: deployments } = shiftIds.length > 0 
      ? await supabase
          .from('deployments')
          .select(`
            *,
            profiles!deployments_worker_id_fkey(
              worker_profiles(user_id, first_name, last_name, average_rating)
            )
          `)
          .in('shift_id', shiftIds)
      : { data: [] };

    const completedDeployments = deployments?.filter(d => d.status === 'completed') || [];
    const totalSpent = completedDeployments.reduce((sum, d) => sum + (d.total_pay || 0), 0);

    // Shifts by status
    const statusMap = new Map<string, number>();
    shifts?.forEach(s => {
      statusMap.set(s.status, (statusMap.get(s.status) || 0) + 1);
    });
    const shiftsByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

    // Shifts by category
    const categoryMap = new Map<string, number>();
    shifts?.forEach(s => {
      categoryMap.set(s.category, (categoryMap.get(s.category) || 0) + 1);
    });
    const shiftsByCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }));

    // Applications by day
    const dateRange = eachDayOfInterval({ start: startDate, end: new Date() });
    const applicationsByDay = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = deployments?.filter(d => 
        format(new Date(d.applied_at), 'yyyy-MM-dd') === dateStr
      ).length || 0;
      return { date: dateStr, count };
    });

    // Spending by month
    const spendingMap = new Map<string, number>();
    completedDeployments.forEach(d => {
      const month = format(new Date(d.scheduled_start), 'MMM yyyy');
      spendingMap.set(month, (spendingMap.get(month) || 0) + (d.total_pay || 0));
    });
    const spendingByMonth = Array.from(spendingMap.entries()).map(([month, amount]) => ({ month, amount }));

    // Top workers
    const workerMap = new Map<string, { name: string; shifts: number; totalRating: number; ratingCount: number }>();
    completedDeployments.forEach(d => {
      if (d.worker) {
        const existing = workerMap.get(d.worker_id) || { 
          name: `${d.worker.first_name} ${d.worker.last_name}`, 
          shifts: 0, 
          totalRating: 0, 
          ratingCount: 0 
        };
        existing.shifts++;
        if (d.employer_rating) {
          existing.totalRating += d.employer_rating;
          existing.ratingCount++;
        }
        workerMap.set(d.worker_id, existing);
      }
    });
    const topWorkers = Array.from(workerMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        shiftsCompleted: data.shifts,
        rating: data.ratingCount > 0 ? Math.round((data.totalRating / data.ratingCount) * 10) / 10 : 0,
      }))
      .sort((a, b) => b.shiftsCompleted - a.shiftsCompleted)
      .slice(0, 10);

    // Calculate fill rate
    const filledShifts = shifts?.filter(s => ['filled', 'completed', 'in_progress'].includes(s.status)).length || 0;
    const avgFillRate = shifts?.length ? Math.round((filledShifts / shifts.length) * 100) : 0;

    // No-show rate
    const noShowDeployments = deployments?.filter(d => d.status === 'no_show').length || 0;
    const confirmedDeployments = deployments?.filter(d => 
      ['confirmed', 'checked_in', 'in_progress', 'completed', 'no_show'].includes(d.status)
    ).length || 0;
    const noShowRate = confirmedDeployments > 0 
      ? Math.round((noShowDeployments / confirmedDeployments) * 100) 
      : 0;

    return {
      totalShiftsPosted: profile?.total_shifts_posted || shifts?.length || 0,
      totalWorkersDeployed: profile?.total_workers_deployed || completedDeployments.length,
      totalSpent,
      avgFillRate,
      avgTimeToFill: 2.5, // TODO: Calculate from actual data
      avgRating: profile?.average_rating || 0,
      noShowRate,
      shiftsByStatus,
      shiftsByCategory,
      applicationsByDay,
      spendingByMonth,
      topWorkers,
    };
  },

  // =====================================================
  // DASHBOARD STATS
  // =====================================================

  async getWorkerDashboardStats(workerId: string) {
    // Get worker profile
    const { data: profile } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('user_id', workerId)
      .single();

    // Get deployments
    const { data: deployments } = await supabase
      .from('deployments')
      .select(`
        *,
        shifts(
          id, 
          title, 
          shift_date, 
          start_time, 
          end_time, 
          pay_rate, 
          location_name, 
          profiles!shifts_employer_id_fkey(
            employer_profiles(user_id, company_name)
          )
        )
      `)
      .eq('worker_id', workerId)
      .order('scheduled_start', { ascending: false });

    // Map the data to expected structure
    const mappedDeployments = (deployments || []).map(d => ({
      ...d,
      shift: d.shifts ? {
        ...d.shifts,
        employer: d.shifts.profiles?.employer_profiles
      } : null
    }));

    const now = new Date();
    const upcomingShifts = mappedDeployments.filter(d => 
      ['confirmed', 'standby'].includes(d.status) && 
      new Date(d.scheduled_start) > now
    );

    const completedShifts = mappedDeployments.filter(d => d.status === 'completed');
    const pendingApplications = mappedDeployments.filter(d => d.status === 'applied');

    const totalEarnings = completedShifts.reduce((sum, d) => sum + (d.total_pay || 0), 0);
    const totalHours = completedShifts.reduce((sum, d) => sum + (d.total_hours || 0), 0);

    return {
      profile,
      stats: {
        totalApplications: mappedDeployments.length,
        upcomingShifts: upcomingShifts.length,
        confirmedShifts: mappedDeployments.filter(d => d.status === 'confirmed').length,
        completedShifts: completedShifts.length,
        pendingApplications: pendingApplications.length,
        totalEarnings,
        totalHours: Math.round(totalHours * 10) / 10,
        avgHourlyRate: totalHours > 0 ? Math.round((totalEarnings / totalHours) * 100) / 100 : 0,
      },
      upcomingShifts: upcomingShifts.slice(0, 5),
      recentApplications: mappedDeployments.slice(0, 5),
    };
  },

  async getEmployerDashboardStats(employerId: string) {
    // Get employer profile
    const { data: profile } = await supabase
      .from('employer_profiles')
      .select('*')
      .eq('user_id', employerId)
      .single();

    // Get shifts
    const { data: shifts } = await supabase
      .from('shifts')
      .select('*')
      .eq('employer_id', employerId)
      .order('created_at', { ascending: false });

    const openShifts = shifts?.filter(s => s.status === 'open') || [];
    const activeShifts = shifts?.filter(s => ['open', 'filled', 'in_progress'].includes(s.status)) || [];

    // Get recent applications with avatar_url
    const shiftIds = shifts?.map(s => s.id) || [];
    const { data: deployments } = shiftIds.length > 0
      ? await supabase
          .from('deployments')
          .select(`
            *,
            shifts(id, title),
            profiles!deployments_worker_id_fkey(
              avatar_url,
              worker_profiles(user_id, first_name, last_name, reliability_score, average_rating)
            )
          `)
          .in('shift_id', shiftIds)
          .order('applied_at', { ascending: false })
          .limit(20)
      : { data: [] };

    const pendingApplications = deployments?.filter(d => d.status === 'applied') || [];
    const confirmedWorkers = deployments?.filter(d => 
      ['confirmed', 'checked_in', 'in_progress'].includes(d.status)
    ) || [];

    // Map deployments to include worker data and avatar
    const mappedDeployments = (deployments || []).map(d => {
      const profiles = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
      const workerProfiles = profiles?.worker_profiles;
      const worker = Array.isArray(workerProfiles) ? workerProfiles[0] : workerProfiles;
      const shift = Array.isArray(d.shifts) ? d.shifts[0] : d.shifts;
      
      return {
        ...d,
        worker: worker,
        profiles: profiles, // Keep profiles for avatar_url
        shift: shift
      };
    });

    const mappedPendingApplications = pendingApplications.map(d => {
      const profiles = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
      const workerProfiles = profiles?.worker_profiles;
      const worker = Array.isArray(workerProfiles) ? workerProfiles[0] : workerProfiles;
      const shift = Array.isArray(d.shifts) ? d.shifts[0] : d.shifts;
      
      return {
        ...d,
        worker: worker,
        profiles: profiles, // Keep profiles for avatar_url
        shift: shift
      };
    });

    // Calculate fill rate
    const totalSlots = activeShifts.reduce((sum, s) => sum + s.slots_needed, 0);
    const filledSlots = activeShifts.reduce((sum, s) => sum + s.slots_confirmed, 0);
    const fillRate = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

    return {
      profile,
      stats: {
        totalShifts: shifts?.length || 0,
        activeShifts: activeShifts.length,
        openShifts: openShifts.length,
        pendingApplications: pendingApplications.length,
        confirmedWorkers: confirmedWorkers.length,
        fillRate,
      },
      recentShifts: shifts?.slice(0, 5) || [],
      recentApplications: mappedDeployments.slice(0, 10),
      pendingReview: mappedPendingApplications.slice(0, 5),
    };
  },
};
