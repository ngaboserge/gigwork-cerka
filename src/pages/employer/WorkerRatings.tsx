import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Card, CardHeader, Button, Modal, Skeleton, Tabs, TabsList, TabsTrigger, TabsContent, Avatar } from '@/components/ui';
import { useAuthStore } from '@/store';
import { ratingsService } from '@/services/ratings.service';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface PendingRating {
  id: string;
  profiles: {
    avatar_url?: string;
    worker_profiles: {
      user_id: string;
      first_name: string;
      last_name: string;
    };
  };
  shifts: {
    id: string;
    title: string;
    shift_date: string;
  };
}

interface CompletedRating {
  id: string;
  employer_rating: number;
  employer_feedback: string | null;
  created_at: string;
  profiles: {
    avatar_url?: string;
    worker_profiles: {
      first_name: string;
      last_name: string;
    };
  };
  shifts: {
    title: string;
    shift_date: string;
  };
}

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

export function WorkerRatings() {
  const { user } = useAuthStore();
  const [pendingRatings, setPendingRatings] = useState<PendingRating[]>([]);
  const [completedRatings, setCompletedRatings] = useState<CompletedRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedPending, setSelectedPending] = useState<PendingRating | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadRatingsData();
    }
  }, [user?.id]);

  const loadRatingsData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [pending, completed] = await Promise.all([
        ratingsService.getPendingRatings(user.id, 'employer'),
        loadCompletedRatings(user.id),
      ]);

      setPendingRatings(pending as PendingRating[]);
      setCompletedRatings(completed);
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompletedRatings = async (employerId: string) => {
    const { data, error } = await supabase
      .from('deployments')
      .select(`
        id,
        employer_rating,
        employer_feedback,
        created_at,
        profiles!deployments_worker_id_fkey(
          avatar_url,
          worker_profiles(first_name, last_name)
        ),
        shifts!inner(
          title,
          shift_date,
          employer_id
        )
      `)
      .eq('shifts.employer_id', employerId)
      .eq('status', 'completed')
      .not('employer_rating', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  };

  const handleSubmitRating = async () => {
    if (!selectedPending || !user?.id) return;
    setSubmitting(true);

    try {
      await ratingsService.rateWorker(
        selectedPending.id,
        user.id,
        ratingValue,
        feedback || undefined
      );
      
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

  const getWorkerName = (profiles: any) => {
    const workerProfile = profiles?.worker_profiles;
    if (!workerProfile) return 'Worker';
    return `${workerProfile.first_name} ${workerProfile.last_name}`;
  };

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-neutral-900">Worker Ratings</h1>
            <p className="text-neutral-600 mt-1">Rate workers and view your rating history</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Pending Ratings Alert */}
          {!loading && pendingRatings.length > 0 && (
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
                      {pendingRatings.length} worker{pendingRatings.length !== 1 ? 's' : ''} to rate
                    </h3>
                    <p className="text-sm text-primary-700">Share feedback on completed shifts</p>
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
          <Tabs defaultValue="pending">
            <TabsList className="mb-6">
              <TabsTrigger value="pending">
                Pending ({pendingRatings.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedRatings.length})
              </TabsTrigger>
            </TabsList>

            {/* Pending Tab */}
            <TabsContent value="pending">
              <Card padding="none">
                <CardHeader 
                  title="Workers to Rate" 
                  subtitle="Rate workers after completed shifts" 
                />
                <div className="border-t border-neutral-100">
                  {loading ? (
                    <div className="p-4">
                      <Skeleton height={200} />
                    </div>
                  ) : pendingRatings.length > 0 ? (
                    pendingRatings.map((pending) => (
                      <div key={pending.id} className="p-4 border-b border-neutral-100 last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Avatar 
                                name={getWorkerName(pending.profiles)}
                                src={pending.profiles?.avatar_url || undefined}
                                size="sm"
                              />
                              <div>
                                <p className="font-medium text-neutral-900">
                                  {getWorkerName(pending.profiles)}
                                </p>
                                <p className="text-sm text-neutral-600">{pending.shifts.title}</p>
                              </div>
                            </div>
                            <p className="text-xs text-neutral-500 ml-13">
                              Completed on {format(new Date(pending.shifts.shift_date + 'T00:00:00'), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPending(pending);
                              setShowRateModal(true);
                            }}
                          >
                            Rate Worker
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <svg className="w-12 h-12 text-neutral-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-neutral-500">All caught up!</p>
                      <p className="text-sm text-neutral-400 mt-1">No pending worker ratings</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Completed Tab */}
            <TabsContent value="completed">
              <Card padding="none">
                <CardHeader 
                  title="Rating History" 
                  subtitle="Your ratings for workers" 
                />
                <div className="border-t border-neutral-100">
                  {loading ? (
                    <div className="p-4">
                      <Skeleton height={200} />
                    </div>
                  ) : completedRatings.length > 0 ? (
                    completedRatings.map((rating) => (
                      <div key={rating.id} className="p-4 border-b border-neutral-100 last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <StarDisplay rating={rating.employer_rating} />
                              <span className="text-sm font-medium text-neutral-900">
                                {rating.employer_rating}.0
                              </span>
                            </div>
                            <p className="text-sm text-neutral-600">
                              {getWorkerName(rating.profiles)}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {rating.shifts.title} • {format(new Date(rating.shifts.shift_date + 'T00:00:00'), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <span className="text-xs text-neutral-400">
                            {format(new Date(rating.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                        {rating.employer_feedback && (
                          <p className="text-sm text-neutral-700 mt-3 bg-neutral-50 p-3 rounded-lg">
                            "{rating.employer_feedback}"
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <svg className="w-12 h-12 text-neutral-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <p className="text-neutral-500">No ratings yet</p>
                      <p className="text-sm text-neutral-400 mt-1">Rate workers after completed shifts</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Rate Worker Modal */}
      <Modal isOpen={showRateModal} onClose={() => setShowRateModal(false)} title="Rate Worker">
        {selectedPending && (
          <div className="space-y-6">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Avatar 
                  name={getWorkerName(selectedPending.profiles)}
                  src={selectedPending.profiles?.avatar_url || undefined}
                  size="md"
                />
                <div>
                  <p className="font-medium text-neutral-900">
                    {getWorkerName(selectedPending.profiles)}
                  </p>
                  <p className="text-sm text-neutral-600">{selectedPending.shifts.title}</p>
                </div>
              </div>
              <p className="text-xs text-neutral-500">
                {format(new Date(selectedPending.shifts.shift_date + 'T00:00:00'), 'MMMM d, yyyy')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                How did this worker perform?
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
                placeholder="Share your experience working with this worker..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowRateModal(false)}>
                Cancel
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
