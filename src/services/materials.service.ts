import { supabase } from '../lib/supabase';
import type { Material } from '../types/materials.types';

export const materialsService = {
  async getMaterials(category?: string): Promise<Material[]> {
    let query = supabase
      .from('materials')
      .select('*')
      .order('name');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getMaterial(id: string): Promise<Material | null> {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createMaterial(materialData: Omit<Material, 'id' | 'created_at' | 'updated_at'>): Promise<Material> {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    // Add metadata for custom materials
    const materialWithMetadata = {
      ...materialData,
      created_by: user?.id || null,
      is_custom: true,
      status: 'active' // or 'pending' if you want admin approval
    };

    const { data, error } = await supabase
      .from('materials')
      .insert(materialWithMetadata as any) // Type assertion until DB types are regenerated
      .select()
      .single();

    if (error) throw error;
    return data as Material;
  },

  async updateMaterial(id: string, updates: Partial<Omit<Material, 'id' | 'created_at' | 'updated_at'>>): Promise<Material> {
    const { data, error } = await supabase
      .from('materials')
      .update(updates as any) // Type assertion until DB types are regenerated
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Material;
  },

  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('materials')
      .select('category')
      .order('category');

    if (error) throw error;
    
    const categories = [...new Set((data as any)?.map((m: any) => m.category) || [])];
    return categories;
  }
};
