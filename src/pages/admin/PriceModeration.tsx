import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useModerationStore, useAuthStore } from '../../store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../lib/currency';

export default function PriceModeration() {
  const { user } = useAuthStore();
  const { flaggedSubmissions, loading, fetchFlaggedSubmissions, moderateSubmission } = useModerationStore();
  
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchFlaggedSubmissions();
  }, []);

  const handleModerate = async () => {
    if (!user || !selectedSubmission || !action) return;

    try {
      await moderateSubmission(selectedSubmission, action, user.id, adminNotes);
      setSelectedSubmission(null);
      setAction(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Moderation failed:', error);
    }
  };

  const openModal = (submissionId: string, moderationAction: 'approve' | 'reject') => {
    setSelectedSubmission(submissionId);
    setAction(moderationAction);
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Price Moderation</h1>
          <p className="text-gray-600 mt-1">Review flagged price submissions</p>
        </div>

        {flaggedSubmissions.length === 0 ? (
          <EmptyState
            title="No flagged submissions"
            description="All price submissions are within normal ranges"
          />
        ) : (
          <div className="space-y-4">
            {flaggedSubmissions.map(submission => (
              <Card key={submission.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {submission.materials?.name}
                      </h3>
                      <Badge variant="warning">Flagged as Outlier</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Submitted Price</p>
                        <p className="text-xl font-bold text-red-600">
                          {formatCurrency(submission.price)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="text-sm font-medium text-gray-900">
                            {submission.location}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Submitted By</p>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-900">
                          {submission.profiles?.full_name || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {submission.quantity && (
                    <p className="text-sm text-gray-600 mb-2">
                      Quantity: {submission.quantity} {submission.materials?.unit}
                    </p>
                  )}

                  {submission.notes && (
                    <div className="p-3 bg-gray-50 rounded mb-4">
                      <p className="text-sm text-gray-600">{submission.notes}</p>
                    </div>
                  )}

                  {submission.photo_url && (
                    <div className="mb-4">
                      <img
                        src={submission.photo_url}
                        alt="Price evidence"
                        className="w-48 h-32 object-cover rounded"
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openModal(submission.id, 'approve')}
                      className="text-green-600 hover:text-green-700"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openModal(submission.id, 'reject')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Moderation Modal */}
      {selectedSubmission && action && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedSubmission(null);
            setAction(null);
            setAdminNotes('');
          }}
          title={`${action === 'approve' ? 'Approve' : 'Reject'} Submission`}
        >
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              {action === 'approve'
                ? 'This will approve the price submission and include it in aggregated data.'
                : 'This will reject the price submission and adjust the user\'s reliability score.'}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes {action === 'reject' && '(required)'}
              </label>
              <Textarea
                placeholder="Add notes about your decision..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedSubmission(null);
                  setAction(null);
                  setAdminNotes('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleModerate}
                className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                disabled={action === 'reject' && !adminNotes}
              >
                {action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
    </Layout>
  );
}
