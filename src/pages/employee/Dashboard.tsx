import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, PageContainer } from '@/components/layout';
import { Card, CardHeader, Button, Badge, Progress, Avatar, Skeleton, DashboardGrid } from '@/components/ui';
import { StatCard } from '@/components/ui/AnimatedCard';
import { typography } from '@/lib/typography';
import { useAuthStore } from '@/store/authStore';
import { analyticsService } from '@/services/analytics.service';
import { shiftsService } from '@/services/shifts.service';
import { notificationsService } from '@/services/notifications.service';
import { messagesService } from '@/services/messages.service';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import type { WorkerStatus, DeploymentStatus, ShiftWithEmployer } from '@/lib/database.types';

interface DashboardStats {
  totalApplications: number;
  upcomingShifts: number;
  confirmedShifts: number;
  completedShifts: number;
  pendingApplications: number;
  totalEarnings: number;
  totalHours: number;
  avgHourlyRate: number;
}

interface WorkerProfileData {
  reliability_score: number;
  worker_status: WorkerStatus;
  average_rating: number | null;
  total_shifts_completed: number;
  no_show_count: number;
}

interface DeploymentWithShift {
  id: string;
  status: DeploymentStatus;
  scheduled_start: string;
  applied_at: string;
  total_pay: number | null;
  shift: {
    id: string;
    title: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    pay_rate: number;
    location_name: string;
    employer: {
      user_id: string;
      company_name: string;
    };
  };
}

const WORKER_STATUS_LABELS: Record<WorkerStatus, string> = {
  standard: 'Standard',
  verified: 'Verified',
  preferred: 'Preferred',
  elite: 'Elite',
};

const STATUS_VARIANTS: Record<string, 'warning' | 'info' | 'success' | 'error' | 'secondary'> = {
  applied: 'warning',
  confirmed: 'success',
  standby: 'info',
  waitlist: 'secondary',
  checked_in: 'success',
  in_progress: 'info',
  completed: 'secondary',
  no_show: 'error',
  cancelled: 'error',
  rejected: 'error',
};

