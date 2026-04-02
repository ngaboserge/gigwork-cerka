import { create } from 'zustand';
import type { ScheduledShift, ShiftSwapRequest } from '@/types';
import { deploymentsService } from '@/services/deployments.service';

interface ScheduleState {
  shifts: ScheduledShift[];
  swapRequests: ShiftSwapRequest[];
  loading: boolean;
  fetchShifts: (userId: string, role: 'employee' | 'employer') => Promise<void>;
  fetchSwapRequests: (userId: string) => Promise<void>;
  confirmShift: (shiftId: string) => Promise<void>;
  cancelShift: (shiftId: string, reason?: string) => Promise<void>;
  requestSwap: (shiftId: string, reason?: string) => Promise<void>;
  respondToSwap: (requestId: string, accept: boolean) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  shifts: [],
  swapRequests: [],
  loading: false,

  fetchShifts: async (userId: string, role: 'employee' | 'employer') => {
    set({ loading: true });
    try {
      if (role === 'employee') {
        // Get confirmed and standby deployments for worker
        const deployments = await deploymentsService.getUpcomingShifts(userId);
        
        // Map deployments to ScheduledShift format
        const scheduledShifts: ScheduledShift[] = deployments.map(d => ({
          id: d.id,
          jobId: d.shift?.id || '',
          jobTitle: d.shift?.title || 'Unknown Shift',
          employerId: d.shift?.employer_id || '',
          employerName: d.shift?.employer?.company_name || 'Unknown Employer',
          employerAvatar: d.shift?.employer?.avatar_url,
          employeeId: userId,
          date: d.shift?.shift_date || '',
          startTime: d.shift?.start_time || '',
          endTime: d.shift?.end_time || '',
          location: d.shift?.location_name || '',
          status: d.status === 'confirmed' ? 'confirmed' : 
                  d.status === 'standby' ? 'scheduled' : 'scheduled',
          payRate: d.pay_rate || 0,
          payType: d.shift?.pay_type === 'daily' ? 'daily' : 'hourly',
          notes: d.slot_type === 'standby' ? 'You are on standby for this shift' : undefined,
          createdAt: d.applied_at || '',
          updatedAt: d.confirmed_at || d.applied_at || '',
        }));
        
        set({ shifts: scheduledShifts, loading: false });
      } else {
        // Employer view - not implemented yet
        set({ shifts: [], loading: false });
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
      set({ shifts: [], loading: false });
    }
  },

  fetchSwapRequests: async (_userId: string) => {
    // Swap requests not implemented yet
    set({ swapRequests: [] });
  },

  confirmShift: async (shiftId: string) => {
    // This would update the deployment status
    await new Promise(resolve => setTimeout(resolve, 300));
    set(state => ({
      shifts: state.shifts.map(s => 
        s.id === shiftId ? { ...s, status: 'confirmed', updatedAt: new Date().toISOString() } : s
      ),
    }));
  },

  cancelShift: async (shiftId: string, reason?: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set(state => ({
      shifts: state.shifts.map(s => 
        s.id === shiftId ? { ...s, status: 'cancelled', notes: reason, updatedAt: new Date().toISOString() } : s
      ),
    }));
  },

  requestSwap: async (shiftId: string, reason?: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newRequest: ShiftSwapRequest = {
      id: `swap_${Date.now()}`,
      shiftId,
      requesterId: 'worker_1',
      requesterName: 'Worker',
      status: 'open',
      reason,
      createdAt: new Date().toISOString(),
    };
    set(state => ({
      shifts: state.shifts.map(s => 
        s.id === shiftId ? { ...s, status: 'swap_requested', swapRequestedBy: 'worker_1', updatedAt: new Date().toISOString() } : s
      ),
      swapRequests: [...state.swapRequests, newRequest],
    }));
  },

  respondToSwap: async (requestId: string, accept: boolean) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set(state => ({
      swapRequests: state.swapRequests.map(r => 
        r.id === requestId ? { ...r, status: accept ? 'approved' : 'rejected', respondedAt: new Date().toISOString() } : r
      ),
    }));
  },
}));
