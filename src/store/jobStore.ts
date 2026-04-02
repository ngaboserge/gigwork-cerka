import { create } from 'zustand';
import { shiftsService } from '@/services/shifts.service';
import { useAuthStore } from './authStore';
import type { Job, JobTemplate, JobAlert, JobFilters, SavedJob } from '@/types';

interface JobState {
  jobs: Job[];
  templates: JobTemplate[];
  alerts: JobAlert[];
  savedJobs: SavedJob[];
  recentlyViewed: string[];
  loading: boolean;
  error: string | null;
  filters: JobFilters;
  
  // Job CRUD
  fetchJobs: () => Promise<void>;
  getJobById: (id: string) => Job | undefined;
  createJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'applicationsCount' | 'viewsCount' | 'savedCount'>) => Promise<Job>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  duplicateJob: (id: string) => Promise<Job>;
  pauseJob: (id: string) => Promise<void>;
  resumeJob: (id: string) => Promise<void>;
  
  // Templates
  fetchTemplates: () => Promise<void>;
  createTemplate: (name: string, job: Partial<Job>) => Promise<JobTemplate>;
  updateTemplate: (id: string, updates: Partial<JobTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  createJobFromTemplate: (templateId: string, overrides?: Partial<Job>) => Promise<Job>;
  
  // Alerts
  fetchAlerts: () => Promise<void>;
  createAlert: (alert: Omit<JobAlert, 'id' | 'createdAt'>) => Promise<JobAlert>;
  updateAlert: (id: string, updates: Partial<JobAlert>) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  toggleAlert: (id: string) => Promise<void>;
  
  // Saved Jobs
  saveJob: (jobId: string, notes?: string) => Promise<void>;
  unsaveJob: (jobId: string) => Promise<void>;
  isSaved: (jobId: string) => boolean;
  
  // View tracking
  trackView: (jobId: string) => void;
  
  // Filters
  setFilters: (filters: JobFilters) => void;
  clearFilters: () => void;
  getFilteredJobs: () => Job[];
}

