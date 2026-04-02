import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { favoritesService } from '@/services/favorites.service';
import type { FavoriteWorker, FavoriteEmployer } from '@/types';

interface FavoritesState {
  favoriteWorkers: FavoriteWorker[];
  favoriteEmployers: FavoriteEmployer[];
  loading: boolean;
  error: string | null;
  fetchFavoriteWorkers: (employerId: string) => Promise<void>;
  fetchFavoriteEmployers: (workerId: string) => Promise<void>;
  addFavoriteWorker: (employerId: string, workerId: string, notes?: string) => Promise<void>;
  addFavoriteEmployer: (workerId: string, employerId: string, notes?: string) => Promise<void>;
  removeFavoriteWorker: (workerId: string) => Promise<void>;
  removeFavoriteEmployer: (employerId: string) => Promise<void>;
  updateWorkerNotes: (workerId: string, notes: string) => Promise<void>;
  updateEmployerNotes: (employerId: string, notes: string) => Promise<void>;
  isWorkerFavorite: (workerId: string) => boolean;
  isEmployerFavorite: (employerId: string) => boolean;
  clearError: () => void;
}

// Keep mock data as fallback
const mockFavoriteWorkers: FavoriteWorker[] = [
  {
    id: 'fav_w1',
    workerId: 'worker_2',
    workerName: 'Maria Garcia',
    workerAvatar: undefined,
    workerRating: 4.9,
    workerSkills: ['Forklift Operation', 'Inventory Management', 'Heavy Lifting'],
    employerId: 'emp_1',
    notes: 'Excellent worker, always on time',
    hiredCount: 12,
    lastHiredAt: '2026-01-05',
    addedAt: '2025-06-15',
  },
  {
    id: 'fav_w2',
    workerId: 'worker_3',
    workerName: 'James Wilson',
    workerAvatar: undefined,
    workerRating: 4.7,
    workerSkills: ['Event Setup', 'Customer Service', 'Heavy Lifting'],
    employerId: 'emp_1',
    notes: 'Great for events',
    hiredCount: 8,
    lastHiredAt: '2025-12-20',
    addedAt: '2025-08-10',
  },
];

const mockFavoriteEmployers: FavoriteEmployer[] = [
  {
    id: 'fav_e1',
    employerId: 'emp_1',
    employerName: 'FastShip Logistics',
    employerLogo: undefined,
    employerRating: 4.8,
    companyName: 'FastShip Logistics',
    workerId: 'worker_1',
    notes: 'Great pay, flexible hours',
    workedCount: 15,
    lastWorkedAt: '2026-01-10',
    addedAt: '2025-05-20',
  },
  {
    id: 'fav_e2',
    employerId: 'emp_2',
    employerName: 'Premier Events Co',
    employerLogo: undefined,
    employerRating: 4.6,
    companyName: 'Premier Events Co',
    workerId: 'worker_1',
    notes: 'Fun events, good team',
    workedCount: 8,
    lastWorkedAt: '2025-12-15',
    addedAt: '2025-07-10',
  },
];

