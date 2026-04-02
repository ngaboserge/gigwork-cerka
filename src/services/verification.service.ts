import { supabaseUntyped as supabase } from '@/lib/supabase';

export interface RwandaIDValidation {
  valid: boolean;
  errors: string[];
  extracted: {
    gender: 'Male' | 'Female';
    dateOfBirth: string;
    age: number;
  } | null;
}

export interface KYCVerification {
  id: string;
  user_id: string;
  country: string;
  document_type: string;
  document_number: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  place_of_birth?: string;
  document_front_url?: string;
  document_back_url?: string;
  selfie_url?: string;
  status: 'not_started' | 'pending' | 'under_review' | 'approved' | 'rejected';
  rejection_reason?: string;
  admin_notes?: string;
  submitted_at: string;
  approved_at?: string;
  face_match_passed?: boolean;
  document_valid?: boolean;
}

class VerificationService {
  /**
   * Validate Rwanda National ID format
   */
  validateRwandaID(idNumber: string): RwandaIDValidation {
    const errors: string[] = [];
    
    // Remove spaces and dashes
    const cleanID = idNumber.replace(/[\s-]/g, '');
    
    // Check length
    if (cleanID.length !== 16) {
      errors.push('ID must be 16 digits');
      return { valid: false, errors, extracted: null };
    }
    
    // Check if all digits
    if (!/^\d+$/.test(cleanID)) {
      errors.push('ID must contain only digits');
      return { valid: false, errors, extracted: null };
    }
    
    // Extract components
    const genderDigit = cleanID[0];
    const year = cleanID.substring(1, 5);
    const month = cleanID.substring(5, 7);
    const day = cleanID.substring(7, 9);
    
    // Validate gender
    if (genderDigit !== '1' && genderDigit !== '2') {
      errors.push('Invalid gender digit (must be 1 for Male or 2 for Female)');
    }
    
    // Validate date
    const birthDate = new Date(`${year}-${month}-${day}`);
    if (isNaN(birthDate.getTime())) {
      errors.push('Invalid date of birth in ID number');
    }
    
    // Check if date is in the past
    if (birthDate > new Date()) {
      errors.push('Date of birth cannot be in the future');
    }
    
    // Check minimum age (18 years)
    const today = new Date();
    const age = today.getFullYear() - parseInt(year);
    const monthDiff = today.getMonth() + 1 - parseInt(month);
    const dayDiff = today.getDate() - parseInt(day);
    
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
    
    if (actualAge < 18) {
      errors.push('Must be at least 18 years old');
    }
    
    if (errors.length > 0) {
      return { valid: false, errors, extracted: null };
    }
    
    return {
      valid: true,
      errors: [],
      extracted: {
        gender: genderDigit === '1' ? 'Male' : 'Female',
        dateOfBirth: `${year}-${month}-${day}`,
        age: actualAge
      }
    };
  }

