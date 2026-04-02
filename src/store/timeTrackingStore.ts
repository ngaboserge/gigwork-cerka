import { create } from 'zustand';
import { timeTrackingService, type TimeEntry, type Invoice } from '@/services/timeTracking.service';
import { useAuthStore } from './authStore';
import { mockTimeEntries, mockInvoices } from '@/data/mock';

interface TimeTrackingState {
  timeEntries: TimeEntry[];
  invoices: Invoice[];
  activeEntry: TimeEntry | null;
  loading: boolean;
  error: string | null;
  
  // Time Entries
  fetchTimeEntries: () => Promise<void>;
  clockIn: (deploymentId: string, shiftId: string, hourlyRate: number, location?: any) => Promise<TimeEntry>;
  clockOut: (timeEntryId: string, breakMinutes?: number, location?: any) => Promise<TimeEntry>;
  approveTimeEntry: (timeEntryId: string, notes?: string) => Promise<void>;
  rejectTimeEntry: (timeEntryId: string, reason: string) => Promise<void>;
  updateTimeEntry: (timeEntryId: string, updates: Partial<TimeEntry>) => Promise<void>;
  
  // Invoices
  fetchInvoices: () => Promise<void>;
  createInvoice: (data: {
    employer_id: string;
    period_start: string;
    period_end: string;
    due_date: string;
    tax_rate?: number;
    notes?: string;
  }) => Promise<Invoice>;
  addInvoiceLineItem: (invoiceId: string, lineItem: {
    time_entry_id?: string;
    description: string;
    quantity: number;
    unit_price: number;
  }) => Promise<void>;
  updateInvoiceStatus: (invoiceId: string, status: Invoice['status']) => Promise<void>;
  deleteInvoice: (invoiceId: string) => Promise<void>;
  
  // Stats
  getTimeStats: (startDate: string, endDate: string) => Promise<any>;
}

