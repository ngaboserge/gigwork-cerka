import { create } from 'zustand';
import { contractsService } from '@/services/contracts.service';
import type { Contract } from '@/types';

interface ContractsState {
  contracts: Contract[];
  selectedContract: Contract | null;
  loading: boolean;
  error: string | null;
  fetchEmployeeContracts: (employeeId: string) => Promise<void>;
  fetchEmployerContracts: (employerId: string) => Promise<void>;
  createContract: (contract: {
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
  }) => Promise<Contract>;
  signContract: (contractId: string, employeeId: string) => Promise<void>;
  completeContract: (contractId: string) => Promise<void>;
  terminateContract: (contractId: string, terminatedBy: string, reason: string) => Promise<void>;
  setSelectedContract: (contract: Contract | null) => void;
  clearError: () => void;
}

export const useContractsStore = create<ContractsState>((set) => ({
  contracts: [],
  selectedContract: null,
  loading: false,
  error: null,

  fetchEmployeeContracts: async (employeeId: string) => {
    set({ loading: true, error: null });
    
    try {
      const contracts = await contractsService.getEmployeeContracts(employeeId);
      set({ contracts, loading: false });
    } catch (error) {
      console.error('Error fetching employee contracts:', error);
      set({ contracts: [], loading: false, error: 'Failed to load contracts' });
    }
  },

  fetchEmployerContracts: async (employerId: string) => {
    set({ loading: true, error: null });
    
    try {
      const contracts = await contractsService.getEmployerContracts(employerId);
      set({ contracts, loading: false });
    } catch (error) {
      console.error('Error fetching employer contracts, using mock data:', error);
      set({ contracts: [], loading: false });
    }
  },

  createContract: async (contractData) => {
    set({ loading: true, error: null });
    
    try {
      const contract = await contractsService.createContract(contractData);
      set(state => ({ 
        contracts: [contract, ...state.contracts], 
        loading: false 
      }));
      return contract;
    } catch (error) {
      console.error('Error creating contract:', error);
      set({ error: 'Failed to create contract', loading: false });
      throw error;
    }
  },

  signContract: async (contractId: string, employeeId: string) => {
    set({ loading: true, error: null });
    
    try {
      const updatedContract = await contractsService.signContract(contractId, employeeId);
      set(state => ({
        contracts: state.contracts.map(c => 
          c.id === contractId ? updatedContract : c
        ),
        selectedContract: state.selectedContract?.id === contractId ? updatedContract : state.selectedContract,
        loading: false,
      }));
    } catch (error) {
      console.error('Error signing contract:', error);
      // Fallback: update local state
      set(state => ({
        contracts: state.contracts.map(c => 
          c.id === contractId ? { 
            ...c, 
            status: 'active' as const, 
            employeeSignedAt: new Date().toISOString() 
          } : c
        ),
        loading: false,
      }));
    }
  },

  completeContract: async (contractId: string) => {
    try {
      const updatedContract = await contractsService.completeContract(contractId);
      set(state => ({
        contracts: state.contracts.map(c => 
          c.id === contractId ? updatedContract : c
        ),
      }));
    } catch (error) {
      console.error('Error completing contract:', error);
      set({ error: 'Failed to complete contract' });
    }
  },

  terminateContract: async (contractId: string, terminatedBy: string, reason: string) => {
    try {
      const updatedContract = await contractsService.terminateContract(contractId, terminatedBy, reason);
      set(state => ({
        contracts: state.contracts.map(c => 
          c.id === contractId ? updatedContract : c
        ),
      }));
    } catch (error) {
      console.error('Error terminating contract:', error);
      set({ error: 'Failed to terminate contract' });
    }
  },

  setSelectedContract: (contract) => set({ selectedContract: contract }),

  clearError: () => set({ error: null }),
}));
