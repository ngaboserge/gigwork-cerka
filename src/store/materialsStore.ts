import { create } from 'zustand';
import type { Material } from '../types/materials.types';
import { materialsService } from '../services/materials.service';

interface MaterialsState {
  materials: Material[];
  selectedMaterial: Material | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchMaterials: (category?: string) => Promise<void>;
  selectMaterial: (material: Material | null) => void;
  createMaterial: (data: Omit<Material, 'id' | 'created_at' | 'updated_at'>) => Promise<Material>;
  updateMaterial: (id: string, updates: Partial<Omit<Material, 'id' | 'created_at' | 'updated_at'>>) => Promise<Material>;
  getCategories: () => Promise<string[]>;
  reset: () => void;
}

export const useMaterialsStore = create<MaterialsState>((set, get) => ({
  materials: [],
  selectedMaterial: null,
  loading: false,
  error: null,

  fetchMaterials: async (category?: string) => {
    set({ loading: true, error: null });
    try {
      const materials = await materialsService.getMaterials(category);
      set({ materials, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  selectMaterial: (material) => {
    set({ selectedMaterial: material });
  },

  createMaterial: async (data) => {
    set({ loading: true, error: null });
    try {
      const material = await materialsService.createMaterial(data);
      set((state) => ({
        materials: [...state.materials, material],
        loading: false
      }));
      return material;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateMaterial: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const material = await materialsService.updateMaterial(id, updates);
      set((state) => ({
        materials: state.materials.map(m => m.id === id ? material : m),
        loading: false
      }));
      return material;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getCategories: async () => {
    try {
      return await materialsService.getCategories();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  reset: () => {
    set({
      materials: [],
      selectedMaterial: null,
      loading: false,
      error: null
    });
  }
}));
