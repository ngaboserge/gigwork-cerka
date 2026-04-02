import { supabase } from '../lib/supabase';
import type { SupplierRating } from '../types/materials.types';

export const supplierRatingsService = {
  async rateSupplier(data: {
    buyer_id: string;
    supplier_id: string;
    rating: number;
    review?: string;
  }): Promise<SupplierRating> {
    // Validate rating range
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const { data: rating, error } = await supabase
      .from('supplier_ratings')
      .insert(data)
      .select(`
        *,
        profiles!supplier_ratings_buyer_id_fkey(id, full_name)
      `)
      .single();

    if (error) throw error;

    // Update supplier's average rating
    await this.updateSupplierAverageRating(data.supplier_id);

    return rating;
  },

  async getSupplierRatings(supplierId: string): Promise<SupplierRating[]> {
    const { data, error } = await supabase
      .from('supplier_ratings')
      .select(`
        *,
        profiles!supplier_ratings_buyer_id_fkey(id, full_name)
      `)
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAverageRating(supplierId: string): Promise<{ average: number; count: number }> {
    const { data, error } = await supabase
      .from('supplier_ratings')
      .select('rating')
      .eq('supplier_id', supplierId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = data.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / data.length;

    return { average, count: data.length };
  },

  async updateSupplierAverageRating(supplierId: string): Promise<void> {
    const { average, count } = await this.getAverageRating(supplierId);

    const { error } = await supabase
      .from('profiles')
      .update({
        average_rating: average,
        total_ratings: count
      })
      .eq('id', supplierId);

    if (error) throw error;
  },

  async hasRated(buyerId: string, supplierId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('supplier_ratings')
      .select('id')
      .eq('buyer_id', buyerId)
      .eq('supplier_id', supplierId)
      .single();

    return !!data;
  }
};
