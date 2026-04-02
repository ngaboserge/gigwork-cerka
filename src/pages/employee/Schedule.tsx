import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, Button, Badge, Modal, Textarea, Skeleton, Avatar } from '@/components/ui';
import { useAuthStore, useScheduleStore } from '@/store';
import { messagesService } from '@/services/messages.service';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import type { ScheduledShift } from '@/types';

const STATUS_COLORS = {
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  confirmed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  completed: { bg: 'bg-neutral-100', text: 'text-neutral-600', border: 'border-neutral-300' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  swap_requested: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
};

export function Schedule() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { shifts, swapRequests, loading, fetchShifts, fetchSwapRequests, confirmShift, requestSwap } = useScheduleStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<ScheduledShift | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapReason, setSwapReason] = useState('');
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    if (user?.id) {
      fetchShifts(user.id, 'employee');
      fetchSwapRequests(user.id);
    }
  }, [user?.id, fetchShifts, fetchSwapRequests]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad days to start on Sunday
  const startDay = monthStart.getDay();
  const paddedDays = [...Array(startDay).fill(null), ...days];

  const getShiftsForDate = (date: Date) => {
    return shifts.filter(s => isSameDay(parseISO(s.date), date));
  };

  const selectedDateShifts = selectedDate ? getShiftsForDate(selectedDate) : [];
  const upcomingShifts = shifts
    .filter(s => parseISO(s.date) >= new Date() && s.status !== 'cancelled')
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  const handleConfirm = async (shiftId: string) => {
    await confirmShift(shiftId);
  };

  const handleRequestSwap = async () => {
    if (selectedShift) {
      await requestSwap(selectedShift.id, swapReason);
      setShowSwapModal(false);
      setSwapReason('');
      setSelectedShift(null);
    }
  };

  const handleMessageEmployer = async (employerId: string, employerName: string, shiftId: string) => {
    if (!user?.id) return;
    
    try {
      // Create or get conversation
      const conversation = await messagesService.getOrCreateConversation(
        user.id,
        employerId,
        shiftId
      );
      
      // Navigate to messages page
      navigate('/messages', { state: { conversationId: conversation.id } });
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation');
    }
  };

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">My Schedule</h1>
                <p className="text-neutral-600 mt-1">View and manage your upcoming shifts</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={view === 'calendar' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setView('calendar')}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Calendar
                </Button>
                <Button
                  variant={view === 'list' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setView('list')}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  List
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <Skeleton height={400} />
          ) : view === 'calendar' ? (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <div className="lg:col-span-2">
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-neutral-100 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-neutral-100 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-neutral-500 py-2">{day}</div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {paddedDays.map((day, idx) => {
                      if (!day) return <div key={`empty-${idx}`} className="h-24 bg-neutral-50" />;
                      
                      const dayShifts = getShiftsForDate(day);
                      const isToday = isSameDay(day, new Date());
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      
                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => setSelectedDate(day)}
                          className={`h-24 p-1 border text-left transition-colors ${
                            isSelected ? 'border-primary-500 bg-primary-50' :
                            isToday ? 'border-primary-300 bg-primary-50/50' :
                            'border-neutral-200 hover:bg-neutral-50'
                          }`}
                        >
                          <span className={`text-sm ${isToday ? 'font-bold text-primary-700' : 'text-neutral-700'}`}>
                            {format(day, 'd')}
                          </span>
                          <div className="mt-1 space-y-0.5 overflow-hidden">
                            {dayShifts.slice(0, 2).map(shift => (
                              <div
                                key={shift.id}
                                className={`text-xs px-1 py-0.5 rounded truncate ${STATUS_COLORS[shift.status].bg} ${STATUS_COLORS[shift.status].text}`}
                              >
                                {shift.startTime} {shift.jobTitle.slice(0, 10)}...
                              </div>
                            ))}
                            {dayShifts.length > 2 && (
                              <div className="text-xs text-neutral-500">+{dayShifts.length - 2} more</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Selected Date Details */}
              <div>
                <Card>
                  <h3 className="font-semibold text-neutral-900 mb-4">
                    {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
                  </h3>
                  {selectedDate && selectedDateShifts.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateShifts.map(shift => (
                        <div key={shift.id} className={`p-3 rounded-lg border ${STATUS_COLORS[shift.status].border} ${STATUS_COLORS[shift.status].bg}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar 
                                name={shift.employerName} 
                                src={shift.employerAvatar}
                                size="sm" 
                              />
                              <div>
                                <p className="font-medium text-neutral-900">{shift.jobTitle}</p>
                                <p className="text-sm text-neutral-600">{shift.employerName}</p>
                              </div>
                            </div>
                            <Badge variant={shift.status === 'confirmed' ? 'success' : shift.status === 'cancelled' ? 'error' : 'warning'}>
                              {shift.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="mt-2 text-sm text-neutral-600 space-y-1">
                            <p className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {shift.startTime} - {shift.endTime}
                            </p>
                            <p className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {shift.location}
                            </p>
                            <p className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatCurrency(shift.payRate)}/{shift.payType === 'hourly' ? 'hr' : 'day'}
                            </p>
                          </div>
                          {shift.notes && (
                            <p className="mt-2 text-xs text-neutral-500 italic">{shift.notes}</p>
                          )}
                          {shift.status === 'scheduled' && (
                            <div className="mt-3 flex gap-2">
                              <Button size="sm" onClick={() => handleConfirm(shift.id)}>Confirm</Button>
                              <Button size="sm" variant="secondary" onClick={() => { setSelectedShift(shift); setShowSwapModal(true); }}>
                                Request Swap
                              </Button>
                            </div>
                          )}
                          {(shift.status === 'confirmed' || shift.status === 'in_progress') && shift.employerId && (
                            <div className="mt-3">
                              <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={() => handleMessageEmployer(shift.employerId!, shift.employerName, shift.id)}
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Message Employer
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : selectedDate ? (
                    <p className="text-neutral-500 text-sm">No shifts scheduled for this day</p>
                  ) : (
                    <p className="text-neutral-500 text-sm">Click on a date to see shift details</p>
                  )}
                </Card>

                {/* Swap Requests */}
                {swapRequests.filter(r => r.status === 'open').length > 0 && (
                  <Card className="mt-4">
                    <h3 className="font-semibold text-neutral-900 mb-3">Pending Swap Requests</h3>
                    {swapRequests.filter(r => r.status === 'open').map(req => (
                      <div key={req.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-sm font-medium text-purple-900">Swap requested</p>
                        <p className="text-xs text-purple-700 mt-1">{req.reason}</p>
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            </div>
          ) : (
            /* List View */
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Upcoming Shifts</h2>
              {upcomingShifts.length > 0 ? (
                <div className="space-y-3">
                  {upcomingShifts.map(shift => (
                    <div key={shift.id} className="p-4 border border-neutral-200 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="text-center bg-primary-100 rounded-lg px-3 py-2">
                              <p className="text-xs text-primary-600 font-medium">{format(parseISO(shift.date), 'MMM')}</p>
                              <p className="text-xl font-bold text-primary-800">{format(parseISO(shift.date), 'd')}</p>
                            </div>
                            <Avatar 
                              name={shift.employerName} 
                              src={shift.employerAvatar}
                              size="md" 
                            />
                            <div>
                              <p className="font-semibold text-neutral-900">{shift.jobTitle}</p>
                              <p className="text-sm text-neutral-600">{shift.employerName}</p>
                              <p className="text-sm text-neutral-500">{shift.startTime} - {shift.endTime}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={shift.status === 'confirmed' ? 'success' : shift.status === 'swap_requested' ? 'warning' : 'info'}>
                            {shift.status.replace('_', ' ')}
                          </Badge>
                          <p className="text-sm font-semibold text-neutral-900 mt-2">{formatCurrency(shift.payRate)}/{shift.payType === 'hourly' ? 'hr' : 'day'}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {shift.location}
                      </div>
                      {shift.status === 'scheduled' && (
                        <div className="mt-3 pt-3 border-t border-neutral-100 flex gap-2">
                          <Button size="sm" onClick={() => handleConfirm(shift.id)}>Confirm Shift</Button>
                          <Button size="sm" variant="secondary" onClick={() => { setSelectedShift(shift); setShowSwapModal(true); }}>
                            Request Swap
                          </Button>
                        </div>
                      )}
                      {(shift.status === 'confirmed' || shift.status === 'in_progress') && shift.employerId && (
                        <div className="mt-3 pt-3 border-t border-neutral-100">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleMessageEmployer(shift.employerId!, shift.employerName, shift.id)}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Message Employer
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-center py-8">No upcoming shifts scheduled</p>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Swap Request Modal */}
      <Modal isOpen={showSwapModal} onClose={() => setShowSwapModal(false)} title="Request Shift Swap">
        <div className="space-y-4">
          {selectedShift && (
            <div className="p-3 bg-neutral-50 rounded-lg">
              <p className="font-medium">{selectedShift.jobTitle}</p>
              <p className="text-sm text-neutral-600">{format(parseISO(selectedShift.date), 'EEEE, MMMM d')} • {selectedShift.startTime} - {selectedShift.endTime}</p>
            </div>
          )}
          <Textarea
            label="Reason for swap request"
            placeholder="Please explain why you need to swap this shift..."
            value={swapReason}
            onChange={(e) => setSwapReason(e.target.value)}
            rows={3}
          />
          <p className="text-xs text-neutral-500">
            Your request will be posted for other workers to pick up. The employer will be notified once someone accepts.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowSwapModal(false)}>Cancel</Button>
            <Button onClick={handleRequestSwap} disabled={!swapReason.trim()}>Submit Request</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
