import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Card, CardHeader, Button, Badge, Modal, Skeleton } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { deploymentsService } from '@/services/deployments.service';
import { format, differenceInMinutes, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import type { Deployment } from '@/lib/database.types';

interface DeploymentWithShift extends Deployment {
  shift: {
    id: string;
    title: string;
    location_name: string;
    employer: {
      company_name: string;
    };
  };
}

export function TimeTracking() {
  const { user } = useAuthStore();
  const [deployments, setDeployments] = useState<DeploymentWithShift[]>([]);
  const [activeDeployment, setActiveDeployment] = useState<DeploymentWithShift | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentWithShift | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const loadDeployments = async () => {
      if (!user?.id) return;

      try {
        const data = await deploymentsService.getWorkerDeployments(user.id);
        console.log('📊 Loaded deployments:', data.map(d => ({ 
          id: d.id, 
          status: d.status, 
          title: d.shift?.title,
          has_check_in: !!d.check_in_at 
        })));
        setDeployments(data as DeploymentWithShift[]);
        
        // Find active deployment (checked in but not checked out)
        const active = data.find(d => d.status === 'checked_in' || d.status === 'in_progress');
        setActiveDeployment(active as DeploymentWithShift || null);
      } catch (error) {
        console.error('Error loading deployments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDeployments();
  }, [user]);

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const completedDeployments = deployments.filter(d => d.status === 'completed');
  
  const getEntriesForDay = (date: Date) => 
    completedDeployments.filter(d => d.check_in_at && isSameDay(new Date(d.check_in_at), date));
  
  const getTotalMinutesForDay = (date: Date) => {
    return getEntriesForDay(date).reduce((total, entry) => {
      return total + (entry.total_minutes || 0);
    }, 0);
  };

  const weekTotalMinutes = weekDays.reduce((total, day) => total + getTotalMinutesForDay(day), 0);
  const weekTotalHours = Math.floor(weekTotalMinutes / 60);
  const weekTotalMins = weekTotalMinutes % 60;

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error('Unable to get location. Please enable location services.'));
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleCheckIn = async (deployment: DeploymentWithShift) => {
    setCheckingIn(true);
    setLocationError(null);

    try {
      const location = await getCurrentLocation();
      await deploymentsService.checkIn(deployment.id, location, 'gps');
      
      // Refresh deployments
      const data = await deploymentsService.getWorkerDeployments(user!.id);
      setDeployments(data as DeploymentWithShift[]);
      setActiveDeployment(data.find(d => d.status === 'checked_in' || d.status === 'in_progress') as DeploymentWithShift || null);
      setShowCheckInModal(false);
    } catch (error: any) {
      console.error('Check-in error:', error);
      setLocationError(error.message || 'Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activeDeployment) return;

    setCheckingOut(true);
    setLocationError(null);

    try {
      const location = await getCurrentLocation();
      await deploymentsService.checkOut(activeDeployment.id, location, 'gps');
      
      // Refresh deployments
      const data = await deploymentsService.getWorkerDeployments(user!.id);
      setDeployments(data as DeploymentWithShift[]);
      setActiveDeployment(null);
    } catch (error: any) {
      console.error('Check-out error:', error);
      setLocationError(error.message || 'Failed to check out');
    } finally {
      setCheckingOut(false);
    }
  };

  // Get upcoming confirmed shifts for check-in (allow anytime, not just 30-min window)
  // Only show confirmed shifts for TODAY that haven't been checked in yet
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  const upcomingShifts = deployments.filter(d => {
    const shiftDate = d.shift?.shift_date || d.scheduled_start.split('T')[0];
    return (
      d.status === 'confirmed' &&
      d.shift && // Ensure shift data exists
      !d.check_in_at && // Not already checked in
      shiftDate === today // Only today's shifts
    );
  });

  // Debug log
  console.log('🔍 Upcoming shifts for clock-in (TODAY only):', upcomingShifts.map(d => ({
    title: d.shift?.title,
    status: d.status,
    shift_date: d.shift?.shift_date,
    scheduled: d.scheduled_start,
    has_check_in: !!d.check_in_at
  })));

  const statusVariant: Record<string, 'warning' | 'info' | 'success' | 'error' | 'secondary'> = {
    applied: 'warning',
    confirmed: 'info',
    standby: 'warning',
    checked_in: 'success',
    in_progress: 'success',
    completed: 'secondary',
    no_show: 'error',
    cancelled: 'error',
  };

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-neutral-900">Time Tracking</h1>
                <p className="text-sm text-neutral-500 mt-1">Track your work hours and manage timesheets</p>
              </div>
              {activeDeployment ? (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-neutral-500">Currently clocked in</p>
                    <p className="text-lg font-semibold text-emerald-600">
                      {activeDeployment.check_in_at && formatDuration(
                        differenceInMinutes(new Date(), new Date(activeDeployment.check_in_at))
                      )}
                    </p>
                  </div>
                  <Button variant="danger" onClick={handleCheckOut} loading={checkingOut}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    Clock Out
                  </Button>
                </div>
              ) : upcomingShifts.length > 0 ? (
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600">
                    {upcomingShifts.length} {upcomingShifts.length === 1 ? 'shift' : 'shifts'} ready
                  </p>
                  <p className="text-xs text-neutral-500">Scroll down to clock in</p>
                </div>
              ) : (
                <p className="text-sm text-neutral-500">No shifts ready for check-in</p>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Available Shifts for Clock-In */}
          {!activeDeployment && upcomingShifts.length > 0 && (
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 text-lg">Ready to Clock In</h3>
                      <p className="text-sm text-blue-700">
                        {upcomingShifts.length} {upcomingShifts.length === 1 ? 'shift' : 'shifts'} available
                      </p>
                    </div>
                  </div>
                  
                  {/* Show first upcoming shift details */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-neutral-900 text-lg">
                            {upcomingShifts[0].shift?.title || 'Shift'}
                          </h4>
                          <Badge variant="success">Confirmed</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-neutral-600">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>{upcomingShifts[0].shift?.employer?.company_name || 'Company'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{upcomingShifts[0].shift?.location_name || 'Location'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium text-neutral-900">
                              {format(new Date(upcomingShifts[0].scheduled_start), 'MMM d, yyyy • h:mm a')} - {format(new Date(upcomingShifts[0].scheduled_end), 'h:mm a')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium text-emerald-600">
                              {formatCurrency(upcomingShifts[0].pay_rate)}/hr
                            </span>
                          </div>
                        </div>
                        
                        {upcomingShifts.length > 1 && (
                          <div className="mt-3 pt-3 border-t border-neutral-200">
                            <p className="text-xs text-neutral-500">
                              + {upcomingShifts.length - 1} more {upcomingShifts.length - 1 === 1 ? 'shift' : 'shifts'} available
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        onClick={() => {
                          setSelectedDeployment(upcomingShifts[0]);
                          setShowCheckInModal(true);
                        }}
                        className="ml-4"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Clock In
                      </Button>
                    </div>
                  </div>
                  
                  {/* Show all shifts if multiple */}
                  {upcomingShifts.length > 1 && (
                    <div className="mt-3 space-y-2">
                      {upcomingShifts.slice(1).map((deployment) => (
                        <div key={deployment.id} className="bg-white rounded-lg p-3 border border-blue-100 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-neutral-900 text-sm">
                              {deployment.shift?.title || 'Shift'}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {deployment.shift?.employer?.company_name} • {format(new Date(deployment.scheduled_start), 'MMM d, h:mm a')}
                            </p>
                          </div>
                          <Button 
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedDeployment(deployment);
                              setShowCheckInModal(true);
                            }}
                          >
                            Select
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Active Session */}
          {activeDeployment && (
            <Card className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-emerald-300">
                    <div className="relative">
                      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900 text-lg">Session Active</h3>
                    <p className="text-sm text-emerald-700">
                      {activeDeployment.shift.title} at {activeDeployment.shift.employer.company_name}
                    </p>
                    <p className="text-xs text-emerald-600">
                      Started at {activeDeployment.check_in_at && format(new Date(activeDeployment.check_in_at), 'h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-3xl font-bold text-emerald-700 tabular-nums">
                      {activeDeployment.check_in_at && formatDuration(
                        differenceInMinutes(new Date(), new Date(activeDeployment.check_in_at))
                      )}
                    </p>
                    <p className="text-xs text-emerald-600 uppercase tracking-wide">Elapsed</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={handleCheckOut} loading={checkingOut}>
                    End Session
                  </Button>
                </div>
              </div>
              {locationError && (
                <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                  {locationError}
                </div>
              )}
            </Card>
          )}

          {/* Week Summary */}
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-900">Weekly Overview</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedWeek(new Date(selectedWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
                >
                  Previous
                </Button>
                <span className="text-sm text-neutral-600 px-2">
                  {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedWeek(new Date(selectedWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
                >
                  Next
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map(day => {
                const dayMinutes = getTotalMinutesForDay(day);
                const isToday = isSameDay(day, new Date());
                return (
                  <div 
                    key={day.toISOString()} 
                    className={`p-3 text-center border rounded ${
                      isToday ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'
                    }`}
                  >
                    <p className="text-xs text-neutral-500">{format(day, 'EEE')}</p>
                    <p className={`text-sm font-medium ${isToday ? 'text-primary-700' : 'text-neutral-900'}`}>
                      {format(day, 'd')}
                    </p>
                    <p className={`text-xs mt-1 ${dayMinutes > 0 ? 'text-emerald-600' : 'text-neutral-400'}`}>
                      {dayMinutes > 0 ? formatDuration(dayMinutes) : '-'}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <div>
                <p className="text-sm text-neutral-500">Total Hours This Week</p>
                <p className="text-2xl font-bold text-neutral-900">{weekTotalHours}h {weekTotalMins}m</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-500">Estimated Earnings</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${completedDeployments
                    .filter(d => d.check_in_at && weekDays.some(day => isSameDay(new Date(d.check_in_at!), day)))
                    .reduce((sum, d) => sum + (d.total_pay || 0), 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          {/* Time Entries */}
          <Card padding="none">
            <CardHeader title="Time Entries" subtitle="Detailed log of your work sessions" />
            <div className="border-t border-neutral-100">
              {loading ? (
                <div className="p-4">
                  <Skeleton height={200} />
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-neutral-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Shift</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Clock In</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Clock Out</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Pay</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {deployments.filter(d => d.check_in_at || d.status === 'completed').length > 0 ? (
                      deployments
                        .filter(d => d.check_in_at || d.status === 'completed')
                        .slice(0, 20)
                        .map(entry => (
                          <tr key={entry.id} className="hover:bg-neutral-50">
                            <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                              {entry.check_in_at ? format(new Date(entry.check_in_at), 'MMM d, yyyy') : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-neutral-600">
                              <p className="font-medium">{entry.shift.title}</p>
                              <p className="text-xs text-neutral-500">{entry.shift.employer.company_name}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-neutral-600">
                              {entry.check_in_at ? format(new Date(entry.check_in_at), 'h:mm a') : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-neutral-600">
                              {entry.check_out_at ? format(new Date(entry.check_out_at), 'h:mm a') : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                              {entry.total_minutes ? formatDuration(entry.total_minutes) : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-emerald-600">
                              {entry.total_pay ? formatCurrency(entry.total_pay) : '-'}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={statusVariant[entry.status] || 'secondary'}>
                                {entry.payment_status === 'paid' ? 'Paid' : entry.status.replace('_', ' ')}
                              </Badge>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                          No time entries yet. Check in to a shift to start tracking.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Check In Modal */}
      <Modal 
        isOpen={showCheckInModal} 
        onClose={() => setShowCheckInModal(false)} 
        title="Start Work Session" 
        size="md"
      >
        {selectedDeployment && (
          <div className="space-y-6">
            {/* Visual Clock */}
            <div className="text-center py-6 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-lg">
              <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm border border-primary-200">
                <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-primary-900 mt-4">{format(new Date(), 'h:mm a')}</p>
              <p className="text-sm text-primary-600">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            </div>

            {/* Shift Details */}
            <div className="p-4 bg-neutral-50 rounded-lg">
              <p className="font-medium text-neutral-900 text-lg">{selectedDeployment.shift?.title || 'Shift'}</p>
              <p className="text-sm text-neutral-600 mt-1">{selectedDeployment.shift?.employer?.company_name || 'Company'}</p>
              <p className="text-sm text-neutral-500">{selectedDeployment.shift?.location_name || 'Location'}</p>
              <div className="mt-2 pt-2 border-t border-neutral-200">
                <p className="text-xs text-neutral-500">Scheduled Time</p>
                <p className="text-sm font-medium text-neutral-700">
                  {format(new Date(selectedDeployment.scheduled_start), 'h:mm a')} - {format(new Date(selectedDeployment.scheduled_end), 'h:mm a')}
                </p>
              </div>
            </div>

            {locationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{locationError}</p>
              </div>
            )}

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> You can clock in anytime, but the system will calculate your hours from the scheduled start time. 
                Your location will be recorded for verification. Make sure you're at the work site before checking in.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowCheckInModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={() => handleCheckIn(selectedDeployment)} 
                loading={checkingIn}
                className="flex-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Session
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
