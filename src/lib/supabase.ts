import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file.');
}

// Create typed client for strict type checking
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Create untyped client for flexible queries (when types don't match schema)
export const supabaseUntyped = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Helper functions for common operations
export const supabaseHelpers = {
  // Get current user
  async getCurrentUser() {
    if (!isSupabaseConfigured) return null;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Get user profile with role-specific data
  async getUserProfile(userId: string) {
    if (!isSupabaseConfigured) return null;
    
    const { data: profile, error: profileError } = await supabaseUntyped
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;
    if (!profile) return null;

    const profileData = profile as { role: string; [key: string]: any };

    if (profileData.role === 'worker') {
      const { data: workerProfile, error } = await supabaseUntyped
        .from('worker_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return { ...profileData, ...workerProfile };
    } else if (profileData.role === 'employer') {
      const { data: employerProfile, error } = await supabaseUntyped
        .from('employer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return { ...profileData, ...employerProfile };
    }

    return profileData;
  },

  // Upload file to storage
  async uploadFile(bucket: string, path: string, file: File) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  },

  // Get public URL for a file
  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },
};