export const useTimeTrackingStore = create<TimeTrackingState>((set, get) => ({
  timeEntries: [],
  invoices: [],
  activeEntry: null,
  loading: false,
  error: null,

  fetchTimeEntries: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ timeEntries: mockTimeEntries as any, loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      let entries;
      if (user.role === 'worker') {
        entries = await timeTrackingService.getWorkerTimeEntries(user.id);
      } else {
        entries = await timeTrackingService.getEmployerTimeEntries(user.id);
      }
      
      // Find active entry
      const activeEntry = entries.find(e => e.status === 'in_progress') || null;
      
      set({ timeEntries: entries, activeEntry, loading: false });
    } catch (error) {
      console.error('Failed to fetch time entries:', error);
      set({ timeEntries: mockTimeEntries as any, loading: false, error: 'Failed to load time entries' });
    }
  },

  clockIn: async (deploymentId, shiftId, hourlyRate, location) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');

    set({ loading: true, error: null });
    try {
      const entry = await timeTrackingService.clockIn(deploymentId, user.id, shiftId, hourlyRate, location);
      set(state => ({
        timeEntries: [entry, ...state.timeEntries],
        activeEntry: entry,
        loading: false,
      }));
      return entry;
    } catch (error: any) {
      console.error('Failed to clock in:', error);
      set({ loading: false, error: error.message || 'Failed to clock in' });
      throw error;
    }
  },

  clockOut: async (timeEntryId, breakMinutes = 0, location) => {
    set({ loading: true, error: null });
    try {
      const entry = await timeTrackingService.clockOut(timeEntryId, breakMinutes, location);
      set(state => ({
        timeEntries: state.timeEntries.map(e => e.id === timeEntryId ? entry : e),
        activeEntry: null,
        loading: false,
      }));
      return entry;
    } catch (error: any) {
      console.error('Failed to clock out:', error);
      set({ loading: false, error: error.message || 'Failed to clock out' });
      throw error;
    }
  },

  approveTimeEntry: async (timeEntryId, notes) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');

    set({ loading: true, error: null });
    try {
      const entry = await timeTrackingService.approveTimeEntry(timeEntryId, user.id, notes);
      set(state => ({
        timeEntries: state.timeEntries.map(e => e.id === timeEntryId ? entry : e),
        loading: false,
      }));
    } catch (error: any) {
      console.error('Failed to approve time entry:', error);
      set({ loading: false, error: error.message || 'Failed to approve' });
      throw error;
    }
  },

  rejectTimeEntry: async (timeEntryId, reason) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');

    set({ loading: true, error: null });
    try {
      const entry = await timeTrackingService.rejectTimeEntry(timeEntryId, user.id, reason);
      set(state => ({
        timeEntries: state.timeEntries.map(e => e.id === timeEntryId ? entry : e),
        loading: false,
      }));
    } catch (error: any) {
      console.error('Failed to reject time entry:', error);
      set({ loading: false, error: error.message || 'Failed to reject' });
      throw error;
    }
  },

  updateTimeEntry: async (timeEntryId, updates) => {
    set({ loading: true, error: null });
    try {
      const entry = await timeTrackingService.updateTimeEntry(timeEntryId, updates);
      set(state => ({
        timeEntries: state.timeEntries.map(e => e.id === timeEntryId ? entry : e),
        loading: false,
      }));
    } catch (error: any) {
      console.error('Failed to update time entry:', error);
      set({ loading: false, error: error.message || 'Failed to update' });
      throw error;
    }
  },

  fetchInvoices: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ invoices: mockInvoices as any, loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      let invoices;
      if (user.role === 'worker') {
        invoices = await timeTrackingService.getWorkerInvoices(user.id);
      } else {
        invoices = await timeTrackingService.getEmployerInvoices(user.id);
      }
      set({ invoices, loading: false });
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      set({ invoices: mockInvoices as any, loading: false, error: 'Failed to load invoices' });
    }
  },

  createInvoice: async (data) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');

    set({ loading: true, error: null });
    try {
      const invoice = await timeTrackingService.createInvoice({
        worker_id: user.id,
        ...data,
      });
      set(state => ({
        invoices: [invoice, ...state.invoices],
        loading: false,
      }));
      return invoice;
    } catch (error: any) {
      console.error('Failed to create invoice:', error);
      set({ loading: false, error: error.message || 'Failed to create invoice' });
      throw error;
    }
  },

  addInvoiceLineItem: async (invoiceId, lineItem) => {
    set({ loading: true, error: null });
    try {
      const item = await timeTrackingService.addInvoiceLineItem({
        invoice_id: invoiceId,
        ...lineItem,
      });
      
      // Refresh the invoice
      const invoice = await timeTrackingService.getInvoice(invoiceId);
      set(state => ({
        invoices: state.invoices.map(inv => inv.id === invoiceId ? invoice : inv),
        loading: false,
      }));
    } catch (error: any) {
      console.error('Failed to add line item:', error);
      set({ loading: false, error: error.message || 'Failed to add line item' });
      throw error;
    }
  },

  updateInvoiceStatus: async (invoiceId, status) => {
    set({ loading: true, error: null });
    try {
      const invoice = await timeTrackingService.updateInvoiceStatus(invoiceId, status);
      set(state => ({
        invoices: state.invoices.map(inv => inv.id === invoiceId ? invoice : inv),
        loading: false,
      }));
    } catch (error: any) {
      console.error('Failed to update invoice status:', error);
      set({ loading: false, error: error.message || 'Failed to update status' });
      throw error;
    }
  },

  deleteInvoice: async (invoiceId) => {
    set({ loading: true, error: null });
    try {
      await timeTrackingService.deleteInvoice(invoiceId);
      set(state => ({
        invoices: state.invoices.filter(inv => inv.id !== invoiceId),
        loading: false,
      }));
    } catch (error: any) {
      console.error('Failed to delete invoice:', error);
      set({ loading: false, error: error.message || 'Failed to delete invoice' });
      throw error;
    }
  },

  getTimeStats: async (startDate, endDate) => {
    const user = useAuthStore.getState().user;
    if (!user || user.role !== 'worker') return null;

    try {
      return await timeTrackingService.getWorkerTimeStats(user.id, startDate, endDate);
    } catch (error) {
      console.error('Failed to get time stats:', error);
      return null;
    }
  },
}));
