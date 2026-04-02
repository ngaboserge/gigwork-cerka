import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePriceSubmissionsStore, useAuthStore } from '../../store';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../lib/currency';
import { ArrowLeft, CheckCircle, X, AlertTriangle } from '../../lib/icons';
import { format } from 'date-fns';

export default function MySubmissions() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { submissions, loading, fetchUserSubmissions, reliabilityScore, fetchReliabilityScore } = usePriceSubmissionsStore();

  useEffect(() => {
    if (user) {
      fetchUserSubmissions(user.id);
      fetchReliabilityScore(user.id);
    }
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">{t('materials.mySubmissions.approved')}</Badge>;
      case 'rejected':
        return <Badge variant="error">{t('materials.mySubmissions.rejected')}</Badge>;
      case 'flagged':
        return <Badge variant="warning">{t('materials.mySubmissions.flagged')}</Badge>;
      default:
        return <Badge variant="neutral">{t('materials.mySubmissions.pending')}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <X className="w-5 h-5 text-red-500" />;
      case 'flagged':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <div className="p-8 text-center">
            <p className="text-gray-600">{t('materials.mySubmissions.loginRequired')}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/materials/trends')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('materials.mySubmissions.backToDashboard')}
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{t('materials.mySubmissions.title')}</h1>
        <p className="text-gray-600 mt-2">{t('materials.mySubmissions.subtitle')}</p>
      </div>

      {/* Reliability Score Card */}
      {reliabilityScore && (
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('materials.mySubmissions.reliabilityScore')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('materials.mySubmissions.score')}</p>
                <p className="text-2xl font-bold text-blue-600">{reliabilityScore.score.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('materials.mySubmissions.total')}</p>
                <p className="text-2xl font-bold text-gray-900">{reliabilityScore.total_submissions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('materials.mySubmissions.approved')}</p>
                <p className="text-2xl font-bold text-green-600">{reliabilityScore.approved_count}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('materials.mySubmissions.rejected')}</p>
                <p className="text-2xl font-bold text-red-600">{reliabilityScore.rejected_count}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('materials.mySubmissions.flagged')}</p>
                <p className="text-2xl font-bold text-yellow-600">{reliabilityScore.flagged_count}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Submissions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <div className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </Card>
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState
          title={t('materials.mySubmissions.noSubmissionsYet')}
          description={t('materials.mySubmissions.startContributing')}
          action={{
            label: t('materials.mySubmissions.submitPrice'),
            onClick: () => navigate('/materials/submit')
          }}
        />
      ) : (
        <div className="space-y-4">
          {submissions.map(submission => (
            <Card key={submission.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(submission.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {(submission as any).materials?.name || 'Unknown Material'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(submission.submitted_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(submission.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('materials.mySubmissions.price')}</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(submission.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('materials.mySubmissions.location')}</p>
                    <p className="text-sm font-medium text-gray-900">{submission.location}</p>
                  </div>
                  {submission.quantity && (
                    <div>
                      <p className="text-sm text-gray-500">{t('materials.mySubmissions.quantity')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {submission.quantity} {(submission as any).materials?.unit || 'units'}
                      </p>
                    </div>
                  )}
                  {submission.photo_url && (
                    <div>
                      <p className="text-sm text-gray-500">{t('materials.mySubmissions.photo')}</p>
                      <a
                        href={submission.photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {t('materials.mySubmissions.viewPhoto')}
                      </a>
                    </div>
                  )}
                </div>

                {submission.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{t('materials.mySubmissions.notes')}:</span> {submission.notes}
                    </p>
                  </div>
                )}

                {(submission as any).rejection_reason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">
                      <span className="font-medium">{t('materials.mySubmissions.rejectionReason')}:</span> {(submission as any).rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
