import { supabaseUntyped as supabase } from '@/lib/supabase';
import type { Database, Deployment, DeploymentStatus, SlotType } from '@/lib/database.types';

type DeploymentInsert = Database['public']['Tables']['deployments']['Insert'];

export const deploymentsService = {
  // =====================================================
  // WORKER: Apply to Shift (Opt-In)
  // =====================================================

  async applyToShift(shiftId: string, workerId: string): Promise<Deployment> {
    // Get shift details first
    const { data: shift, error: shiftError } = await supabase
      .from('shifts')
      .select(`
        *, 
        profiles!shifts_employer_id_fkey(
          employer_profiles(auto_confirm_threshold)
        )
      `)
      .eq('id', shiftId)
      .single();

    if (shiftError) throw shiftError;

    // Check if shift is still open
    if (shift.status !== 'open') {
      throw new Error('This shift is no longer accepting applications');
    }

    // Check remaining slots
    const remainingSlots = shift.slots_total - shift.slots_confirmed - shift.slots_standby;
    if (remainingSlots <= 0) {
      throw new Error('This shift is fully booked');
    }

    // Get worker's reliability score
    const { data: worker, error: workerError } = await supabase
      .from('worker_profiles')
      .select('reliability_score, worker_status, is_restricted')
      .eq('user_id', workerId)
      .single();

    if (workerError) throw workerError;

    // Check if worker is restricted
    if (worker.is_restricted) {
      throw new Error('Your account is currently restricted');
    }

    // Check minimum reliability requirement
    if (worker.reliability_score < shift.minimum_reliability_score) {
      throw new Error(`This shift requires a minimum reliability score of ${shift.minimum_reliability_score}`);
    }

    // Create deployment
    const deployment: DeploymentInsert = {
      shift_id: shiftId,
      worker_id: workerId,
      scheduled_start: `${shift.shift_date}T${shift.start_time}`,
      scheduled_end: `${shift.shift_date}T${shift.end_time}`,
      pay_rate: shift.pay_rate,
      status: 'applied',
    };

    const { data, error } = await supabase
      .from('deployments')
      .insert(deployment)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('You have already applied to this shift');
      }
      throw error;
    }

    // Auto-confirm is disabled - all applications require manual approval
    // Employers must review and confirm workers from the Applications page
    console.log('✅ Application submitted successfully - awaiting employer approval');
    
    return data;
  },

  // =====================================================
  // EMPLOYER: Confirm/Reject Workers
  // =====================================================

  async confirmWorker(
    deploymentId: string, 
    confirmedBy: string | null,
    _confirmType: 'manual' | 'auto' = 'manual'
  ): Promise<Deployment> {
    console.log('🔄 confirmWorker called for deployment:', deploymentId);
    
    // Get deployment and shift info
    const { data: deployment, error: depError } = await supabase
      .from('deployments')
      .select('*, shifts(*)')
      .eq('id', deploymentId)
      .single();

    if (depError) {
      console.error('❌ Error fetching deployment:', depError);
      throw depError;
    }

    if (!deployment.shifts) {
      throw new Error('Shift data not found for deployment');
    }

    const shift = deployment.shifts;
    console.log('📊 Shift data:', {
      id: shift.id,
      title: shift.title,
      slots_needed: shift.slots_needed,
      slots_total: shift.slots_total,
      slots_confirmed: shift.slots_confirmed,
      slots_standby: shift.slots_standby,
      employer_id: shift.employer_id
    });
    
    // Determine slot type
    let slotType: SlotType;
    let slotNumber: number;

    if (shift.slots_confirmed < shift.slots_needed) {
      // Primary slot available
      slotType = 'primary';
      slotNumber = shift.slots_confirmed + 1;
    } else if (shift.slots_confirmed + shift.slots_standby < shift.slots_total) {
      // Standby slot available
      slotType = 'standby';
      slotNumber = shift.slots_standby + 1;
    } else {
      // Waitlist
      slotType = 'waitlist';
      slotNumber = 0;
    }

    const status: DeploymentStatus = slotType === 'waitlist' ? 'waitlist' : 
                                      slotType === 'standby' ? 'standby' : 'confirmed';

    const { data, error } = await supabase
      .from('deployments')
      .update({
        status,
        slot_type: slotType,
        slot_number: slotNumber,
        confirmed_at: new Date().toISOString(),
        confirmed_by: confirmedBy,
      })
      .eq('id', deploymentId)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Deployment updated to status:', status, 'slot_type:', slotType);

    // Update shift slot counts using database function (bypasses RLS)
    if (slotType === 'primary') {
      console.log('📊 Updating slots_confirmed from', shift.slots_confirmed, 'to', shift.slots_confirmed + 1);
      
      const { error: shiftError } = await supabase.rpc('increment_shift_slots', {
        p_shift_id: shift.id,
        p_slot_type: 'confirmed'
      });
      
      if (shiftError) {
        console.error('❌ Failed to update shift slots_confirmed:', shiftError);
        throw new Error(`Failed to update shift slots: ${shiftError.message}`);
      }
      
      console.log('✅ Shift slots_confirmed updated successfully to:', shift.slots_confirmed + 1);
    } else if (slotType === 'standby') {
      console.log('📊 Updating slots_standby from', shift.slots_standby, 'to', shift.slots_standby + 1);
      
      const { error: shiftError } = await supabase.rpc('increment_shift_slots', {
        p_shift_id: shift.id,
        p_slot_type: 'standby'
      });
      
      if (shiftError) {
        console.error('❌ Failed to update shift slots_standby:', shiftError);
        throw new Error(`Failed to update shift slots: ${shiftError.message}`);
      }
      
      console.log('✅ Shift slots_standby updated successfully to:', shift.slots_standby + 1);
    }

    // Send notification to worker (ignore errors for now)
    await supabase.from('notifications').insert({
      user_id: deployment.worker_id,
      type: slotType === 'primary' ? 'shift_confirmed' : 
            slotType === 'standby' ? 'shift_standby' : 'shift_waitlist',
      title: slotType === 'primary' ? 'Shift Confirmed!' :
             slotType === 'standby' ? 'You\'re on Standby' : 'Added to Waitlist',
      message: slotType === 'primary' 
        ? `You're confirmed for ${shift.title} on ${shift.shift_date}`
        : slotType === 'standby'
        ? `You're on standby for ${shift.title}. We'll notify you if a spot opens.`
        : `You're on the waitlist for ${shift.title}.`,
      priority: slotType === 'primary' ? 'high' : 'normal',
      data: { shift_id: shift.id, deployment_id: deploymentId },
    });

    // Auto-generate contract for confirmed workers (primary slots only)
    if (slotType === 'primary' && status === 'confirmed') {
      try {
        console.log('📝 Auto-generating contract for confirmed worker...');
        
        // Calculate contract dates
        const startDate = new Date(`${shift.shift_date}T${shift.start_time}`);
        const endDate = new Date(`${shift.shift_date}T${shift.end_time}`);
        
        // Build contract terms
        const contractTerms = `WORK AGREEMENT\n\n` +
          `Position: ${shift.title}\n` +
          `Date: ${shift.shift_date}\n` +
          `Time: ${shift.start_time} - ${shift.end_time}\n` +
          `Pay Rate: $${shift.pay_rate}/${shift.pay_type}\n\n` +
          `${shift.description || ''}\n\n` +
          `Worker agrees to:\n` +
          `- Arrive on time and ready to work\n` +
          `- Complete all assigned duties professionally\n` +
          `- Follow all safety and workplace guidelines\n\n` +
          `Payment will be processed based on time tracking records.`;
        
        // Create contract using deployment_id schema
        await supabase.from('contracts').insert({
          deployment_id: deploymentId,
          worker_id: deployment.worker_id,
          employer_id: shift.employer_id,
          shift_id: shift.id,
          title: `Work Agreement - ${shift.title}`,
          description: shift.description || `Work agreement for ${shift.title} position`,
          terms: contractTerms,
          hourly_rate: shift.pay_rate,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'pending_employee',
          employer_signed: true,
          employer_signed_at: new Date().toISOString(),
        });
        
        console.log('✅ Contract auto-generated successfully');
        
        // Send notification about contract
        await supabase.from('notifications').insert({
          user_id: deployment.worker_id,
          type: 'contract_created',
          title: 'New Contract Ready',
          message: `A work contract for ${shift.title} is ready for your signature`,
          priority: 'high',
          data: { shift_id: shift.id, deployment_id: deploymentId },
        });
      } catch (contractError) {
        console.error('⚠️ Failed to auto-generate contract:', contractError);
        // Don't fail the confirmation if contract generation fails
      }
    }

    return data;
  },

  async rejectWorker(deploymentId: string, reason?: string): Promise<Deployment> {
    const { data: deployment, error: depError } = await supabase
      .from('deployments')
      .select('worker_id, shift:shifts(title)')
      .eq('id', deploymentId)
      .single();

    if (depError) throw depError;

    const { data, error } = await supabase
      .from('deployments')
      .update({
        status: 'rejected',
        rejection_reason: reason,
      })
      .eq('id', deploymentId)
      .select()
      .single();

    if (error) throw error;

    // Get shift title safely
    const shiftData = Array.isArray(deployment?.shift) ? deployment.shift[0] : deployment?.shift;
    const shiftTitle = shiftData?.title || 'the shift';

    // Notify worker
    await supabase.from('notifications').insert({
      user_id: deployment.worker_id,
      type: 'application_rejected',
      title: 'Application Not Selected',
      message: `Your application for ${shiftTitle} was not selected.${reason ? ` Reason: ${reason}` : ''}`,
      priority: 'normal',
    });

    return data;
  },

  // Bulk confirm workers by reliability score
  async bulkConfirmByReliability(shiftId: string, minScore: number): Promise<number> {
    // Get all pending applications with high reliability
    const { data: applicants, error } = await supabase
      .from('deployments')
      .select(`
        id,
        worker:worker_profiles!inner(reliability_score)
      `)
      .eq('shift_id', shiftId)
      .eq('status', 'applied')
      .gte('worker.reliability_score', minScore)
      .order('worker(reliability_score)', { ascending: false });

    if (error) throw error;

    let confirmed = 0;
    for (const applicant of applicants) {
      try {
        await this.confirmWorker(applicant.id, null, 'auto');
        confirmed++;
      } catch (e) {
        // Stop if shift is full
        break;
      }
    }

    return confirmed;
  },

  // =====================================================
  // WORKER: Check-In / Check-Out
  // =====================================================

  async checkIn(
    deploymentId: string,
    location: { lat: number; lng: number },
    method: 'gps' | 'qr' | 'photo' = 'gps',
    photoUrl?: string
  ) {
    // Call the database function for check-in processing
    const { data, error } = await supabase.rpc('process_check_in', {
      p_deployment_id: deploymentId,
      p_location: `POINT(${location.lng} ${location.lat})`,
      p_method: method,
      p_photo_url: photoUrl,
    });

    if (error) throw error;
    
    if (!data.success) {
      throw new Error(data.error);
    }

    return data;
  },

  async checkOut(
    deploymentId: string,
    location: { lat: number; lng: number },
    method: 'gps' | 'qr' | 'photo' = 'gps',
    photoUrl?: string
  ) {
    // Get deployment to calculate hours
    const { data: deployment, error: depError } = await supabase
      .from('deployments')
      .select(`
        check_in_at, 
        pay_rate, 
        break_minutes, 
        scheduled_end,
        worker_id,
        shift_id,
        shifts(employer_id, shift_date, title)
      `)
      .eq('id', deploymentId)
      .single();

    if (depError) throw depError;

    if (!deployment.check_in_at) {
      throw new Error('Cannot check out without checking in first');
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(deployment.check_in_at);
    const scheduledEnd = new Date(deployment.scheduled_end);

    // Calculate total minutes worked
    const totalMinutes = Math.round((checkOutTime.getTime() - checkInTime.getTime()) / 60000) - deployment.break_minutes;
    const totalHours = totalMinutes / 60;

    // Check for early departure
    const earlyDeparture = checkOutTime < scheduledEnd;
    const earlyMinutes = earlyDeparture 
      ? Math.round((scheduledEnd.getTime() - checkOutTime.getTime()) / 60000)
      : 0;

    // Calculate pay
    const totalPay = totalHours * deployment.pay_rate;

    const { data, error } = await supabase
      .from('deployments')
      .update({
        status: 'completed',
        check_out_at: checkOutTime.toISOString(),
        check_out_location: `POINT(${location.lng} ${location.lat})`,
        check_out_method: method,
        check_out_photo_url: photoUrl,
        total_minutes: totalMinutes,
        total_hours: totalHours,
        total_pay: totalPay,
        early_departure: earlyDeparture,
      })
      .eq('id', deploymentId)
      .select()
      .single();

    if (error) throw error;

    // Update reliability score
    if (!earlyDeparture) {
      await supabase.rpc('update_reliability_score', {
        p_worker_id: data.worker_id,
        p_event_type: 'shift_completed',
        p_deployment_id: deploymentId,
      });
    } else if (earlyMinutes > 30) {
      await supabase.rpc('update_reliability_score', {
        p_worker_id: data.worker_id,
        p_event_type: 'early_departure',
        p_deployment_id: deploymentId,
        p_notes: `Left ${earlyMinutes} minutes early`,
      });
    }

    // Auto-generate invoice for completed shift
    try {
      const shiftData = Array.isArray(deployment.shifts) ? deployment.shifts[0] : deployment.shifts;
      if (shiftData?.employer_id) {
        await this.createInvoiceForDeployment(
          deploymentId,
          deployment.worker_id,
          shiftData.employer_id,
          shiftData.shift_date,
          shiftData.title,
          totalHours,
          deployment.pay_rate,
          totalPay
        );
      }
    } catch (invoiceError) {
      console.error('Failed to create invoice:', invoiceError);
      // Don't fail checkout if invoice creation fails
    }

    return data;
  },

  // Helper function to create invoice for completed deployment
  async createInvoiceForDeployment(
    deploymentId: string,
    workerId: string,
    employerId: string,
    shiftDate: string,
    shiftTitle: string,
    totalHours: number,
    payRate: number,
    totalPay: number
  ) {
    const { timeTrackingService } = await import('./timeTracking.service');
    
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${deploymentId.slice(0, 8)}`;
    
    // Create invoice
    const invoice = await timeTrackingService.createInvoice({
      worker_id: workerId,
      employer_id: employerId,
      period_start: shiftDate,
      period_end: shiftDate,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      tax_rate: 0, // No tax by default
      notes: `Payment for ${shiftTitle} on ${shiftDate}`,
    });

    // Add line item for the shift
    await timeTrackingService.addInvoiceLineItem({
      invoice_id: invoice.id,
      description: `${shiftTitle} - ${totalHours.toFixed(2)} hours @ ${formatCurrency(payRate)}/hr`,
      quantity: totalHours,
      unit_price: payRate,
    });

    // Update invoice totals
    await supabase
      .from('invoices')
      .update({
        invoice_number: invoiceNumber,
        subtotal: totalPay,
        tax_amount: 0,
        total_amount: totalPay,
        status: 'sent', // Automatically mark as sent
      })
      .eq('id', invoice.id);

    console.log('✅ Invoice created automatically:', invoiceNumber);
    
    return invoice;
  },

  // =====================================================
  // EMPLOYER: Handle No-Shows
  // =====================================================

  async markNoShow(deploymentId: string): Promise<any> {
    const { data, error } = await supabase.rpc('process_no_show', {
      p_deployment_id: deploymentId,
    });

    if (error) throw error;
    return data;
  },

  // =====================================================
  // WORKER: Get My Deployments
  // =====================================================

  async getWorkerDeployments(workerId: string, status?: DeploymentStatus) {
    let query = supabase
      .from('deployments')
      .select(`
        *,
        shifts(
          id,
          title,
          category,
          location_name,
          city,
          shift_date,
          start_time,
          end_time,
          pay_rate,
          pay_type,
          profiles!shifts_employer_id_fkey(
            employer_profiles(company_name, verified)
          )
        )
      `)
      .eq('worker_id', workerId)
      .order('applied_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Map the response to expected structure
    return (data || []).map(d => ({
      ...d,
      shift: d.shifts ? {
        ...d.shifts,
        employer: d.shifts.profiles?.employer_profiles
      } : null
    }));
  },

  // Get upcoming confirmed shifts for worker
  async getUpcomingShifts(workerId: string) {
    const { data, error } = await supabase
      .from('deployments')
      .select(`
        *,
        shifts(
          *,
          profiles!shifts_employer_id_fkey(
            avatar_url,
            employer_profiles(company_name, verified)
          )
        )
      `)
      .eq('worker_id', workerId)
      .in('status', ['confirmed', 'standby']);

    if (error) throw error;
    
    // Map the response and filter for upcoming shifts
    const today = new Date().toISOString().split('T')[0];
    const mappedData = (data || []).map(d => {
      const profiles = Array.isArray(d.shifts?.profiles) ? d.shifts.profiles[0] : d.shifts?.profiles;
      const employerProfiles = profiles?.employer_profiles;
      const employer = Array.isArray(employerProfiles) ? employerProfiles[0] : employerProfiles;
      
      return {
        ...d,
        shift: d.shifts ? {
          ...d.shifts,
          employer: {
            ...employer,
            avatar_url: profiles?.avatar_url
          }
        } : null
      };
    });
    
    const upcomingData = mappedData.filter(d => 
      d.shift && d.shift.shift_date >= today
    ).sort((a, b) => {
      const dateA = a.shift?.shift_date || '';
      const dateB = b.shift?.shift_date || '';
      return dateA.localeCompare(dateB);
    });
    
    return upcomingData;
  },

  // =====================================================
  // RATINGS
  // =====================================================

  async rateWorker(deploymentId: string, rating: number, feedback?: string) {
    const { data, error } = await supabase
      .from('deployments')
      .update({
        employer_rating: rating,
        employer_feedback: feedback,
      })
      .eq('id', deploymentId)
      .select('worker_id')
      .single();

    if (error) throw error;

    // Update reliability score based on rating
    if (rating === 5) {
      await supabase.rpc('update_reliability_score', {
        p_worker_id: data.worker_id,
        p_event_type: 'five_star_rating',
        p_deployment_id: deploymentId,
      });
    } else if (rating === 4) {
      await supabase.rpc('update_reliability_score', {
        p_worker_id: data.worker_id,
        p_event_type: 'four_star_rating',
        p_deployment_id: deploymentId,
      });
    } else if (rating <= 2) {
      await supabase.rpc('update_reliability_score', {
        p_worker_id: data.worker_id,
        p_event_type: 'low_rating',
        p_deployment_id: deploymentId,
      });
    }

    // Update worker's average rating
    const { data: ratings } = await supabase
      .from('deployments')
      .select('employer_rating')
      .eq('worker_id', data.worker_id)
      .not('employer_rating', 'is', null);

    if (ratings && ratings.length > 0) {
      const avgRating = ratings.reduce((sum, r) => sum + r.employer_rating!, 0) / ratings.length;
      await supabase
        .from('worker_profiles')
        .update({ 
          average_rating: avgRating,
          total_ratings: ratings.length,
        })
        .eq('user_id', data.worker_id);
    }

    return data;
  },

  async rateEmployer(deploymentId: string, rating: number, feedback?: string) {
    const { data, error } = await supabase
      .from('deployments')
      .update({
        worker_rating: rating,
        worker_feedback: feedback,
      })
      .eq('id', deploymentId)
      .select('shifts(employer_id)')
      .single();

    if (error) throw error;

    // Get employer ID safely
    const shiftsData = Array.isArray(data?.shifts) ? data.shifts[0] : data?.shifts;
    const employerId = shiftsData?.employer_id;
    
    if (!employerId) return data;

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
          average_rating: avgRating,
          total_ratings: ratings.length,
        })
        .eq('user_id', employerId);
    }

    return data;
  },
};
