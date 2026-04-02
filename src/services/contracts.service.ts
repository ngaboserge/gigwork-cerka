import { supabaseUntyped as supabase } from '@/lib/supabase';
import type { Contract } from '@/types';

export interface ContractRow {
  id: string;
  deployment_id: string;
  shift_id: string;
  employer_id: string;
  worker_id: string;
  title: string;
  description: string | null;
  terms: string;
  hourly_rate: number;
  total_hours: number | null;
  total_amount: number | null;
  start_date: string;
  end_date: string | null;
  status: 'draft' | 'pending_employee' | 'pending_employer' | 'active' | 'completed' | 'terminated' | 'disputed';
  worker_signed: boolean;
  employer_signed: boolean;
  worker_signed_at: string | null;
  employer_signed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  employer?: { company_name: string };
  shift?: { title: string };
}

function mapContractRowToContract(row: ContractRow): Contract {
  return {
    id: row.id,
    applicationId: row.deployment_id,
    jobId: row.shift_id,
    employerId: row.employer_id,
    employeeId: row.worker_id,
    terms: row.terms,
    payRate: row.hourly_rate,
    payType: 'hourly', // Default since old schema doesn't have pay_type
    startDate: row.start_date,
    endDate: row.end_date || undefined,
    status: row.status,
    employerSignedAt: row.employer_signed_at || undefined,
    employeeSignedAt: row.worker_signed_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const contractsService = {
  // Get contracts for employee
  async getEmployeeContracts(employeeId: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        employer:employer_id(company_name:employer_profiles(company_name)),
        shift:shift_id(title)
      `)
      .eq('worker_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching employee contracts:', error);
      throw error;
    }

    return (data || []).map(mapContractRowToContract);
  },

  // Get contracts for employer
  async getEmployerContracts(employerId: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        employee:worker_id(first_name:worker_profiles(first_name), last_name:worker_profiles(last_name)),
        shift:shift_id(title)
      `)
      .eq('employer_id', employerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching employer contracts:', error);
      throw error;
    }

    return (data || []).map(mapContractRowToContract);
  },

  // Get single contract
  async getContract(contractId: string): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data ? mapContractRowToContract(data) : null;
  },

  // Create contract (employer)
  async createContract(contract: {
    employerId: string;
    employeeId: string;
    jobId?: string;
    applicationId?: string;
    title: string;
    terms: string;
    payRate: number;
    payType: 'hourly' | 'daily' | 'fixed';
    startDate: string;
    endDate?: string;
  }): Promise<Contract> {
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        employer_id: contract.employerId,
        worker_id: contract.employeeId,
        shift_id: contract.jobId || null,
        deployment_id: contract.applicationId || null,
        title: contract.title,
        terms: contract.terms,
        hourly_rate: contract.payRate,
        start_date: contract.startDate,
        end_date: contract.endDate || null,
        status: 'pending_employee',
        employer_signed: true,
        employer_signed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return mapContractRowToContract(data);
  },

  // Sign contract (employee)
  async signContract(contractId: string, employeeId: string): Promise<Contract> {
    const { data, error } = await supabase
      .from('contracts')
      .update({
        status: 'active',
        worker_signed: true,
        worker_signed_at: new Date().toISOString(),
      })
      .eq('id', contractId)
      .eq('worker_id', employeeId)
      .eq('status', 'pending_employee')
      .select()
      .single();

    if (error) throw error;
    return mapContractRowToContract(data);
  },

  // Complete contract
  async completeContract(contractId: string): Promise<Contract> {
    const { data, error } = await supabase
      .from('contracts')
      .update({ status: 'completed' })
      .eq('id', contractId)
      .select()
      .single();

    if (error) throw error;
    return mapContractRowToContract(data);
  },

  // Terminate contract
  async terminateContract(
    contractId: string, 
    terminatedBy: string, 
    reason: string
  ): Promise<Contract> {
    const { data, error } = await supabase
      .from('contracts')
      .update({
        status: 'terminated',
      })
      .eq('id', contractId)
      .select()
      .single();

    if (error) throw error;
    return mapContractRowToContract(data);
  },
};
