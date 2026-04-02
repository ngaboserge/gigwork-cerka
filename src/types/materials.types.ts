// Materials Marketplace Type Definitions

export interface Material {
  id: string;
  name: string;
  unit: string;
  category: string;
  sector?: string;
  subcategory?: string;
  icon?: string;
  created_by?: string | null;
  is_custom?: boolean;
  status?: 'active' | 'pending' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Location {
  city?: string;
  area?: string;
  gps_latitude?: number;
  gps_longitude?: number;
}

export type TrendIndicator = 'up' | 'down' | 'stable';

export interface PriceSubmission {
  id: string;
  user_id: string;
  material_id: string;
  price: number;
  quantity?: number;
  location: string;
  gps_latitude?: number;
  gps_longitude?: number;
  photo_url?: string;
  thumbnail_url?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  submitted_at: string;
  moderated_at?: string;
  moderated_by?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AggregatedPrice {
  id: string;
  material_id: string;
  location: string;
  median_price: number;
  min_price: number;
  max_price: number;
  submission_count: number;
  last_updated: string;
  created_at: string;
  material?: Material;
}

export interface PriceHistoryPoint {
  id: string;
  material_id: string;
  location: string;
  date: string;
  median_price: number;
  min_price: number;
  max_price: number;
  submission_count: number;
  created_at: string;
}

export interface ReliabilityScore {
  id: string;
  user_id: string;
  score: number;
  total_submissions: number;
  approved_count: number;
  rejected_count: number;
  flagged_count: number;
  consistency_bonus: number;
  last_updated: string;
  created_at: string;
}

export interface SupplierListing {
  id: string;
  supplier_id: string;
  material_id: string;
  price: number;
  min_quantity?: number;
  location: string;
  city?: string;
  area?: string;
  delivery_info?: string;
  photos?: string[];
  contact_phone?: string;
  contact_whatsapp?: string;
  status: 'active' | 'inactive' | 'deleted';
  created_at: string;
  updated_at: string;
  material?: Material;
  supplier?: {
    id: string;
    full_name: string;
    business_name?: string;
    is_verified_supplier: boolean;
    average_rating: number;
  };
}

export interface ListingAnalytics {
  id: string;
  listing_id: string;
  view_count: number;
  quote_request_count: number;
  contact_count: number;
  last_viewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteRequest {
  id: string;
  buyer_id: string;
  supplier_id: string;
  listing_id: string;
  quantity: number;
  delivery_location: string;
  notes?: string;
  status: 'pending' | 'responded' | 'accepted' | 'declined' | 'cancelled';
  created_at: string;
  updated_at: string;
  listing?: SupplierListing;
  supplier?: {
    id: string;
    full_name: string;
    business_name?: string;
  };
}

export interface SupplierRating {
  id: string;
  buyer_id: string;
  supplier_id: string;
  rating: number;
  review?: string;
  created_at: string;
  buyer?: {
    id: string;
    full_name: string;
  };
}

export interface BuyerFavorite {
  id: string;
  buyer_id: string;
  supplier_id: string;
  created_at: string;
  supplier?: {
    id: string;
    full_name: string;
    business_name?: string;
    is_verified_supplier: boolean;
    average_rating: number;
  };
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  documents?: string[];
  business_name?: string;
  business_description?: string;
  created_at: string;
  processed_at?: string;
  processed_by?: string;
  admin_notes?: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface PriceSubmissionForm {
  material_id: string;
  price: number;
  quantity?: number;
  location: string;
  gps_latitude?: number;
  gps_longitude?: number;
  photo?: File;
  notes?: string;
}

export interface ListingForm {
  material_id: string;
  price: number;
  min_quantity?: number;
  location: string;
  city?: string;
  area?: string;
  delivery_info?: string;
  photos?: File[] | string[]; // Support both File objects and URLs
  contact_phone?: string;
  contact_whatsapp?: string;
}

export interface SearchFilters {
  material_id?: string;
  location?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  verified_only?: boolean;
  distance_km?: number;
}
