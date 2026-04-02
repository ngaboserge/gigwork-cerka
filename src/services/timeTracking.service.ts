import { supabaseUntyped as supabase } from '@/lib/supabase';

export interface TimeEntry {
  id: string;
  deployment_id: string;
  worker_id: string;
  shift_id: string;
  clock_in_time: string;
  clock_out_time?: string;
  break_minutes: number;
  total_minutes?: number;
  total_hours?: number;
  hourly_rate: number;
  regular_hours?: number;
  overtime_hours?: number;
  total_pay?: number;
  status: 'in_progress' | 'completed' | 'approved' | 'rejected' | 'invoiced' | 'paid';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  worker_notes?: string;
  employer_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  worker_id: string;
  employer_id: string;
  issue_date: string;
  due_date: string;
  period_start: string;
  period_end: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  paid_at?: string;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
  terms?: string;
  created_at: string;
  updated_at: string;
  line_items?: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  time_entry_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: string;
}

export const timeTrackingService = {
  // =====================================================
  // TIME ENTRIES
  // =====================================================

  async clockIn(deploymentId: string, workerId: string, shiftId: string, hourlyRate: number, location?: any) {
    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        deployment_id: deploymentId,
        worker_id: workerId,
        shift_id: shiftId,
        clock_in_time: new Date().toISOString(),
        clock_in_location: location,
        hourly_rate: hourlyRate,
        status: 'in_progress',
      })
      .select()
      .single();

    if (error) throw error;
    return data as TimeEntry;
  },

  async clockOut(timeEntryId: string, breakMinutes: number = 0, location?: any) {
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        clock_out_time: new Date().toISOString(),
        clock_out_location: location,
        break_minutes: breakMinutes,
      })
      .eq('id', timeEntryId)
      .select()
      .single();

    if (error) throw error;
    return data as TimeEntry;
  },

  async getWorkerTimeEntries(workerId: string, options?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    let query = supabase
      .from('time_entries')
      .select(`
        *,
        shifts(title, location_name, shift_date),
        profiles!time_entries_worker_id_fkey(
          employer_profiles(company_name)
        )
      `)
      .eq('worker_id', workerId)
      .order('clock_in_time', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.startDate) {
      query = query.gte('clock_in_time', options.startDate);
    }
    if (options?.endDate) {
      query = query.lte('clock_in_time', options.endDate);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as TimeEntry[];
  },

  async getEmployerTimeEntries(employerId: string, options?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    let query = supabase
      .from('time_entries')
      .select(`
        *,
        shifts!inner(employer_id, title, location_name),
        profiles!time_entries_worker_id_fkey(
          worker_profiles(first_name, last_name)
        )
      `)
      .eq('shifts.employer_id', employerId)
      .order('clock_in_time', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.startDate) {
      query = query.gte('clock_in_time', options.startDate);
    }
    if (options?.endDate) {
      query = query.lte('clock_in_time', options.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as TimeEntry[];
  },

  async approveTimeEntry(timeEntryId: string, employerId: string, notes?: string) {
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        status: 'approved',
        approved_by: employerId,
        approved_at: new Date().toISOString(),
        employer_notes: notes,
      })
      .eq('id', timeEntryId)
      .select()
      .single();

    if (error) throw error;
    return data as TimeEntry;
  },

  async rejectTimeEntry(timeEntryId: string, employerId: string, reason: string) {
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        status: 'rejected',
        approved_by: employerId,
        approved_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', timeEntryId)
      .select()
      .single();

    if (error) throw error;
    return data as TimeEntry;
  },

  async updateTimeEntry(timeEntryId: string, updates: Partial<TimeEntry>) {
    const { data, error } = await supabase
      .from('time_entries')
      .update(updates)
      .eq('id', timeEntryId)
      .select()
      .single();

    if (error) throw error;
    return data as TimeEntry;
  },

  // =====================================================
  // INVOICES
  // =====================================================

  async createInvoice(invoice: {
    worker_id: string;
    employer_id: string;
    period_start: string;
    period_end: string;
    due_date: string;
    tax_rate?: number;
    notes?: string;
    terms?: string;
  }) {
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        ...invoice,
        issue_date: new Date().toISOString().split('T')[0],
        tax_rate: invoice.tax_rate || 0,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Invoice;
  },

  async addInvoiceLineItem(lineItem: {
    invoice_id: string;
    time_entry_id?: string;
    description: string;
    quantity: number;
    unit_price: number;
  }) {
    const amount = lineItem.quantity * lineItem.unit_price;
    
    const { data, error } = await supabase
      .from('invoice_line_items')
      .insert({
        ...lineItem,
        amount,
      })
      .select()
      .single();

    if (error) throw error;
    return data as InvoiceLineItem;
  },

  async getWorkerInvoices(workerId: string, status?: string) {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        invoice_line_items(*)
      `)
      .eq('worker_id', workerId)
      .order('issue_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Fetch employer info separately for each invoice
    const invoicesWithEmployer = await Promise.all(
      (data || []).map(async (invoice) => {
        try {
          const { data: employerData } = await supabase
            .from('employer_profiles')
            .select('company_name, address, city, state, zip_code')
            .eq('user_id', invoice.employer_id)
            .single();
          
          // Format address from JSONB and separate fields
          let formattedAddress = '';
          if (employerData) {
            const addressParts = [];
            if (employerData.address) {
              // If address is JSONB, extract street
              const addr = typeof employerData.address === 'string' 
                ? JSON.parse(employerData.address) 
                : employerData.address;
              if (addr.street) addressParts.push(addr.street);
            }
            if (employerData.city) addressParts.push(employerData.city);
            if (employerData.state) addressParts.push(employerData.state);
            if (employerData.zip_code) addressParts.push(employerData.zip_code);
            formattedAddress = addressParts.join(', ');
          }
          
          return {
            ...invoice,
            employer_info: employerData ? {
              company_name: employerData.company_name,
              business_address: formattedAddress,
              phone: null // Phone not in employer_profiles, would need to get from profiles table
            } : null
          };
        } catch (err) {
          console.error('Error fetching employer profile:', err);
          // If employer profile fetch fails, return invoice without employer info
          return invoice;
        }
      })
    );
    
    return invoicesWithEmployer;
  },

  async getEmployerInvoices(employerId: string, status?: string) {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        invoice_line_items(*)
      `)
      .eq('employer_id', employerId)
      .order('issue_date', { ascending: false});

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Fetch worker info separately for each invoice
    const invoicesWithWorker = await Promise.all(
      (data || []).map(async (invoice) => {
        try {
          const { data: workerData } = await supabase
            .from('worker_profiles')
            .select('first_name, last_name')
            .eq('user_id', invoice.worker_id)
            .single();
          
          return {
            ...invoice,
            worker_info: workerData ? {
              name: `${workerData.first_name} ${workerData.last_name}`
            } : null
          };
        } catch (err) {
          console.error('Error fetching worker profile:', err);
          return invoice;
        }
      })
    );
    
    return invoicesWithWorker;
  },

  async getInvoice(invoiceId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_line_items(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (error) throw error;
    return data as Invoice;
  },

  async updateInvoiceStatus(invoiceId: string, status: Invoice['status']) {
    const updates: any = { status };
    
    if (status === 'paid') {
      updates.paid_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) throw error;
    return data as Invoice;
  },

  async deleteInvoice(invoiceId: string) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId)
      .eq('status', 'draft'); // Only allow deleting draft invoices

    if (error) throw error;
  },

  // =====================================================
  // STATISTICS
  // =====================================================

  async getWorkerTimeStats(workerId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('time_entries')
      .select('total_hours, total_pay, status')
      .eq('worker_id', workerId)
      .gte('clock_in_time', startDate)
      .lte('clock_in_time', endDate);

    if (error) throw error;

    const entries = data || [];
    const totalHours = entries.reduce((sum: number, e: any) => sum + (e.total_hours || 0), 0);
    const totalEarnings = entries.reduce((sum: number, e: any) => sum + (e.total_pay || 0), 0);
    const approvedHours = entries.filter((e: any) => e.status === 'approved').reduce((sum: number, e: any) => sum + (e.total_hours || 0), 0);
    const pendingHours = entries.filter((e: any) => e.status === 'completed').reduce((sum: number, e: any) => sum + (e.total_hours || 0), 0);

    return {
      totalHours,
      totalEarnings,
      approvedHours,
      pendingHours,
      entriesCount: entries.length,
    };
  },
};