  /**
   * Upload document to Supabase Storage
   */
  async uploadDocument(
    userId: string,
    file: File,
    type: 'id_front' | 'id_back' | 'selfie'
  ): Promise<{ url: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return { url: '', error: error.message };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(fileName);

      return { url: publicUrl };
    } catch (error: any) {
      console.error('Upload error:', error);
      return { url: '', error: error.message };
    }
  }

  /**
   * Submit KYC verification
   */
  async submitVerification(data: {
    document_number: string;
    full_name: string;
    date_of_birth: string;
    gender: string;
    place_of_birth?: string;
    document_front_url: string;
    selfie_url: string;
    document_back_url?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        return { success: false, error: 'Not authenticated' };
      }

      const userId = session.session.user.id;

      // Check if verification already exists
      const { data: existing, error: existingError } = await supabase
        .from('kyc_verifications')
        .select('id, status')
        .eq('user_id', userId)
        .single();

      // Ignore "not found" error
      if (existingError && existingError.code !== 'PGRST116') {
        console.error('Check existing error:', existingError);
      }

      if (existing && existing.status === 'approved') {
        return { success: false, error: 'Already verified' };
      }

      if (existing && existing.status === 'pending') {
        return { success: false, error: 'Verification already pending review' };
      }

      const verificationData = {
        user_id: userId,
        country: 'RW',
        document_type: 'national_id',
        document_number: data.document_number,
        full_name: data.full_name,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        place_of_birth: data.place_of_birth,
        document_front_url: data.document_front_url,
        document_back_url: data.document_back_url,
        selfie_url: data.selfie_url,
        status: 'pending',
        verification_method: 'manual',
        submitted_at: new Date().toISOString()
      };

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('kyc_verifications')
          .update(verificationData)
          .eq('id', existing.id);

        if (error) {
          console.error('Update error:', error);
          return { success: false, error: error.message };
        }
      } else {
        // Insert new
        const { error } = await supabase
          .from('kyc_verifications')
          .insert(verificationData);

        if (error) {
          console.error('Insert error:', error);
          return { success: false, error: error.message };
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Submit error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's verification status
   */
  async getVerificationStatus(): Promise<KYCVerification | null> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return null;

      const { error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', session.session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Get verification error:', error);
        return null;
      }

      // If no error or "not found" error, fetch the data
      const { data } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', session.session.user.id)
        .maybeSingle();

      return data as KYCVerification;
    } catch (error) {
      console.error('Get verification error:', error);
      return null;
    }
  }

  /**
   * Get all pending verifications (admin only)
   */
  async getPendingVerifications(): Promise<KYCVerification[]> {
    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select(`
          *,
          profiles:user_id (
            email,
            role
          )
        `)
        .in('status', ['pending', 'under_review'])
        .order('submitted_at', { ascending: true });

      if (error) {
        console.error('Get pending error:', error);
        return [];
      }

      return data as KYCVerification[];
    } catch (error) {
      console.error('Get pending error:', error);
      return [];
    }
  }

  /**
   * Get verifications by status (admin only)
   */
  async getVerificationsByStatus(status: 'approved' | 'rejected'): Promise<KYCVerification[]> {
    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select(`
          *,
          profiles:user_id (
            email,
            role
          )
        `)
        .eq('status', status)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Get verifications by status error:', error);
        return [];
      }

      return data as KYCVerification[];
    } catch (error) {
      console.error('Get verifications by status error:', error);
      return [];
    }
  }

  /**
   * Approve verification (admin only)
   */
  async approveVerification(
    verificationId: string,
    adminNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        return { success: false, error: 'Not authenticated' };
      }

      // Get verification to get user_id
      const { data: verification } = await supabase
        .from('kyc_verifications')
        .select('user_id, full_name')
        .eq('id', verificationId)
        .single();

      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          reviewed_by: session.session.user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes,
          face_match_passed: true,
          document_valid: true
        })
        .eq('id', verificationId);

      if (error) {
        console.error('Approve error:', error);
        return { success: false, error: error.message };
      }

      // Send notification to user
      if (verification) {
        await supabase
          .from('notifications')
          .insert({
            user_id: verification.user_id,
            type: 'verification',
            title: 'ID Verification Approved!',
            message: 'Your identity verification has been approved. You can now access all platform features.',
            data: {
              verification_id: verificationId,
              link: '/employee/verification',
            },
          } as any);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Approve error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reject verification (admin only)
   */
  async rejectVerification(
    verificationId: string,
    reason: string,
    adminNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        return { success: false, error: 'Not authenticated' };
      }

      // Get verification to get user_id
      const { data: verification } = await supabase
        .from('kyc_verifications')
        .select('user_id, full_name')
        .eq('id', verificationId)
        .single();

      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          reviewed_by: session.session.user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes
        })
        .eq('id', verificationId);

      if (error) {
        console.error('Reject error:', error);
        return { success: false, error: error.message };
      }

      // Send notification to user
      if (verification) {
        await supabase
          .from('notifications')
          .insert({
            user_id: verification.user_id,
            type: 'verification',
            title: 'ID Verification Rejected',
            message: `Your verification was rejected: ${reason}. Please resubmit with correct information.`,
            data: {
              verification_id: verificationId,
              rejection_reason: reason,
              link: '/employee/verification',
            },
          } as any);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Reject error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get verification badges for user
   */
  async getVerificationBadges(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('verification_badges')
        .select('badge_type')
        .eq('user_id', userId);

      if (error) {
        console.error('Get badges error:', error);
        return [];
      }

      return data.map(b => b.badge_type);
    } catch (error) {
      console.error('Get badges error:', error);
      return [];
    }
  }
}

export const verificationService = new VerificationService();
