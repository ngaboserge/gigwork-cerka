import { create } from 'zustand';
import { analyticsService } from '@/services/analytics.service';
import type { EmployerAnalytics, EmployeeAnalytics } from '@/types';

interface AnalyticsState {
  employerAnalytics: EmployerAnalytics | null;
  employeeAnalytics: EmployeeAnalytics | null;
  loading: boolean;
  error: string | null;
  
  fetchEmployerAnalytics: (employerId: string, period?: string) => Promise<void>;
  fetchEmployeeAnalytics: (employeeId: string, period?: string) => Promise<void>;
  exportReport: (type: 'employer' | 'employee', format: 'csv' | 'pdf') => Promise<string>;
}

// Generate mock analytics for fallback
const generateMockEmployerAnalytics = (period: string): EmployerAnalytics => ({
  period,
  jobsPosted: 12,
  totalViews: 1456,
  totalApplications: 89,
  applicationRate: 6.1,
  hireRate: 34,
  avgTimeToHire: 4.2,
  avgCostPerHire: 125,
  totalSpent: 4250,
  topCategories: [
    { category: 'Warehouse', count: 5 },
    { category: 'Delivery', count: 4 },
    { category: 'Construction', count: 3 },
  ],
  applicationsByStatus: [
    { status: 'pending', count: 23 },
    { status: 'reviewed', count: 18 },
    { status: 'accepted', count: 30 },
    { status: 'rejected', count: 18 },
  ],
  viewsByDay: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    views: Math.floor(Math.random() * 80) + 20,
  })),
  applicationsByDay: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    applications: Math.floor(Math.random() * 8) + 1,
  })),
});

const generateMockEmployeeAnalytics = (period: string): EmployeeAnalytics => ({
  period,
  applicationsSubmitted: 15,
  interviewsScheduled: 4,
  jobsCompleted: 8,
  totalEarnings: 3240,
  avgHourlyRate: 21.5,
  hoursWorked: 156,
  responseRate: 94,
  profileViews: 67,
  applicationsByStatus: [
    { status: 'pending', count: 3 },
    { status: 'accepted', count: 8 },
    { status: 'rejected', count: 4 },
  ],
  earningsByMonth: [
    { month: 'Oct', amount: 2100 },
    { month: 'Nov', amount: 2850 },
    { month: 'Dec', amount: 3100 },
    { month: 'Jan', amount: 3240 },
  ],
  topSkills: [
    { skill: 'Forklift Operation', jobs: 5 },
    { skill: 'Inventory Management', jobs: 4 },
    { skill: 'Heavy Lifting', jobs: 6 },
  ],
});

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  employerAnalytics: null,
  employeeAnalytics: null,
  loading: false,
  error: null,

  fetchEmployerAnalytics: async (employerId, period = '30d') => {
    set({ loading: true, error: null });
    
    try {
      const data = await analyticsService.getEmployerAnalytics(employerId, period);
      
      // Map service response to store type
      const analytics: EmployerAnalytics = {
        period,
        jobsPosted: data.totalShiftsPosted,
        totalViews: data.totalShiftsPosted * 50, // Estimate
        totalApplications: data.applicationsByDay.reduce((sum, d) => sum + d.count, 0),
        applicationRate: data.avgFillRate / 10,
        hireRate: data.avgFillRate,
        avgTimeToHire: data.avgTimeToFill,
        avgCostPerHire: data.totalSpent / Math.max(data.totalWorkersDeployed, 1),
        totalSpent: data.totalSpent,
        topCategories: data.shiftsByCategory.map(c => ({ category: c.category, count: c.count })),
        applicationsByStatus: data.shiftsByStatus.map(s => ({ status: s.status, count: s.count })),
        viewsByDay: data.applicationsByDay.map(d => ({ date: d.date, views: d.count * 5 })),
        applicationsByDay: data.applicationsByDay.map(d => ({ date: d.date, applications: d.count })),
      };
      
      set({ employerAnalytics: analytics, loading: false });
    } catch (error) {
      console.error('Failed to fetch employer analytics:', error);
      // Fallback to mock data
      set({ 
        employerAnalytics: generateMockEmployerAnalytics(period), 
        loading: false,
        error: 'Failed to load analytics'
      });
    }
  },

  fetchEmployeeAnalytics: async (employeeId, period = '30d') => {
    set({ loading: true, error: null });
    
    try {
      const data = await analyticsService.getWorkerAnalytics(employeeId, period);
      
      // Map service response to store type
      const analytics: EmployeeAnalytics = {
        period,
        applicationsSubmitted: data.totalShiftsApplied,
        interviewsScheduled: 0, // Not applicable for shifts
        jobsCompleted: data.totalShiftsCompleted,
        totalEarnings: data.totalEarnings,
        avgHourlyRate: data.avgHourlyRate,
        hoursWorked: data.totalHoursWorked,
        responseRate: data.onTimeRate,
        profileViews: data.totalShiftsApplied * 2, // Estimate
        applicationsByStatus: [
          { status: 'completed', count: data.totalShiftsCompleted },
          { status: 'applied', count: data.totalShiftsApplied - data.totalShiftsCompleted },
        ],
        earningsByMonth: data.earningsByMonth,
        topSkills: data.shiftsByCategory.map(c => ({ skill: c.category, jobs: c.count })),
      };
      
      set({ employeeAnalytics: analytics, loading: false });
    } catch (error) {
      console.error('Failed to fetch employee analytics:', error);
      // Fallback to mock data
      set({ 
        employeeAnalytics: generateMockEmployeeAnalytics(period), 
        loading: false,
        error: 'Failed to load analytics'
      });
    }
  },

  exportReport: async (type, format) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, this would generate and return a download URL
    return `https://example.com/reports/${type}_report.${format}`;
  },
}));
