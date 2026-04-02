import { supabase } from '../lib/supabase';
import type { PriceSubmission, PriceSubmissionForm } from '../types/materials.types';

export const priceSubmissionsService = {
  async submitPrice(formData: PriceSubmissionForm, userId: string): Promise<PriceSubmission> {
    // Validate positive price
    if (formData.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    // Upload photo if provided (and it's a File object, not a string)
    let photoUrl: string | undefined;
    let thumbnailUrl: string | undefined;
    
    if (formData.photo && formData.photo instanceof File) {
      try {
        const uploadResult = await this.uploadPhoto(formData.photo, userId);
        photoUrl = uploadResult.photoUrl;
        thumbnailUrl = uploadResult.thumbnailUrl;
      } catch (error: any) {
        // If photo upload fails, continue without photo
        console.error('Photo upload failed:', error);
        // Don't throw - allow submission without photo
      }
    }

    const submissionData = {
      user_id: userId,
      material_id: formData.material_id,
      price: formData.price,
      quantity: formData.quantity,
      location: formData.location,
      gps_latitude: formData.gps_latitude,
      gps_longitude: formData.gps_longitude,
      photo_url: photoUrl,
      thumbnail_url: thumbnailUrl,
      notes: formData.notes,
      status: 'approved' as const  // Auto-approve all submissions
    };

    const { data, error } = await supabase
      .from('price_submissions')
      .insert(submissionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserSubmissions(userId: string, limit?: number): Promise<PriceSubmission[]> {
    let query = supabase
      .from('price_submissions')
      .select('*, materials(*)')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getSubmissions(filters: {
    material_id?: string;
    location?: string;
    status?: string;
    user_id?: string;
    limit?: number;
  }): Promise<PriceSubmission[]> {
    let query = supabase
      .from('price_submissions')
      .select('*, materials(*)');

    if (filters.material_id) {
      query = query.eq('material_id', filters.material_id);
    }
    if (filters.location) {
      query = query.eq('location', filters.location);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    query = query.order('submitted_at', { ascending: false });

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async uploadPhoto(file: File, userId: string): Promise<{ photoUrl: string; thumbnailUrl: string }> {
    // Validate file format
    const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      throw new Error('Invalid photo format. Only JPEG, PNG, and WebP are allowed.');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Photo size must be less than 5MB');
    }

    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}_${file.name}`;

    // Upload full-size photo
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('price-photos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('price-photos')
      .getPublicUrl(fileName);

    // For now, use the same URL for thumbnail (can implement actual thumbnail generation later)
    return {
      photoUrl: publicUrl,
      thumbnailUrl: publicUrl
    };
  },

  async getSubmission(id: string): Promise<PriceSubmission | null> {
    const { data, error } = await supabase
      .from('price_submissions')
      .select('*, materials(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
};