// Map shift to job format
const mapShiftToJob = (shift: any): Job => ({
  id: shift.id,
  employerId: shift.employer_id,
  employerName: shift.employer?.company_name || 'Unknown Company',
  employerLogo: shift.employer?.avatar_url,
  employerRating: shift.employer?.average_rating || 0,
  employerVerified: shift.employer?.verified || false,
  title: shift.title,
  description: shift.description,
  category: shift.category,
  jobType: shift.pay_type,
  location: shift.location_name,
  city: shift.city,
  state: shift.state,
  isRemote: false,
  payRate: shift.pay_rate,
  payType: shift.pay_type,
  experienceLevel: 'entry',
  urgency: shift.urgency,
  status: shift.status === 'open' ? 'open' : shift.status === 'draft' ? 'draft' : 'closed',
  requirements: shift.required_certifications || [],
  responsibilities: [],
  benefits: shift.equipment_provided || [],
  skills: [],
  applicationsCount: shift.slots_applied || 0,
  viewsCount: 0,
  savedCount: 0,
  createdAt: shift.created_at,
  updatedAt: shift.updated_at,
  publishedAt: shift.published_at,
  expiresAt: shift.shift_date,
});

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  templates: [],
  alerts: [],
  savedJobs: [],
  recentlyViewed: [],
  loading: false,
  error: null,
  filters: {},

  fetchJobs: async () => {
    set({ loading: true, error: null });
    try {
      const shifts = await shiftsService.getAvailableShifts();
      const jobs = shifts.map(mapShiftToJob);
      set({ jobs, loading: false });
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      set({ jobs: [], loading: false, error: 'Failed to load jobs' });
    }
  },

  getJobById: (id) => get().jobs.find(j => j.id === id),

  createJob: async (jobData) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');

    set({ loading: true, error: null });
    try {
      const shift = await shiftsService.createShift({
        employer_id: user.id,
        title: jobData.title,
        description: jobData.description,
        category: jobData.category as any,
        location_name: jobData.location,
        address: { street: '', city: jobData.city, state: jobData.state },
        city: jobData.city,
        state: jobData.state,
        zip_code: '00000',
        shift_date: jobData.expiresAt || new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '17:00',
        slots_needed: 1,
        slots_total: 1,
        overbooking_percent: 0,
        pay_rate: jobData.payRate,
        pay_type: jobData.payType as any,
        status: jobData.status === 'open' ? 'open' : 'draft',
        urgency: jobData.urgency as any,
        required_certifications: jobData.requirements || [],
        equipment_provided: jobData.benefits || [],
        qr_code_secret: Math.random().toString(36).substring(7),
      });

      const newJob = mapShiftToJob(shift);
      set(state => ({ jobs: [newJob, ...state.jobs], loading: false }));
      return newJob;
    } catch (error) {
      console.error('Failed to create job:', error);
      set({ loading: false, error: 'Failed to create job' });
      throw error;
    }
  },

  updateJob: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await shiftsService.updateShift(id, {
        title: updates.title,
        description: updates.description,
        pay_rate: updates.payRate,
        status: updates.status === 'open' ? 'open' : updates.status === 'draft' ? 'draft' : 'closed',
      } as any);

      set(state => ({
        jobs: state.jobs.map(j => 
          j.id === id ? { ...j, ...updates, updatedAt: new Date().toISOString() } : j
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to update job:', error);
      set({ loading: false, error: 'Failed to update job' });
    }
  },

  deleteJob: async (id) => {
    set({ loading: true, error: null });
    try {
      await shiftsService.deleteShift(id);
      set(state => ({ jobs: state.jobs.filter(j => j.id !== id), loading: false }));
    } catch (error) {
      console.error('Failed to delete job:', error);
      set({ loading: false, error: 'Failed to delete job' });
    }
  },

  duplicateJob: async (id) => {
    const job = get().getJobById(id);
    if (!job) throw new Error('Job not found');
    
    const { id: _id, createdAt: _c, updatedAt: _u, publishedAt: _p, applicationsCount: _a, viewsCount: _v, savedCount: _s, ...jobData } = job;
    return get().createJob({
      ...jobData,
      title: `${job.title} (Copy)`,
      status: 'draft',
    });
  },

  pauseJob: async (id) => {
    await get().updateJob(id, { status: 'paused' });
  },

  resumeJob: async (id) => {
    await get().updateJob(id, { status: 'open' });
  },

  fetchTemplates: async () => {
    // TODO: Implement backend template storage
    set({ templates: [] });
  },

  createTemplate: async (name, job) => {
    const template: JobTemplate = {
      id: `tmpl_${Date.now()}`,
      employerId: job.employerId || '',
      name,
      job,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set(state => ({ templates: [template, ...state.templates] }));
    return template;
  },

  updateTemplate: async (id, updates) => {
    set(state => ({
      templates: state.templates.map(t =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    }));
  },

  deleteTemplate: async (id) => {
    set(state => ({ templates: state.templates.filter(t => t.id !== id) }));
  },

  createJobFromTemplate: async (templateId, overrides = {}) => {
    const template = get().templates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');
    
    await get().updateTemplate(templateId, { usageCount: template.usageCount + 1 });
    
    return get().createJob({
      ...template.job,
      ...overrides,
      templateId,
      status: 'draft',
    } as Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'applicationsCount' | 'viewsCount' | 'savedCount'>);
  },

  fetchAlerts: async () => {
    // TODO: Implement backend alert storage
    set({ alerts: [] });
  },

  createAlert: async (alertData) => {
    const alert: JobAlert = {
      ...alertData,
      id: `alert_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set(state => ({ alerts: [alert, ...state.alerts] }));
    return alert;
  },

  updateAlert: async (id, updates) => {
    set(state => ({
      alerts: state.alerts.map(a => a.id === id ? { ...a, ...updates } : a),
    }));
  },

  deleteAlert: async (id) => {
    set(state => ({ alerts: state.alerts.filter(a => a.id !== id) }));
  },

  toggleAlert: async (id) => {
    const alert = get().alerts.find(a => a.id === id);
    if (alert) {
      await get().updateAlert(id, { enabled: !alert.enabled });
    }
  },

  saveJob: async (jobId, notes) => {
    const savedJob: SavedJob = {
      id: `saved_${Date.now()}`,
      jobId,
      userId: 'current_user',
      savedAt: new Date().toISOString(),
      notes,
    };
    set(state => ({ savedJobs: [savedJob, ...state.savedJobs] }));
  },

  unsaveJob: async (jobId) => {
    set(state => ({ savedJobs: state.savedJobs.filter(s => s.jobId !== jobId) }));
  },

  isSaved: (jobId) => get().savedJobs.some(s => s.jobId === jobId),

  trackView: (jobId) => {
    set(state => {
      const recentlyViewed = [jobId, ...state.recentlyViewed.filter(id => id !== jobId)].slice(0, 20);
      return { recentlyViewed };
    });
  },

  setFilters: (filters) => set({ filters }),
  
  clearFilters: () => set({ filters: {} }),

  getFilteredJobs: () => {
    const { jobs, filters } = get();
    let filtered = jobs.filter(j => j.status === 'open');

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(j => 
        j.title.toLowerCase().includes(search) ||
        j.description.toLowerCase().includes(search) ||
        j.employerName.toLowerCase().includes(search)
      );
    }

    if (filters.categories?.length) {
      filtered = filtered.filter(j => filters.categories!.includes(j.category));
    }

    if (filters.locations?.length) {
      filtered = filtered.filter(j => 
        filters.locations!.some(loc => j.location.toLowerCase().includes(loc.toLowerCase()))
      );
    }

    if (filters.jobTypes?.length) {
      filtered = filtered.filter(j => filters.jobTypes!.includes(j.jobType));
    }

    if (filters.minPay) {
      filtered = filtered.filter(j => j.payRate >= filters.minPay!);
    }

    if (filters.maxPay) {
      filtered = filtered.filter(j => j.payRate <= filters.maxPay!);
    }

    if (filters.experienceLevel?.length) {
      filtered = filtered.filter(j => filters.experienceLevel!.includes(j.experienceLevel));
    }

    if (filters.isRemote !== undefined) {
      filtered = filtered.filter(j => j.isRemote === filters.isRemote);
    }

    if (filters.urgency?.length) {
      filtered = filtered.filter(j => filters.urgency!.includes(j.urgency));
    }

    // Sort
    switch (filters.sortBy) {
      case 'pay_high':
        filtered.sort((a, b) => b.payRate - a.payRate);
        break;
      case 'pay_low':
        filtered.sort((a, b) => a.payRate - b.payRate);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  },
}));
