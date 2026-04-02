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
import { Tabs } from '../../components/ui/Tabs';

export default function SupplierVerification() {
  const { user } = useAuthStore();
  const { verificationRequests, loading, fetchVerificationRequests, processVerification } = useModerationStore();
  
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [action, setAction] = useState<boolean | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchVerificationRequests(activeTab as any);
  }, [activeTab]);

  const handleProcess = async () => {
    if (!user || !selectedRequest || action === null) return;

    try {
      await processVerification(selectedRequest, action, user.id, reason);
      setSelectedRequest(null);
      setAction(null);
      setReason('');
    } catch (error) {
      console.error('Verification processing failed:', error);
    }
  };

  const openModal = (userId: string, approve: boolean) => {
    setSelectedRequest(userId);
    setAction(approve);
  };

  const filteredRequests = verificationRequests.filter(r => r.status === activeTab);

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
          <h1 className="text-3xl font-bold text-gray-900">Supplier Verification</h1>
          <p className="text-gray-600 mt-1">Review and approve supplier verification requests</p>
        </div>

        <Tabs
          tabs={[
            { id: 'pending', label: 'Pending' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="mt-6">
          {filteredRequests.length === 0 ? (
            <EmptyState
              title={`No ${activeTab} requests`}
              description={`There are no ${activeTab} verification requests at this time`}
            />
          ) : (
            <div className="space-y-4">
              {filteredRequests.map(request => (
                <Card key={request.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.user?.full_name}
                        </h3>
                        {request.status === 'approved' && (
                          <Badge variant="success">Approved</Badge>
                        )}
                        {request.status === 'rejected' && (
                          <Badge variant="default">Rejected</Badge>
                        )}
                        {request.status === 'pending' && (
                          <Badge variant="warning">Pending Review</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm font-medium text-gray-900">
                            {request.user?.email}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Business Name</p>
                        <p className="text-sm font-medium text-gray-900">
                          {request.business_name || 'Not provided'}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Requested</p>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {request.business_description && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Business Description</p>
                        <p className="text-sm text-gray-700">{request.business_description}</p>
                      </div>
                    )}

                    {request.documents && request.documents.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Documents</p>
                        <div className="flex gap-2">
                          {request.documents.map((doc, idx) => (
                            <a
                              key={idx}
                              href={doc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm">Document {idx + 1}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {request.admin_notes && (
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500 mb-1">Admin Notes</p>
                        <p className="text-sm text-gray-700">{request.admin_notes}</p>
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="flex gap-3 mt-4">
                        <Button
                          size="sm"
                          onClick={() => openModal(request.user_id, true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openModal(request.user_id, false)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Processing Modal */}
      {selectedRequest && action !== null && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedRequest(null);
            setAction(null);
            setReason('');
          }}
          title={`${action ? 'Approve' : 'Reject'} Verification`}
        >
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              {action
                ? 'This will grant the user verified supplier status and prioritize their listings in search results.'
                : 'This will reject the verification request. Please provide a reason.'}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {action ? 'Notes (optional)' : 'Reason for rejection *'}
              </label>
              <Textarea
                placeholder={action ? 'Add any notes...' : 'Explain why the request was rejected...'}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRequest(null);
                  setAction(null);
                  setReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleProcess}
                className={action ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                disabled={!action && !reason}
              >
                {action ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
    </Layout>
  );
}
