import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button, Card, Textarea, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { verificationService, KYCVerification } from '@/services/verification.service';

export default function AdminVerifications() {
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<KYCVerification | null>(null);
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    loadVerifications();
  }, [activeTab]);

  const loadVerifications = async () => {
    setLoading(true);
    let data: KYCVerification[] = [];
    
    if (activeTab === 'pending') {
      data = await verificationService.getPendingVerifications();
    } else {
      data = await verificationService.getVerificationsByStatus(activeTab);
    }
    
    setVerifications(data);
    setSelectedVerification(null);
    setLoading(false);
  };

  const handleApprove = async (verification: KYCVerification) => {
    if (!confirm('Are you sure you want to approve this verification?')) return;

    setProcessing(true);
    const result = await verificationService.approveVerification(
      verification.id,
      adminNotes || undefined
    );

    if (result.success) {
      alert('Verification approved successfully!');
      setSelectedVerification(null);
      setAdminNotes('');
      loadVerifications();
    } else {
      alert('Failed to approve: ' + result.error);
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!selectedVerification) return;
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    const result = await verificationService.rejectVerification(
      selectedVerification.id,
      rejectionReason,
      adminNotes || undefined
    );

    if (result.success) {
      alert('Verification rejected');
      setSelectedVerification(null);
      setRejectionReason('');
      setAdminNotes('');
      setShowRejectModal(false);
      loadVerifications();
    } else {
      alert('Failed to reject: ' + result.error);
    }
    setProcessing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">KYC Verifications</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Review and approve user identity verifications
          </p>
        </div>

        <Tabs defaultValue={activeTab} onChange={(value) => setActiveTab(value as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : verifications.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  No {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Verifications
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {activeTab === 'pending' 
                    ? 'All verifications have been reviewed'
                    : `No ${activeTab} verifications found`
                  }
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List of verifications */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ({verifications.length})
              </h2>
              {verifications.map((verification) => (
                <div
                  key={verification.id}
                  className={`cursor-pointer transition-all ${
                    selectedVerification?.id === verification.id
                      ? 'ring-2 ring-primary-500'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedVerification(verification)}
                >
                  <Card className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                        {verification.full_name}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {verification.document_number}
                      </p>
                    </div>
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-full
                      ${verification.status === 'pending' 
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        : verification.status === 'approved'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }
                    `}>
                      {verification.status}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500">
                    {verification.status === 'pending' ? 'Submitted' : verification.status === 'approved' ? 'Approved' : 'Rejected'} {formatDate(verification.submitted_at)}
                  </div>
                </Card>
              </div>
              ))}
            </div>

            {/* Verification details */}
            <div className="lg:col-span-2">
              {selectedVerification ? (
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {selectedVerification.full_name}
                      </h2>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {selectedVerification.status === 'pending' ? 'Submitted' : selectedVerification.status === 'approved' ? 'Approved' : 'Rejected'} {formatDate(selectedVerification.submitted_at)}
                      </p>
                    </div>
                    <span className={`
                      px-3 py-1 text-sm font-medium rounded-full
                      ${selectedVerification.status === 'pending' 
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        : selectedVerification.status === 'approved'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }
                    `}>
                      {selectedVerification.status}
                    </span>
                  </div>

                  {/* Documents */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Documents</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">National ID (Front)</p>
                        {selectedVerification.document_front_url ? (
                          <a
                            href={selectedVerification.document_front_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={selectedVerification.document_front_url}
                              alt="ID Front"
                              className="w-full rounded border border-neutral-200 dark:border-neutral-700 hover:opacity-80 transition-opacity"
                            />
                          </a>
                        ) : (
                          <div className="w-full h-32 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center">
                            <span className="text-neutral-400">No image</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Selfie</p>
                        {selectedVerification.selfie_url ? (
                          <a
                            href={selectedVerification.selfie_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={selectedVerification.selfie_url}
                              alt="Selfie"
                              className="w-full rounded border border-neutral-200 dark:border-neutral-700 hover:opacity-80 transition-opacity"
                            />
                          </a>
                        ) : (
                          <div className="w-full h-32 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center">
                            <span className="text-neutral-400">No image</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedVerification.document_back_url && (
                      <div className="mt-4">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">ID Back (Optional)</p>
                        <a
                          href={selectedVerification.document_back_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block max-w-xs"
                        >
                          <img
                            src={selectedVerification.document_back_url}
                            alt="ID Back"
                            className="w-full rounded border border-neutral-200 dark:border-neutral-700 hover:opacity-80 transition-opacity"
                          />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Personal Information */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-400">ID Number</p>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {selectedVerification.document_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-400">Full Name</p>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {selectedVerification.full_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-400">Date of Birth</p>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {selectedVerification.date_of_birth}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-400">Gender</p>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {selectedVerification.gender}
                        </p>
                      </div>
                      {selectedVerification.place_of_birth && (
                        <div>
                          <p className="text-neutral-600 dark:text-neutral-400">Place of Birth</p>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            {selectedVerification.place_of_birth}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-400">Country</p>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {selectedVerification.country === 'RW' ? 'Rwanda' : selectedVerification.country}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  {selectedVerification.admin_notes && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Admin Notes</h3>
                      <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg text-sm text-neutral-700 dark:text-neutral-300">
                        {selectedVerification.admin_notes}
                      </div>
                    </div>
                  )}

                  {selectedVerification.rejection_reason && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-red-900 dark:text-red-400 mb-2">Rejection Reason</h3>
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm text-red-700 dark:text-red-300">
                        {selectedVerification.rejection_reason}
                      </div>
                    </div>
                  )}

                  {/* Admin Notes Input (only for pending) */}
                  {selectedVerification.status === 'pending' && (
                    <div className="mb-6">
                      <Textarea
                        label="Admin Notes (Optional)"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add any notes about this verification..."
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Actions (only for pending) */}
                  {selectedVerification.status === 'pending' && (
                    <div className="flex gap-3">
                    <Button
                      variant="primary"
                      onClick={() => handleApprove(selectedVerification)}
                      disabled={processing}
                      className="flex-1"
                    >
                      {processing ? (
                        'Processing...'
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Approve Verification
                        </>
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setShowRejectModal(true)}
                      disabled={processing}
                      className="flex-1"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Reject
                    </Button>
                  </div>
                  )}
                </Card>
              ) : (
                <Card className="p-12 text-center">
                  <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    Select a Verification
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Choose a verification from the list to review
                  </p>
                </Card>
              )}
            </div>
          </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Reject Modal */}
        {showRejectModal && selectedVerification && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Reject Verification
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Please provide a reason for rejecting this verification. The user will see this message.
              </p>
              <Textarea
                label="Rejection Reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., ID photo is blurry, information doesn't match, etc."
                rows={4}
              />
              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  disabled={processing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleReject}
                  disabled={processing || !rejectionReason.trim()}
                  className="flex-1"
                >
                  {processing ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
