import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Card, CardHeader, Button, Badge, Modal, Skeleton, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { useAuthStore, useLevelStore } from '@/store';
import { ratingsService, type RatingWithDetails } from '@/services/ratings.service';
import { format } from 'date-fns';
import type { WorkerLevel } from '@/types';

const LEVEL_CONFIG: Record<WorkerLevel, { label: string; color: string; bgColor: string }> = {
  bronze: { label: 'Standard', color: 'text-neutral-700', bgColor: 'bg-neutral-100' },
  silver: { label: 'Verified', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  gold: { label: 'Preferred', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  platinum: { label: 'Elite', color: 'text-primary-700', bgColor: 'bg-primary-50' },
};

const LEVEL_THRESHOLDS = { bronze: 0, silver: 500, gold: 1500, platinum: 3500 };

interface PendingRating {
  id: string;
  shift: {
    id: string;
    title: string;
    shift_date: string;
    employer: {
      company_name: string;
    };
  };
}

const CertificationIcon = ({ icon }: { icon: string }) => {
  const icons: Record<string, JSX.Element> = {
    rocket: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    star: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    clock: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    shield: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    truck: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
    trophy: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" /></svg>,
  };
  return icons[icon] || icons.shield;
};

const StarDisplay = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        className={`w-4 h-4 ${star <= rating ? 'text-amber-400' : 'text-neutral-200'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export function Reputation() {
  const { user } = useAuthStore();
  const { levelInfo, loading: levelLoading, fetchLevelInfo } = useLevelStore();
  const [ratings, setRatings] = useState<RatingWithDetails[]>([]);
  const [pendingRatings, setPendingRatings] = useState<PendingRating[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    average: number;
    distribution: { stars: number; count: number; percentage: number }[];
  } | null>(null);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedPending, setSelectedPending] = useState<PendingRating | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchLevelInfo(user.id);
      loadRatingsData();
    }
  }, [user?.id]);

  const loadRatingsData = async () => {
    if (!user?.id) return;

    try {
      const [ratingsData, statsData, pendingData] = await Promise.all([
        ratingsService.getWorkerRatings(user.id, { limit: 20 }),
        ratingsService.getRatingStats(user.id, 'worker'),
        ratingsService.getPendingRatings(user.id, 'worker'),
      ]);

      setRatings(ratingsData);
      setStats(statsData);
      setPendingRatings(pendingData as PendingRating[]);
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setRatingsLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!selectedPending || !user?.id) return;
    setSubmitting(true);

    try {
      await ratingsService.rateEmployer(selectedPending.id, user.id, ratingValue, feedback || undefined);
      setShowRateModal(false);
      setSelectedPending(null);
      setRatingValue(5);
      setFeedback('');
      await loadRatingsData();
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (levelLoading || !levelInfo) {
    return (
      <Layout>
        <div className="bg-neutral-50 min-h-screen py-8">
          <div className="max-w-5xl mx-auto px-4">
            <Skeleton height={200} className="mb-6" />
            <Skeleton height={300} />
          </div>
        </div>
      </Layout>
    );
  }

  const { level, points, nextLevelPoints, benefits, badges } = levelInfo;
  const config = LEVEL_CONFIG[level];
  const allLevels: WorkerLevel[] = ['bronze', 'silver', 'gold', 'platinum'];
  const currentLevelIndex = allLevels.indexOf(level);

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-neutral-900">Reputation</h1>
            <p className="text-neutral-600 mt-1">Your professional standing, ratings, and achievements</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Worker Status Card */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-neutral-900">Worker Status</h3>
                <Badge variant={level === 'platinum' ? 'success' : level === 'gold' ? 'success' : level === 'silver' ? 'info' : 'neutral'}>
                  {config.label}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center`}>
                  <span className={`text-2xl font-bold ${config.color}`}>
                    {level === 'platinum' ? '★' : level === 'gold' ? '◆' : level === 'silver' ? '●' : '○'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-500">Points</p>
                  <p className="text-2xl font-bold text-neutral-900">{points.toLocaleString()}</p>
                  {level !== 'platinum' && (
                    <p className="text-xs text-neutral-500 mt-1">
                      {(nextLevelPoints - points).toLocaleString()} to {LEVEL_CONFIG[allLevels[currentLevelIndex + 1]].label}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Rating Card */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-neutral-900">Average Rating</h3>
                {stats && <span className="text-sm text-neutral-500">{stats.total} reviews</span>}
              </div>
              {ratingsLoading ? (
                <Skeleton height={60} />
              ) : stats && stats.total > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-neutral-900">{stats.average.toFixed(1)}</p>
                    <div className="flex justify-center mt-1">
                      <StarDisplay rating={Math.round(stats.average)} />
                    </div>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].slice(0, 3).map((stars) => {
                      const dist = stats.distribution.find(d => d.stars === stars);
                      return (
                        <div key={stars} className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-neutral-600 w-3">{stars}</span>
                          <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: `${dist?.percentage || 0}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-neutral-500">No ratings yet</p>
                  <p className="text-xs text-neutral-400 mt-1">Complete shifts to receive ratings</p>
                </div>
              )}
            </Card>
          </div>

          {/* Pending Ratings Alert */}
          {pendingRatings.length > 0 && (
            <Card className="mb-6 bg-primary-50 border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">
                      {pendingRatings.length} shift{pendingRatings.length !== 1 ? 's' : ''} to rate
                    </h3>
                    <p className="text-sm text-primary-700">Share your experience with employers</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => {
                    setSelectedPending(pendingRatings[0]);
                    setShowRateModal(true);
                  }}
                >
                  Rate Now
                </Button>
              </div>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="status">
            <TabsList className="mb-6">
              <TabsTrigger value="status">Status & Benefits</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({stats?.total || 0})</TabsTrigger>
              <TabsTrigger value="achievements">Achievements ({badges.length})</TabsTrigger>
            </TabsList>

            {/* Status & Benefits Tab */}
            <TabsContent value="status">
              <div className="space-y-6">
                {/* Status Tiers */}
                <Card>
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4">Status Tiers</h2>
                  <div className="space-y-3">
                    {allLevels.map((lvl, idx) => {
                      const lvlConfig = LEVEL_CONFIG[lvl];
                      const isActive = idx <= currentLevelIndex;
                      const isCurrent = lvl === level;
                      
                      return (
                        <div 
                          key={lvl} 
                          className={`flex items-center gap-4 p-4 rounded-lg border ${isCurrent ? 'border-primary-300 bg-primary-50' : isActive ? 'border-neutral-200 bg-white' : 'border-neutral-100 bg-neutral-50'}`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-400'}`}>
                            {isActive ? (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <span className="text-sm font-medium">{idx + 1}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${isActive ? 'text-neutral-900' : 'text-neutral-500'}`}>{lvlConfig.label}</span>
                              {isCurrent && <Badge variant="info">Current</Badge>}
                            </div>
                            <p className="text-sm text-neutral-500">{LEVEL_THRESHOLDS[lvl].toLocaleString()}+ points required</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Current Benefits */}
                <Card>
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4">Your Benefits</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                        <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-neutral-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* How Points Work */}
                <Card>
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4">How Points Work</h2>
                  <p className="text-sm text-neutral-600 mb-4">
                    Points are earned through consistent, quality work. Higher status unlocks better opportunities.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { action: 'Complete a shift successfully', points: 50 },
                      { action: 'Receive a 5-star rating', points: 25 },
                      { action: 'Maintain on-time arrival', points: 10 },
                      { action: 'Complete profile verification', points: 100 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <span className="text-sm text-neutral-700">{item.action}</span>
                        <span className="text-sm font-medium text-primary-700">+{item.points}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <Card padding="none">
                <CardHeader title="Reviews from Employers" subtitle="Feedback from your completed shifts" />
                <div className="border-t border-neutral-100">
                  {ratingsLoading ? (
                    <div className="p-4">
                      <Skeleton height={200} />
                    </div>
                  ) : ratings.length > 0 ? (
                    ratings.map((rating) => (
                      <div key={rating.id} className="p-4 border-b border-neutral-100 last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <StarDisplay rating={rating.rating} />
                              <span className="text-sm font-medium text-neutral-900">{rating.rating}.0</span>
                            </div>
                            <p className="text-sm text-neutral-600 mt-1">{rating.rater?.name || 'Employer'}</p>
                            {rating.shift && (
                              <p className="text-xs text-neutral-500">
                                {rating.shift.title} • {format(new Date(rating.shift.shift_date + 'T00:00:00'), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-neutral-400">
                            {format(new Date(rating.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                        {rating.feedback && (
                          <p className="text-sm text-neutral-700 mt-3 bg-neutral-50 p-3 rounded-lg">
                            "{rating.feedback}"
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <svg className="w-12 h-12 text-neutral-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <p className="text-neutral-500">No reviews yet</p>
                      <p className="text-sm text-neutral-400 mt-1">Complete shifts to receive ratings from employers</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <Card>
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Certifications & Achievements</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {badges.map((badge) => (
                    <div key={badge.id} className="flex items-start gap-3 p-4 border border-neutral-200 rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 flex-shrink-0">
                        <CertificationIcon icon={badge.icon} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-neutral-900">{badge.name}</h3>
                        <p className="text-xs text-neutral-500 mt-0.5">{badge.description}</p>
                        <p className="text-xs text-neutral-400 mt-1">Earned {new Date(badge.earnedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Rate Employer Modal */}
      <Modal isOpen={showRateModal} onClose={() => setShowRateModal(false)} title="Rate Your Experience">
        {selectedPending && (
          <div className="space-y-6">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <p className="font-medium text-neutral-900">{selectedPending.shift.title}</p>
              <p className="text-sm text-neutral-600">{selectedPending.shift.employer.company_name}</p>
              <p className="text-xs text-neutral-500">
                {format(new Date(selectedPending.shift.shift_date + 'T00:00:00'), 'MMMM d, yyyy')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                How was your experience?
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingValue(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <svg
                      className={`w-10 h-10 ${star <= ratingValue ? 'text-amber-400' : 'text-neutral-200'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-neutral-500 mt-2">
                {ratingValue === 5 ? 'Excellent!' : 
                 ratingValue === 4 ? 'Good' : 
                 ratingValue === 3 ? 'Average' : 
                 ratingValue === 2 ? 'Below Average' : 'Poor'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Feedback (optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-24 resize-none"
                placeholder="Share your experience working with this employer..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowRateModal(false)}>
                Skip
              </Button>
              <Button onClick={handleSubmitRating} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
