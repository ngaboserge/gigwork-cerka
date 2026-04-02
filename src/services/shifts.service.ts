import { supabaseUntyped as supabase } from '@/lib/supabase';
import type { Database, Shift } from '@/lib/database.types';

type ShiftInsert = Database['public']['Tables']['shifts']['Insert'];
type ShiftUpdate = Database['public']['Tables']['shifts']['Update'];

export const shiftsService = {
  // =====================================================
  // WORKER: Browse Available Shifts
  // =====================================================
  
  async getAvailableShifts(filters?: {
    category?: string;
    date?: string;
    city?: string;
    minPay?: number;
    urgency?: string;
  }): Promise<any[]> {
    let query = supabase
      .from('shifts')
      .select(`
        *,
        profiles!shifts_employer_id_fkey(
          avatar_url,
          employer_profiles(
            company_name,
            company_type,
            average_rating,
            verified
          )
        )
      `)
      .eq('status', 'open')
      .gte('shift_date', new Date().toISOString().split('T')[0])
      .order('shift_date', { ascending: true })
      .order('urgency', { ascending: false }); // Critical first

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.date) {
      query = query.eq('shift_date', filters.date);
    }
    if (filters?.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters?.minPay) {
      query = query.gte('pay_rate', filters.minPay);
    }
    if (filters?.urgency) {
      query = query.eq('urgency', filters.urgency);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Map the response to match expected type
    return (data || []).map((shift: any) => {
      const profiles = Array.isArray(shift.profiles) ? shift.profiles[0] : shift.profiles;
      const employerProfiles = profiles?.employer_profiles;
      const employer = Array.isArray(employerProfiles) ? employerProfiles[0] : employerProfiles;
      return {
        ...shift,
        employer: {
          ...employer,
          avatar_url: profiles?.avatar_url
        }
      };
    });
  },

  // Get single shift with remaining slots
  async getShiftDetails(shiftId: string) {
    const { data, error } = await supabase
      .from('shifts')
      .select(`
        *,
        profiles!shifts_employer_id_fkey(
          avatar_url,
          employer_profiles(
            company_name,
            company_type,
            average_rating,
            verified,
            total_shifts_posted,
            total_workers_deployed
          )
        )
      `)
      .eq('id', shiftId)
      .single();

    if (error) throw error;

    console.log('🔍 Raw shift data:', data);
    console.log('🔍 Profiles:', data?.profiles);

    // Safely extract employer profiles
    const profiles = Array.isArray(data?.profiles) ? data.profiles[0] : data?.profiles;
    const employerProfiles = profiles?.employer_profiles;
    const employer = Array.isArray(employerProfiles) ? employerProfiles[0] : employerProfiles;

    console.log('🔍 Employer profiles:', employer);

    // Calculate remaining slots
    const remainingSlots = (data?.slots_total || 0) - (data?.slots_confirmed || 0) - (data?.slots_standby || 0);
    
    const result = {
      ...data,
      employer: {
        ...employer,
        avatar_url: profiles?.avatar_url
      },
      remaining_slots: Math.max(0, remainingSlots),
      is_full: remainingSlots <= 0,
    };

    console.log('🔍 Mapped result:', result);
    console.log('🔍 Employer in result:', result.employer);
    
    return result;
  },

  // =====================================================
  // EMPLOYER: Manage Shifts
  // =====================================================

  async createShift(shift: ShiftInsert): Promise<Shift> {
    const { data, error } = await supabase
      .from('shifts')
      .insert(shift)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateShift(id: string, updates: ShiftUpdate): Promise<Shift> {
    const { data, error } = await supabase
      .from('shifts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async publishShift(id: string): Promise<Shift> {
    const { data, error } = await supabase
      .from('shifts')
      .update({ 
        status: 'open',
        published_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('status', 'draft')
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async cancelShift(id: string): Promise<Shift> {
    const { data, error } = await supabase
      .from('shifts')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // TODO: Notify all confirmed workers
    return data;
  },

  async deleteShift(id: string): Promise<void> {
    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getEmployerShifts(employerId: string, status?: string) {
    let query = supabase
      .from('shifts')
      .select(`
        *,
        deployments:deployments(count)
      `)
      .eq('employer_id', employerId)
      .order('shift_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get shift with all applicants for employer review
  async getShiftWithApplicants(shiftId: string) {
    const { data: shift, error: shiftError } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', shiftId)
      .single();

    if (shiftError) throw shiftError;

    const { data: deployments, error: deploymentsError } = await supabase
      .from('deployments')
      .select(`
        *,
        profiles!deployments_worker_id_fkey(
          worker_profiles(
            user_id,
            first_name,
            last_name,
            reliability_score,
            worker_status,
            total_shifts_completed,
            average_rating,
            no_show_count
          )
        )
      `)
      .eq('shift_id', shiftId)
      .order('applied_at', { ascending: true });

    if (deploymentsError) throw deploymentsError;

    return {
      ...shift,
      applicants: deployments.filter(d => d.status === 'applied'),
      confirmed: deployments.filter(d => d.status === 'confirmed' && d.slot_type === 'primary'),
      standby: deployments.filter(d => d.slot_type === 'standby'),
      waitlist: deployments.filter(d => d.slot_type === 'waitlist'),
    };
  },

  // Generate QR code data for check-in
  async getShiftQRCode(shiftId: string) {
    const { data, error } = await supabase
      .from('shifts')
      .select('id, qr_code_secret, location_name, shift_date, start_time')
      .eq('id', shiftId)
      .single();

    if (error) throw error;

    // QR code contains: shift_id|secret|timestamp
    const qrData = `${data.id}|${data.qr_code_secret}|${Date.now()}`;
    
    return {
      qr_data: qrData,
      shift_info: {
        location: data.location_name,
        date: data.shift_date,
        time: data.start_time,
      }
    };
  },
};
