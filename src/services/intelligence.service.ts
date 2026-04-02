import { supabase } from '../lib/supabase';

// =====================================================
// LAYER 1: RADICAL LOCALITY
// =====================================================

export interface LocalPriceResult {
  localPrice: number;
  confidence: number;
  dataPoints: number;
  avgAgeDays: number;
  avgTrustScore: number;
  freshness: 'live' | 'recent' | 'aging' | 'stale';
  qualityGrade: 'A' | 'B' | 'C' | 'D';
}

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  populationEstimate: number;
}

/**
 * Calculate local price with time decay and distance weighting
 */
export async function getLocalPrice(
  materialId: string,
  latitude: number,
  longitude: number,
  radiusKm: number = 5.0,
  daysBack: number = 30
): Promise<LocalPriceResult | null> {
  try {
    const { data, error } = await supabase.rpc('get_local_price', {
      p_material_id: materialId,
      p_latitude: latitude,
      p_longitude: longitude,
      p_radius_km: radiusKm,
      p_days_back: daysBack
    });

    if (error) throw error;
    if (!data || data.length === 0) return null;

    const result = data[0];

    // Determine freshness
    let freshness: LocalPriceResult['freshness'];
    if (result.avg_age_days < 1) freshness = 'live';
    else if (result.avg_age_days < 7) freshness = 'recent';
    else if (result.avg_age_days < 14) freshness = 'aging';
    else freshness = 'stale';

    // Determine quality grade
    let qualityGrade: LocalPriceResult['qualityGrade'];
    if (result.confidence >= 85 && result.data_points >= 10) qualityGrade = 'A';
    else if (result.confidence >= 70 && result.data_points >= 5) qualityGrade = 'B';
    else if (result.confidence >= 50) qualityGrade = 'C';
    else qualityGrade = 'D';

    return {
      localPrice: result.local_price,
      confidence: result.confidence,
      dataPoints: result.data_points,
      avgAgeDays: result.avg_age_days,
      avgTrustScore: result.avg_trust_score,
      freshness,
      qualityGrade
    };
  } catch (error) {
    console.error('Error getting local price:', error);
    return null;
  }
}

/**
 * Get all neighborhoods
 */
