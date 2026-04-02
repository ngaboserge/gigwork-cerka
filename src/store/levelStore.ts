import { create } from 'zustand';
import { levelsService } from '@/services/levels.service';
import type { WorkerLevel, WorkerBadge, WorkerLevelInfo } from '@/types';

interface LevelState {
  levelInfo: WorkerLevelInfo | null;
  pointsHistory: {
    id: string;
    eventType: string;
    pointsChange: number;
    pointsBefore: number;
    pointsAfter: number;
    createdAt: string;
    notes?: string;
  }[];
  loading: boolean;
  error: string | null;
  fetchLevelInfo: (userId: string) => Promise<void>;
  fetchPointsHistory: (userId: string) => Promise<void>;
  calculateLevel: (points: number) => WorkerLevel;
  clearError: () => void;
}

const LEVEL_THRESHOLDS = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  platinum: 3500,
};

const LEVEL_BENEFITS: Record<WorkerLevel, string[]> = {
  bronze: ['Access to all job listings', 'Basic profile badge'],
  silver: ['Priority job notifications', 'Silver badge on profile', '5% lower platform fees'],
  gold: ['Early access to premium jobs', 'Gold badge on profile', '10% lower platform fees', 'Dedicated support'],
  platinum: ['VIP job access', 'Platinum badge on profile', '15% lower platform fees', '24/7 priority support', 'Featured profile'],
};

// Mock badges for fallback
const mockBadges: WorkerBadge[] = [
  { id: '1', name: 'First Job', description: 'Completed your first job', icon: 'rocket', earnedAt: '2024-01-15', category: 'milestone' },
  { id: '2', name: '5-Star Streak', description: '10 consecutive 5-star ratings', icon: 'star', earnedAt: '2024-02-20', category: 'achievement' },
  { id: '3', name: 'Early Bird', description: 'Arrived early to 20 jobs', icon: 'clock', earnedAt: '2024-03-10', category: 'achievement' },
  { id: '4', name: 'Reliable', description: '50 jobs with 100% attendance', icon: 'shield', earnedAt: '2024-04-05', category: 'milestone' },
  { id: '5', name: 'Forklift Pro', description: 'Verified forklift certification', icon: 'truck', earnedAt: '2024-02-01', category: 'skill' },
  { id: '6', name: 'Century Club', description: 'Completed 100 jobs', icon: 'trophy', earnedAt: '2024-06-15', category: 'milestone' },
];

export const useLevelStore = create<LevelState>((set, get) => ({
  levelInfo: null,
  pointsHistory: [],
  loading: false,
  error: null,

  fetchLevelInfo: async (userId: string) => {
    set({ loading: true, error: null });
    
    try {
      const levelInfo = await levelsService.getWorkerLevelInfo(userId);
      set({ levelInfo, loading: false });
    } catch (error) {
      console.error('Error fetching level info, using mock data:', error);
      
      // Fallback to mock data
      const points = 1850;
      const level = get().calculateLevel(points);
      const nextLevel = level === 'platinum' ? 'platinum' : 
        level === 'gold' ? 'platinum' : 
        level === 'silver' ? 'gold' : 'silver';
      
      set({
        levelInfo: {
          level,
          points,
          nextLevelPoints: LEVEL_THRESHOLDS[nextLevel],
          benefits: LEVEL_BENEFITS[level],
          badges: mockBadges,
        },
        loading: false,
      });
    }
  },

  fetchPointsHistory: async (userId: string) => {
    try {
      const history = await levelsService.getPointsHistory(userId);
      set({ pointsHistory: history });
    } catch (error) {
      console.error('Error fetching points history:', error);
      set({ pointsHistory: [] });
    }
  },

  calculateLevel: (points: number): WorkerLevel => {
    if (points >= LEVEL_THRESHOLDS.platinum) return 'platinum';
    if (points >= LEVEL_THRESHOLDS.gold) return 'gold';
    if (points >= LEVEL_THRESHOLDS.silver) return 'silver';
    return 'bronze';
  },

  clearError: () => set({ error: null }),
}));
