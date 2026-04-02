import { create } from 'zustand';
import { deploymentsService } from '@/services/deployments.service';
import { useAuthStore } from './authStore';
import type { Application, ApplicationStatus } from '@/types';

interface ApplicationState {
  applications: Application[];
  loading: boolean;
  error: string | null;
  
  // Fetch
  fetchApplications: () => Promise<void>;
  getApplicationById: (id: string) => Application | undefined;
  getApplicationsByJob: (jobId: string) => Application[];
  getApplicationsByEmployee: (employeeId: string) => Application[];
  getApplicationsByEmployer: (employerId: string) => Application[];
  
  // Worker actions
  applyToJob: (jobId: string, data: { coverLetter?: string; proposedRate?: number; availability?: string }) => Promise<Application>;
  withdrawApplication: (id: string) => Promise<void>;
  
  // Employer actions
  updateApplicationStatus: (id: string, status: ApplicationStatus, note?: string) => Promise<void>;
  addEmployerNote: (id: string, note: string) => Promise<void>;
  setInternalRating: (id: string, rating: number) => Promise<void>;
  bulkUpdateStatus: (ids: string[], status: ApplicationStatus) => Promise<void>;
}

// Map deployment to application format
const mapDeploymentToApplication = (deployment: any): Application => {
  const statusMap: Record<string, ApplicationStatus> = {
    'applied': 'pending',
    'confirmed': 'accepted',
    'standby': 'shortlisted',
    'rejected': 'rejected',
    'cancelled': 'withdrawn',
  };

  return {
    id: deployment.id,
    applicationId: deployment.id,
    jobId: deployment.shift_id,
    jobTitle: deployment.shift?.title || 'Unknown',
    jobLocation: deployment.shift?.location_name || '',
    jobPayRate: deployment.pay_rate,
    jobType: deployment.shift?.pay_type || 'hourly',
    employeeId: deployment.worker_id,
    employeeName: deployment.worker ? `${deployment.worker.first_name} ${deployment.worker.last_name}` : 'Unknown',
    employeeRating: deployment.worker?.average_rating || 0,
    employeeSkills: [],
    employerId: deployment.shift?.employer_id || '',
    employerName: deployment.shift?.employer?.company_name || 'Unknown',
    coverLetter: '',
    answers: [],
    attachments: [],
    status: statusMap[deployment.status] || 'pending',
    statusHistory: [
      { status: statusMap[deployment.status] || 'pending', changedAt: deployment.applied_at, changedBy: deployment.worker_id },
    ],
    createdAt: deployment.applied_at,
    updatedAt: deployment.updated_at,
  };
};

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  loading: false,
  error: null,

  fetchApplications: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ applications: [], loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      let deployments;
      if (user.role === 'worker') {
        deployments = await deploymentsService.getWorkerDeployments(user.id);
      } else {
        // For employers, we'd need to get deployments for their shifts
        // This would require a new service method
        deployments = [];
      }
      
      const applications = deployments.map(mapDeploymentToApplication);
      set({ applications, loading: false });
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      set({ applications: [], loading: false, error: 'Failed to load applications' });
    }
  },

  getApplicationById: (id) => get().applications.find(a => a.id === id),
  
  getApplicationsByJob: (jobId) => get().applications.filter(a => a.jobId === jobId),
  
  getApplicationsByEmployee: (employeeId) => get().applications.filter(a => a.employeeId === employeeId),
  
  getApplicationsByEmployer: (employerId) => get().applications.filter(a => a.employerId === employerId),

  applyToJob: async (jobId, data) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');
    
    set({ loading: true, error: null });
    try {
      const deployment = await deploymentsService.applyToShift(jobId, user.id);
      const application = mapDeploymentToApplication(deployment);
      
      set(state => ({ 
        applications: [application, ...state.applications],
        loading: false 
      }));
      
      return application;
    } catch (error: any) {
      console.error('Failed to apply to job:', error);
      set({ loading: false, error: error.message || 'Failed to apply' });
      throw error;
    }
  },

  withdrawApplication: async (id) => {
    set({ loading: true, error: null });
    try {
      // Cancel the deployment
      await deploymentsService.cancelDeployment(id);
      
      set(state => ({
        applications: state.applications.map(a =>
          a.id === id ? {
            ...a,
            status: 'withdrawn',
            statusHistory: [
              ...a.statusHistory,
              { status: 'withdrawn' as ApplicationStatus, changedAt: new Date().toISOString(), changedBy: a.employeeId },
            ],
            updatedAt: new Date().toISOString(),
          } : a
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to withdraw application:', error);
      set({ loading: false, error: 'Failed to withdraw application' });
    }
  },

  updateApplicationStatus: async (id, status, note) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    set({ loading: true, error: null });
    try {
      // Map application status to deployment status
      if (status === 'accepted') {
        await deploymentsService.confirmWorker(id, null, 'manual');
      } else if (status === 'rejected') {
        await deploymentsService.rejectWorker(id, note);
      }
      
      set(state => ({
        applications: state.applications.map(a =>
          a.id === id ? {
            ...a,
            status,
            statusHistory: [
              ...a.statusHistory,
              { status, changedAt: new Date().toISOString(), changedBy: user.id, note },
            ],
            viewedAt: a.viewedAt || (status !== 'pending' ? new Date().toISOString() : undefined),
            respondedAt: ['accepted', 'rejected', 'hired'].includes(status) ? new Date().toISOString() : a.respondedAt,
            updatedAt: new Date().toISOString(),
          } : a
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to update application status:', error);
      set({ loading: false, error: 'Failed to update status' });
    }
  },

  addEmployerNote: async (id, note) => {
    set(state => ({
      applications: state.applications.map(a =>
        a.id === id ? { ...a, employerNotes: note, updatedAt: new Date().toISOString() } : a
      ),
    }));
  },

  setInternalRating: async (id, rating) => {
    set(state => ({
      applications: state.applications.map(a =>
        a.id === id ? { ...a, internalRating: rating, updatedAt: new Date().toISOString() } : a
      ),
    }));
  },

  bulkUpdateStatus: async (ids, status) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    set({ loading: true, error: null });
    try {
      // Update each deployment
      await Promise.all(ids.map(id => {
        if (status === 'accepted') {
          return deploymentsService.confirmWorker(id, null, 'manual');
        } else if (status === 'rejected') {
          return deploymentsService.rejectWorker(id, 'Bulk rejection');
        }
        return Promise.resolve();
      }));
      
      set(state => ({
        applications: state.applications.map(a =>
          ids.includes(a.id) ? {
            ...a,
            status,
            statusHistory: [
              ...a.statusHistory,
              { status, changedAt: new Date().toISOString(), changedBy: user.id, note: 'Bulk update' },
            ],
            updatedAt: new Date().toISOString(),
          } : a
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to bulk update:', error);
      set({ loading: false, error: 'Failed to bulk update' });
    }
  },
}));