export async function getNeighborhoods(city?: string): Promise<Neighborhood[]> {
  try {
    let query = supabase
      .from('neighborhoods')
      .select('*')
      .order('city', { ascending: true })
      .order('name', { ascending: true });

    if (city) {
      query = query.eq('city', city);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(n => ({
      id: n.id,
      name: n.name,
      city: n.city,
      centerLat: n.center_lat,
      centerLng: n.center_lng,
      radiusKm: n.radius_km,
      populationEstimate: n.population_estimate
    }));
  } catch (error) {
    console.error('Error fetching neighborhoods:', error);
    return [];
  }
}

/**
 * Find nearest neighborhood to coordinates
 */
export async function findNearestNeighborhood(
  latitude: number,
  longitude: number
): Promise<Neighborhood | null> {
  try {
    const neighborhoods = await getNeighborhoods();
    
    if (neighborhoods.length === 0) return null;

    // Calculate distance to each neighborhood
    const withDistances = neighborhoods.map(n => ({
      ...n,
      distance: haversineDistance(latitude, longitude, n.centerLat, n.centerLng)
    }));

    // Sort by distance and return closest
    withDistances.sort((a, b) => a.distance - b.distance);
    
    return withDistances[0];
  } catch (error) {
    console.error('Error finding nearest neighborhood:', error);
    return null;
  }
}

/**
 * Calculate haversine distance between two points (in km)
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// =====================================================
// LAYER 2: TRUST SYSTEM
// =====================================================

export interface TrustScore {
  userId: string;
  overallScore: number;
  trustTier: 'platinum' | 'gold' | 'silver' | 'bronze';
  submissionCount: number;
  accuracyScore: number;
  consistencyScore: number;
  validationScore: number;
  experienceScore: number;
  accountAgeDays: number;
  tierInfo: TrustTierInfo;
}

export interface TrustTierInfo {
  tier: string;
  minSubmissions: number;
  minAccuracy: number;
  weightMultiplier: number;
  badgeColor: string;
  badgeIcon: string;
  displayOrder: number;
}

export interface PriceValidation {
  id: string;
  submissionId: string;
  validatorId: string;
  validationType: 'confirm' | 'dispute' | 'update';
  validatedPrice?: number;
  notes?: string;
  createdAt: string;
}

/**
 * Get user's trust score
 */
export async function getUserTrustScore(userId: string): Promise<TrustScore | null> {
  try {
    const { data, error } = await supabase
      .from('reliability_scores')
      .select(`
        *,
        trust_tiers (*)
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      userId: data.user_id,
      overallScore: data.overall_score,
      trustTier: data.trust_tier,
      submissionCount: data.submission_count,
      accuracyScore: data.accuracy_score,
      consistencyScore: data.consistency_score,
      validationScore: data.validation_score,
      experienceScore: data.experience_score,
      accountAgeDays: data.account_age_days,
      tierInfo: data.trust_tiers
    };
  } catch (error) {
    console.error('Error fetching trust score:', error);
    return null;
  }
}

/**
 * Get all trust tiers
 */
export async function getTrustTiers(): Promise<TrustTierInfo[]> {
  try {
    const { data, error } = await supabase
      .from('trust_tiers')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return (data || []).map(t => ({
      tier: t.tier,
      minSubmissions: t.min_submissions,
      minAccuracy: t.min_accuracy,
      weightMultiplier: t.weight_multiplier,
      badgeColor: t.badge_color,
      badgeIcon: t.badge_icon,
      displayOrder: t.display_order
    }));
  } catch (error) {
    console.error('Error fetching trust tiers:', error);
    return [];
  }
}

/**
 * Validate a price submission
 */
export async function validatePrice(
  submissionId: string,
  validationType: 'confirm' | 'dispute' | 'update',
  validatedPrice?: number,
  notes?: string
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('price_validations')
      .insert({
        submission_id: submissionId,
        validator_id: user.id,
        validation_type: validationType,
        validated_price: validatedPrice,
        notes
      });

    if (error) throw error;

    // Trigger trust score recalculation (would be done by a background job in production)
    await recalculateTrustScores();

    return true;
  } catch (error) {
    console.error('Error validating price:', error);
    return false;
  }
}

/**
 * Get validations for a submission
 */
export async function getSubmissionValidations(
  submissionId: string
): Promise<PriceValidation[]> {
  try {
    const { data, error } = await supabase
      .from('price_validations')
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(v => ({
      id: v.id,
      submissionId: v.submission_id,
      validatorId: v.validator_id,
      validationType: v.validation_type,
      validatedPrice: v.validated_price,
      notes: v.notes,
      createdAt: v.created_at
    }));
  } catch (error) {
    console.error('Error fetching validations:', error);
    return [];
  }
}

/**
 * Recalculate trust scores for all users (simplified version)
 * In production, this would be a background job
 */
async function recalculateTrustScores(): Promise<void> {
  try {
    // This is a placeholder - in production, this would trigger a background job
    // that recalculates accuracy, consistency, and validation scores
    console.log('Trust score recalculation triggered');
  } catch (error) {
    console.error('Error recalculating trust scores:', error);
  }
}

/**
 * Calculate trust tier based on score and submission count
 */
export function calculateTrustTier(
  overallScore: number,
  submissionCount: number,
  tiers: TrustTierInfo[]
): TrustTierInfo {
  // Sort tiers by requirements (highest first)
  const sortedTiers = [...tiers].sort((a, b) => b.displayOrder - a.displayOrder);

  for (const tier of sortedTiers) {
    if (overallScore >= tier.minAccuracy && submissionCount >= tier.minSubmissions) {
      return tier;
    }
  }

  // Default to bronze
  return sortedTiers[sortedTiers.length - 1];
}