export function EmployeeDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profile, setProfile] = useState<WorkerProfileData | null>(null);
  const [upcomingShifts, setUpcomingShifts] = useState<DeploymentWithShift[]>([]);
  const [recentApplications, setRecentApplications] = useState<DeploymentWithShift[]>([]);
  const [availableShifts, setAvailableShifts] = useState<ShiftWithEmployer[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        // Load dashboard stats
        const dashboardData = await analyticsService.getWorkerDashboardStats(user.id);
        setStats(dashboardData.stats);
        setProfile(dashboardData.profile);
        setUpcomingShifts(dashboardData.upcomingShifts as DeploymentWithShift[]);
        setRecentApplications(dashboardData.recentApplications as DeploymentWithShift[]);

        // Load available shifts
        const shifts = await shiftsService.getAvailableShifts({ });
        setAvailableShifts(shifts.slice(0, 4));

        // Load unread notifications count
        const unreadCount = await notificationsService.getUnreadCount(user.id);
        setUnreadNotifications(unreadCount);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
  };

  const handleMessageEmployer = async (employerId: string, _employerName: string, shiftId: string) => {
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

  const StatIcon = ({ type }: { type: string }) => {
    const icons: Record<string, JSX.Element> = {
      document: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      calendar: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      check: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
      star: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    };
    return icons[type] || null;
  };

  const statItems = [
    { label: 'Applications', value: stats?.totalApplications || 0, icon: 'document' },
    { label: 'Upcoming', value: stats?.upcomingShifts || 0, icon: 'calendar' },
    { label: 'Confirmed', value: stats?.confirmedShifts || 0, icon: 'check' },
    { label: 'Completed', value: stats?.completedShifts || 0, icon: 'star' },
  ];

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen pb-20 md:pb-0">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200">
          <PageContainer>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar 
                  name={user?.name || ''} 
                  size="lg" 
                  src={(user as any)?.avatar_url}
                />
                <div>
                  <h1 className={typography.pageTitle}>
                    Welcome back, {user?.name?.split(' ')[0]}
                  </h1>
                  <div className="flex items-center gap-3 mt-1">
                    {profile?.average_rating && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className={typography.metadata}>{profile.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                    <span className={typography.metadata}>
                      {profile?.total_shifts_completed || 0} shifts completed
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/employee/profile">
                  <Button variant="secondary">Edit Profile</Button>
                </Link>
                <Link to="/employee/jobs">
                  <Button>Find Shifts</Button>
                </Link>
              </div>
            </div>

            {/* Worker Status Bar */}
            {profile && (
              <div className="mt-4 flex items-center gap-6 text-sm">
                <Link to="/employee/levels" className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span>{WORKER_STATUS_LABELS[profile.worker_status]} Worker</span>
                </Link>
                <span className="text-neutral-300">|</span>
                <span className={`${profile.reliability_score >= 80 ? 'text-green-600' : profile.reliability_score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                  {profile.reliability_score}% Reliability
                </span>
                {unreadNotifications > 0 && (
                  <>
                    <span className="text-neutral-300">|</span>
                    <Link to="/notifications" className="text-blue-600 hover:text-blue-700">
                      {unreadNotifications} new notification{unreadNotifications !== 1 ? 's' : ''}
                    </Link>
                  </>
                )}
              </div>
            )}
          </PageContainer>
        </div>

        <PageContainer>
          {/* Stats */}
          <DashboardGrid columns={4} className="mb-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><Skeleton height={60} /></Card>
              ))
            ) : (
              statItems.map((stat, index) => (
                <StatCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  icon={<StatIcon type={stat.icon} />}
                  delay={index * 0.1}
                  trend={stat.label === 'Completed' && stats && stats.completedShifts > 0 ? {
                    value: stats.completedShifts,
                    isPositive: true
                  } : undefined}
                />
              ))
            )}
          </DashboardGrid>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Shifts */}
              <Card padding="none">
                <CardHeader
                  title="Upcoming Shifts"
                  subtitle="Your confirmed and standby shifts"
                  action={<Link to="/employee/schedule" className="text-sm text-primary-700 hover:text-primary-800">View schedule</Link>}
                />
                <div className="border-t border-neutral-100">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="px-4 py-3 border-b border-neutral-100">
                        <Skeleton height={50} />
                      </div>
                    ))
                  ) : upcomingShifts.length > 0 ? (
                    upcomingShifts.map((deployment) => (
                      <div key={deployment.id} className="px-4 py-3 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50">
                        <Link 
                          to={`/employee/shifts/${deployment.shift?.id || ''}`}
                          className="block"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-neutral-900">{deployment.shift?.title || 'Unknown Shift'}</p>
                                <Badge variant={STATUS_VARIANTS[deployment.status] || 'secondary'}>
                                  {deployment.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-neutral-500">
                                {deployment.shift?.employer?.company_name || 'Unknown'} • {deployment.shift?.location_name || 'Unknown Location'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-neutral-900">
                                {deployment.shift?.shift_date ? format(new Date(deployment.shift.shift_date + 'T00:00:00'), 'MMM d') : 'TBD'}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {deployment.shift?.start_time && deployment.shift?.end_time 
                                  ? `${formatTime(deployment.shift.start_time)} - ${formatTime(deployment.shift.end_time)}`
                                  : 'Time TBD'}
                              </p>
                            </div>
                          </div>
                        </Link>
                        {(deployment.status === 'confirmed' || deployment.status === 'in_progress') && deployment.shift?.employer && (
                          <div className="mt-2 pt-2 border-t border-neutral-100">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={(e) => {
                                e.preventDefault();
                                handleMessageEmployer(
                                  deployment.shift!.employer!.user_id,
                                  deployment.shift!.employer!.company_name,
                                  deployment.shift!.id
                                );
                              }}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              Message Employer
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-neutral-500 mb-2">No upcoming shifts</p>
                      <Link to="/employee/jobs"><Button size="sm">Browse Shifts</Button></Link>
                    </div>
                  )}
                </div>
              </Card>

              {/* Recent Applications */}
              <Card padding="none">
                <CardHeader
                  title="Recent Applications"
                  subtitle="Track your shift applications"
                  action={<Link to="/employee/applications" className="text-sm text-primary-700 hover:text-primary-800">View all</Link>}
                />
                <div className="border-t border-neutral-100">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="px-4 py-3 border-b border-neutral-100">
                        <Skeleton height={40} />
                      </div>
                    ))
                  ) : recentApplications.length > 0 ? (
                    recentApplications.slice(0, 5).map((app) => (
                      <div key={app.id} className="px-4 py-3 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">{app.shift?.title || 'Unknown Shift'}</p>
                            <p className="text-xs text-neutral-500">
                              {app.shift?.employer?.company_name || 'Unknown'} • {app.shift?.location_name || 'Unknown Location'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={STATUS_VARIANTS[app.status] || 'secondary'}>
                              {app.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-neutral-400">
                              {format(new Date(app.applied_at), 'MMM d')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-neutral-500 mb-2">No applications yet</p>
                      <Link to="/employee/jobs"><Button size="sm">Browse Shifts</Button></Link>
                    </div>
                  )}
                </div>
              </Card>

              {/* Available Shifts */}
              <Card padding="none">
                <CardHeader
                  title="Available Shifts"
                  subtitle="Shifts matching your profile"
                  action={<Link to="/employee/jobs" className="text-sm text-primary-700 hover:text-primary-800">View all</Link>}
                />
                <div className="border-t border-neutral-100">
                  {availableShifts.map((shift) => {
                    const remainingSlots = shift.slots_total - shift.slots_confirmed - shift.slots_standby;
                    return (
                      <Link 
                        key={shift.id} 
                        to={`/employee/shifts/${shift.id}`} 
                        className="block px-4 py-3 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-neutral-900">{shift.title}</p>
                              {shift.urgency === 'urgent' && <Badge variant="warning">Urgent</Badge>}
                              {shift.urgency === 'critical' && <Badge variant="error">Critical</Badge>}
                            </div>
                            <p className="text-xs text-neutral-500">
                              {shift.employer?.company_name} • {shift.location_name}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-neutral-600">{formatCurrency(shift.pay_rate)}/hr</span>
                              <span className={`text-xs ${remainingSlots <= 3 ? 'text-red-600' : 'text-green-600'}`}>
                                {remainingSlots} slots left
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-neutral-400">
                            {format(new Date(shift.shift_date + 'T00:00:00'), 'MMM d')}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Earnings Summary */}
              <Card>
                <h3 className="font-semibold text-neutral-900 mb-4">Earnings</h3>
                {loading ? (
                  <Skeleton height={80} />
                ) : (
                  <>
                    <div className="text-center py-4 bg-neutral-50 border border-neutral-200 mb-4">
                      <p className="text-3xl font-bold text-primary-800">
                        {formatCurrency(stats?.totalEarnings || 0)}
                      </p>
                      <p className="text-sm text-neutral-500">Total Earnings</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-semibold text-neutral-900">
                          {formatCurrency(stats?.avgHourlyRate || 0)}
                        </p>
                        <p className="text-xs text-neutral-500">Avg Hourly Rate</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-neutral-900">
                          {stats?.totalHours || 0}
                        </p>
                        <p className="text-xs text-neutral-500">Hours Worked</p>
                      </div>
                    </div>
                  </>
                )}
              </Card>

              {/* Reliability Score */}
              {profile && (
                <Card>
                  <h3 className="font-semibold text-neutral-900 mb-4">Reliability Score</h3>
                  <div className="text-center mb-4">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-4 ${
                      profile.reliability_score >= 80 ? 'border-green-500 text-green-600' :
                      profile.reliability_score >= 60 ? 'border-amber-500 text-amber-600' :
                      'border-red-500 text-red-600'
                    }`}>
                      <span className="text-2xl font-bold">{profile.reliability_score}</span>
                    </div>
                  </div>
                  <Progress 
                    value={profile.reliability_score} 
                    max={100} 
                    size="sm"
                    variant={profile.reliability_score >= 80 ? 'success' : profile.reliability_score >= 60 ? 'warning' : 'error'}
                  />
                  <p className="text-xs text-neutral-500 text-center mt-2">
                    {profile.reliability_score >= 80 ? 'Excellent reliability!' :
                     profile.reliability_score >= 60 ? 'Good standing' :
                     'Needs improvement'}
                  </p>
                  {profile.no_show_count > 0 && (
                    <p className="text-xs text-red-600 text-center mt-1">
                      {profile.no_show_count} no-show{profile.no_show_count !== 1 ? 's' : ''} on record
                    </p>
                  )}
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <h3 className="font-semibold text-neutral-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link to="/employee/jobs" className="block w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 border border-neutral-200">
                    Find Shifts
                  </Link>
                  <Link to="/employee/schedule" className="block w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 border border-neutral-200">
                    My Schedule
                  </Link>
                  <Link to="/employee/reputation" className="block w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 border border-neutral-200">
                    Reputation & Reviews
                  </Link>
                  <Link to="/employee/favorites" className="block w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 border border-neutral-200">
                    Favorite Employers
                  </Link>
                  <Link to="/messages" className="block w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 border border-neutral-200">
                    Messages
                  </Link>
                  <Link to="/notifications" className="block w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 border border-neutral-200">
                    Notifications
                  </Link>
                  <Link to="/help" className="block w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 border border-neutral-200">
                    Help Center
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </PageContainer>
      </div>
    </Layout>
  );
}