let currentEmployerId: string | null = null;
let currentWorkerId: string | null = null;

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteWorkers: [],
      favoriteEmployers: [],
      loading: false,
      error: null,

      fetchFavoriteWorkers: async (employerId: string) => {
        set({ loading: true, error: null });
        currentEmployerId = employerId;
        
        try {
          const workers = await favoritesService.getFavoriteWorkers(employerId);
          // Always use real data, even if empty
          set({ favoriteWorkers: workers, loading: false });
        } catch (error) {
          console.error('Error fetching favorite workers:', error);
          // Show empty state on error instead of mock data
          set({ favoriteWorkers: [], loading: false, error: 'Failed to load favorites' });
        }
      },

      fetchFavoriteEmployers: async (workerId: string) => {
        set({ loading: true, error: null });
        currentWorkerId = workerId;
        
        try {
          const employers = await favoritesService.getFavoriteEmployers(workerId);
          // Always use real data, even if empty
          set({ favoriteEmployers: employers, loading: false });
        } catch (error) {
          console.error('Error fetching favorite employers:', error);
          // Show empty state on error instead of mock data
          set({ favoriteEmployers: [], loading: false, error: 'Failed to load favorites' });
        }
      },

      addFavoriteWorker: async (employerId: string, workerId: string, notes?: string) => {
        try {
          const newFavorite = await favoritesService.addFavoriteWorker(employerId, workerId, notes);
          set(state => ({ favoriteWorkers: [...state.favoriteWorkers, newFavorite] }));
        } catch (error) {
          console.error('Error adding favorite worker:', error);
          set({ error: 'Failed to add favorite worker' });
        }
      },

      addFavoriteEmployer: async (workerId: string, employerId: string, notes?: string) => {
        try {
          const newFavorite = await favoritesService.addFavoriteEmployer(workerId, employerId, notes);
          set(state => ({ favoriteEmployers: [...state.favoriteEmployers, newFavorite] }));
        } catch (error) {
          console.error('Error adding favorite employer:', error);
          set({ error: 'Failed to add favorite employer' });
        }
      },

      removeFavoriteWorker: async (workerId: string) => {
        if (!currentEmployerId) return;
        
        try {
          await favoritesService.removeFavoriteWorker(currentEmployerId, workerId);
          set(state => ({
            favoriteWorkers: state.favoriteWorkers.filter(w => w.workerId !== workerId),
          }));
        } catch (error) {
          console.error('Error removing favorite worker:', error);
          // Still remove from local state for better UX
          set(state => ({
            favoriteWorkers: state.favoriteWorkers.filter(w => w.workerId !== workerId),
          }));
        }
      },

      removeFavoriteEmployer: async (employerId: string) => {
        if (!currentWorkerId) return;
        
        try {
          await favoritesService.removeFavoriteEmployer(currentWorkerId, employerId);
          set(state => ({
            favoriteEmployers: state.favoriteEmployers.filter(e => e.employerId !== employerId),
          }));
        } catch (error) {
          console.error('Error removing favorite employer:', error);
          // Still remove from local state for better UX
          set(state => ({
            favoriteEmployers: state.favoriteEmployers.filter(e => e.employerId !== employerId),
          }));
        }
      },

      updateWorkerNotes: async (workerId: string, notes: string) => {
        if (!currentEmployerId) return;
        
        try {
          await favoritesService.updateFavoriteWorkerNotes(currentEmployerId, workerId, notes);
          set(state => ({
            favoriteWorkers: state.favoriteWorkers.map(w =>
              w.workerId === workerId ? { ...w, notes } : w
            ),
          }));
        } catch (error) {
          console.error('Error updating worker notes:', error);
          // Still update local state
          set(state => ({
            favoriteWorkers: state.favoriteWorkers.map(w =>
              w.workerId === workerId ? { ...w, notes } : w
            ),
          }));
        }
      },

      updateEmployerNotes: async (employerId: string, notes: string) => {
        if (!currentWorkerId) return;
        
        try {
          await favoritesService.updateFavoriteEmployerNotes(currentWorkerId, employerId, notes);
          set(state => ({
            favoriteEmployers: state.favoriteEmployers.map(e =>
              e.employerId === employerId ? { ...e, notes } : e
            ),
          }));
        } catch (error) {
          console.error('Error updating employer notes:', error);
          // Still update local state
          set(state => ({
            favoriteEmployers: state.favoriteEmployers.map(e =>
              e.employerId === employerId ? { ...e, notes } : e
            ),
          }));
        }
      },

      isWorkerFavorite: (workerId: string) => {
        return get().favoriteWorkers.some(w => w.workerId === workerId);
      },

      isEmployerFavorite: (employerId: string) => {
        return get().favoriteEmployers.some(e => e.employerId === employerId);
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'favorites-storage',
      partialize: (state) => ({
        favoriteWorkers: state.favoriteWorkers,
        favoriteEmployers: state.favoriteEmployers,
      }),
    }
  )
);
