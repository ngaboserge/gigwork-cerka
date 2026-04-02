import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, Button, Badge, Modal, Avatar } from '@/components/ui';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { useAuthStore } from '@/store/authStore';
import { shiftsService } from '@/services/shifts.service';
import { deploymentsService } from '@/services/deployments.service';
import { formatCurrency } from '@/lib/currency';
import type { Shift, EmployerProfile } from '@/lib/database.types';

interface ShiftWithEmployer extends Shift {
  employer: EmployerProfile & { avatar_url?: string };
  remaining_slots: number;
  is_full: boolean;
}

export function ShiftDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [shift, setShift] = useState<ShiftWithEmployer | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadShift = async () => {
      if (!id) return;
      
      try {
        const data = await shiftsService.getShiftDetails(id);
        setShift(data as ShiftWithEmployer);
      } catch (error: any) {
        console.error('Error loading shift:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadShift();
  }, [id]);

  const isWorker = user?.role === 'worker';
  const remainingSlots = shift?.remaining_slots || 0;

  const handleApply = async () => {
    if (!user?.id || !id) return;
    
    setApplying(true);
    setError(null);
    
    try {
      await deploymentsService.applyToShift(id, user.id);
      setHasApplied(true);
      setShowConfirmModal(false);
    } catch (error: any) {
      console.error('Error applying to shift:', error);
      setError(error.message);
    } finally {
      setApplying(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
  };

  const formatDate = (date: string) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateHours = () => {
    if (!shift) return 0;
    const [startH, startM] = shift.start_time.split(':').map(Number);
    const [endH, endM] = shift.end_time.split(':').map(Number);
    const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM) - shift.break_minutes;
    return totalMinutes / 60;
  };

  if (loading) {
    return (
      <Layout>
        <div className="bg-neutral-50 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!shift || error) {
    return (
      <Layout>
        <div className="bg-neutral-50 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-bold text-neutral-900">Shift Not Found</h1>
            <p className="text-neutral-600 mt-2">{error || 'This shift may have been filled or cancelled.'}</p>
            <Button className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const hours = calculateHours();
  const estimatedPay = hours * shift.pay_rate;

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-neutral-600 hover:text-neutral-900 mb-4"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {shift.urgency === 'critical' && (
                    <Badge variant="error">Critical - Urgent Fill</Badge>
                  )}
                  {shift.urgency === 'urgent' && (
                    <Badge variant="warning">Urgent</Badge>
                  )}
                  <Badge variant="secondary">{shift.category}</Badge>
                </div>
                <h1 className="text-2xl font-bold text-neutral-900">{shift.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar 
                    name={shift.employer?.company_name || 'Company'} 
                    src={shift.employer?.avatar_url}
                    size="sm" 
                  />
                  <span className="text-neutral-600">{shift.employer?.company_name}</span>
                  {shift.employer?.verified && (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="text-neutral-400">•</span>
                  <span className="text-neutral-600 flex items-center">
                    <svg className="w-4 h-4 text-amber-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {shift.employer?.average_rating || 0}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-3xl font-bold text-primary-600">{formatCurrency(shift.pay_rate)}</p>
                <p className="text-neutral-500">{shift.pay_type === 'daily' ? 'per day' : shift.pay_type === 'fixed' ? 'fixed rate' : 'per hour'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Details */}
              <Card>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary-50 rounded-lg">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Date</p>
                      <p className="font-medium text-neutral-900">{formatDate(shift.shift_date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary-50 rounded-lg">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Time</p>
                      <p className="font-medium text-neutral-900">
                        {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                      </p>
                      <p className="text-xs text-neutral-500">{hours.toFixed(1)} hours ({shift.break_minutes} min break)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary-50 rounded-lg">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Location</p>
                      <p className="font-medium text-neutral-900">{shift.location_name}</p>
                      <p className="text-xs text-neutral-500">{shift.city || ''}, {shift.state || ''}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Estimated Pay</p>
                      <p className="font-medium text-green-600">{formatCurrency(estimatedPay)}</p>
                      <p className="text-xs text-neutral-500">for this shift</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Description */}
              <Card>
                <h2 className="text-lg font-semibold text-neutral-900 mb-3">About This Shift</h2>
                <p className="text-neutral-700 whitespace-pre-line">{shift.description || 'No description provided.'}</p>
              </Card>

              {/* Requirements */}
              <Card>
                <h2 className="text-lg font-semibold text-neutral-900 mb-3">Requirements</h2>
                <div className="space-y-3">
                  {shift.dress_code && (
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-neutral-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium text-neutral-900">Dress Code</p>
                        <p className="text-sm text-neutral-600">{shift.dress_code}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-neutral-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-neutral-900">Minimum Reliability Score</p>
                      <p className="text-sm text-neutral-600">{shift.minimum_reliability_score}% or higher</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Special Instructions */}
              {shift.special_instructions && (
                <Card>
                  <h2 className="text-lg font-semibold text-neutral-900 mb-3">Special Instructions</h2>
                  {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-800">{shift.special_instructions}</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Slots Status */}
              <Card>
                <h3 className="font-semibold text-neutral-900 mb-3">Availability</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Slots Needed</span>
                    <span className="font-medium">{shift.slots_needed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Confirmed</span>
                    <span className="font-medium text-green-600">{shift.slots_confirmed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Standby</span>
                    <span className="font-medium text-amber-600">{shift.slots_standby}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-neutral-900">Remaining Slots</span>
                      <span className={`text-lg font-bold ${remainingSlots > 0 ? 'text-primary-600' : 'text-red-600'}`}>
                        {remainingSlots}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-600 rounded-full transition-all"
                        style={{ width: `${(shift.slots_confirmed / shift.slots_needed) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {Math.round((shift.slots_confirmed / shift.slots_needed) * 100)}% filled
                    </p>
                  </div>
                </div>
              </Card>

              {/* Apply Button */}
              {isWorker && (
                <Card>
                  {hasApplied ? (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="font-medium text-neutral-900">Application Submitted</p>
                      <p className="text-sm text-neutral-600 mt-1">
                        You'll be notified when the employer responds.
                      </p>
                    </div>
                  ) : remainingSlots > 0 ? (
                    <>
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={() => setShowConfirmModal(true)}
                      >
                        Accept This Shift
                      </Button>
                      <p className="text-xs text-neutral-500 text-center mt-2">
                        By accepting, you commit to showing up on time
                      </p>
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="font-medium text-neutral-900">Shift is Full</p>
                      <p className="text-sm text-neutral-600 mt-1">
                        All slots have been filled for this shift.
                      </p>
                    </div>
                  )}
                </Card>
              )}

              {/* Employer Info */}
              <Card>
                <h3 className="font-semibold text-neutral-900 mb-3">About the Employer</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Total Shifts Posted</span>
                    <span className="font-medium">{shift.employer?.total_shifts_posted || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Workers Deployed</span>
                    <span className="font-medium">{shift.employer?.total_workers_deployed?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Rating</span>
                    <span className="font-medium flex items-center">
                      <svg className="w-4 h-4 text-amber-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {shift.employer?.average_rating || 0}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Confirm Modal */}
        <Modal 
          isOpen={showConfirmModal} 
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Shift Acceptance"
        >
          <div className="space-y-4">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <p className="font-medium text-neutral-900">{shift.title}</p>
              <p className="text-sm text-neutral-600">{shift.employer?.company_name || 'Unknown Employer'}</p>
              <div className="mt-2 text-sm text-neutral-700">
                <p>{formatDate(shift.shift_date)}</p>
                <p>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</p>
                <p className="font-medium text-green-600 mt-1">Est. {formatCurrency(estimatedPay)}</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> By accepting this shift, you commit to arriving on time. 
                No-shows and late arrivals affect your reliability score.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleApply}
                loading={applying}
              >
                Confirm Acceptance
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
