import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, CardHeader, Button, Badge, Avatar, Skeleton, Progress } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { analyticsService } from '@/services/analytics.service';
import { notificationsService } from '@/services/notifications.service';
import { deploymentsService } from '@/services/deployments.service';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import type { Shift, DeploymentStatus } from '@/lib/database.types';

interface DashboardStats {
  totalShifts: number;
  activeShifts: number;
  openShifts: number;
  pendingApplications: number;
  confirmedWorkers: number;
  fillRate: number;
}

interface EmployerProfileData {
  company_name: string;
  company_type: string;
  average_rating: number | null;
  total_shifts_posted: number;
  total_workers_deployed: number;
  verified: boolean;
  historical_no_show_rate: number;
}

interface ApplicationWithWorker {
  id: string;
  status: DeploymentStatus;
  applied_at: string;
  worker: {
    user_id: string;
    first_name: string;
    last_name: string;
    reliability_score: number;
    average_rating: number | null;
  };
  profiles?: {
    avatar_url?: string;
  };
  shift: {
    id: string;
    title: string;
  };
}

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

export function EmployerDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profile, setProfile] = useState<EmployerProfileData | null>(null);
  const [recentShifts, setRecentShifts] = useState<Shift[]>([]);
  const [recentApplications, setRecentApplications] = useState<ApplicationWithWorker[]>([]);
  const [pendingReview, setPendingReview] = useState<ApplicationWithWorker[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        // Load dashboard stats
        const dashboardData = await analyticsService.getEmployerDashboardStats(user.id);
        setStats(dashboardData.stats);
        setProfile(dashboardData.profile);
        setRecentShifts(dashboardData.recentShifts as Shift[]);
        setRecentApplications(dashboardData.recentApplications as ApplicationWithWorker[]);
        setPendingReview(dashboardData.pendingReview as ApplicationWithWorker[]);

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

  const handleConfirmWorker = async (deploymentId: string) => {
    try {
      await deploymentsService.confirmWorker(deploymentId, user?.id || null);
      // Refresh data
      const dashboardData = await analyticsService.getEmployerDashboardStats(user!.id);
      setStats(dashboardData.stats);
      setRecentApplications(dashboardData.recentApplications as ApplicationWithWorker[]);
      setPendingReview(dashboardData.pendingReview as ApplicationWithWorker[]);
    } catch (error: any) {
      console.error('Error confirming worker:', error);
      alert(error.message || 'Failed to confirm worker');
    }
  };

  const handleRejectWorker = async (deploymentId: string) => {
    try {
      await deploymentsService.rejectWorker(deploymentId);
      // Refresh data
      const dashboardData = await analyticsService.getEmployerDashboardStats(user!.id);
      setStats(dashboardData.stats);
      setRecentApplications(dashboardData.recentApplications as ApplicationWithWorker[]);
      setPendingReview(dashboardData.pendingReview as ApplicationWithWorker[]);
    } catch (error: any) {
      console.error('Error rejecting worker:', error);
      alert(error.message || 'Failed to reject worker');
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date + 'T00:00:00'), 'MMM d');
  };

  const statItems = [
    { label: 'Active Shifts', value: stats?.activeShifts || 0, change: `${stats?.openShifts || 0} open`, positive: true },
    { label: 'Total Applications', value: recentApplications.length, change: 'All time', positive: true },
    { label: 'Pending Review', value: stats?.pendingApplications || 0, change: 'Needs attention', positive: false },
    { label: 'Fill Rate', value: `${stats?.fillRate || 0}%`, change: 'Current shifts', positive: true },
  ];

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar 
                  name={profile?.company_name || user?.name || ''} 
                  src={(user as any)?.avatar_url}
                  size="lg" 
                />
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">
                    {profile?.company_name || user?.company_name || 'Dashboard'}
                  </h1>
                  <div className="flex items-center gap-3 mt-1">
                    {profile?.average_rating && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium">{profile.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                    <span className="text-sm text-neutral-500">
                      {profile?.total_workers_deployed || 0} workers deployed
                    </span>
                    {profile?.verified && <Badge variant="success">Verified</Badge>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/employer/analytics">
                  <Button variant="secondary">View Analytics</Button>
                </Link>
                <Link to="/employer/shifts/new">
                  <Button>Post New Shift</Button>
                </Link>
              </div>
            </div>

            {/* Notification bar */}
            {unreadNotifications > 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Link to="/notifications" className="text-primary-600 hover:text-primary-700">
                  {unreadNotifications} new notification{unreadNotifications !== 1 ? 's' : ''}
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><Skeleton height={60} /></Card>
              ))
            ) : (
              statItems.map((stat) => (
                <Card key={stat.label}>
                  <p className="text-sm text-neutral-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                  <p className={`text-xs mt-1 ${stat.positive ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {stat.change}
                  </p>
                </Card>
              ))
            )}
          </div>

          {/* Urgent Actions */}
          {pendingReview.length > 0 && (
            <Card className="mb-6 bg-amber-50 border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900">
                      {pendingReview.length} application{pendingReview.length !== 1 ? 's' : ''} need review
                    </h3>
                    <p className="text-sm text-amber-700">Respond quickly to secure top workers</p>
                  </div>
                </div>
                <Link to="/employer/applications?status=pending">
                  <Button size="sm">Review Now</Button>
                </Link>
              </div>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pending Applications */}
              {pendingReview.length > 0 && (
                <Card padding="none">
                  <CardHeader
                    title="Pending Applications"
                    subtitle="Workers waiting for your response"
                    action={<Link to="/employer/applications" className="text-sm text-primary-700 hover:text-primary-800">View all</Link>}
                  />
                  <div className="border-t border-neutral-100">
                    {pendingReview.slice(0, 5).map((app) => (
                      <div key={app.id} className="px-4 py-3 border-b border-neutral-100 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            name={`${app.worker?.first_name || ''} ${app.worker?.last_name || ''}`} 
                            src={app.profiles?.avatar_url || undefined}
                            size="sm" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-neutral-900">
                                {app.worker?.first_name || 'Unknown'} {app.worker?.last_name || ''}
                              </p>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                (app.worker?.reliability_score || 0) >= 80 ? 'bg-green-100 text-green-700' :
                                (app.worker?.reliability_score || 0) >= 60 ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {app.worker?.reliability_score || 0}% reliable
                              </span>
                              {app.worker?.average_rating && (
                                <span className="text-xs text-neutral-500 flex items-center gap-0.5">
                                  <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  {app.worker.average_rating.toFixed(1)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500">{app.shift?.title || 'Unknown Shift'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => handleRejectWorker(app.id)}
                            >
                              Decline
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleConfirmWorker(app.id)}
                            >
                              Confirm
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Recent Applications */}
              <Card padding="none">
                <CardHeader
                  title="Recent Applications"
                  subtitle="Latest worker applications"
                  action={<Link to="/employer/applications" className="text-sm text-primary-700 hover:text-primary-800">View all</Link>}
                />
                <div className="border-t border-neutral-100">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="px-4 py-3 border-b border-neutral-100">
                        <Skeleton height={50} />
                      </div>
                    ))
                  ) : recentApplications.length > 0 ? (
                    recentApplications.slice(0, 5).map((app) => (
                      <div key={app.id} className="px-4 py-3 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            name={`${app.worker?.first_name || ''} ${app.worker?.last_name || ''}`} 
                            src={app.profiles?.avatar_url || undefined}
                            size="sm" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-neutral-900">
                                {app.worker?.first_name || 'Unknown'} {app.worker?.last_name || ''}
                              </p>
                            </div>
                            <p className="text-xs text-neutral-500">{app.shift?.title || 'Unknown Shift'}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={STATUS_VARIANTS[app.status] || 'secondary'}>
                              {app.status.replace('_', ' ')}
                            </Badge>
                            <p className="text-xs text-neutral-400 mt-1">
                              {format(new Date(app.applied_at), 'MMM d')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-neutral-500 mb-2">No applications yet</p>
                      <Link to="/employer/shifts/new"><Button size="sm">Post a Shift</Button></Link>
                    </div>
                  )}
                </div>
              </Card>

              {/* Active Shifts */}
              <Card padding="none">
                <CardHeader
                  title="Active Shifts"
                  subtitle="Currently open positions"
                  action={<Link to="/employer/shifts" className="text-sm text-primary-700 hover:text-primary-800">View all</Link>}
                />
                <div className="border-t border-neutral-100">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="px-4 py-3 border-b border-neutral-100">
                        <Skeleton height={60} />
                      </div>
                    ))
                  ) : recentShifts.filter(s => ['open', 'filled'].includes(s.status)).length > 0 ? (
                    recentShifts.filter(s => ['open', 'filled'].includes(s.status)).slice(0, 5).map((shift) => {
                      const fillPercentage = Math.round((shift.slots_confirmed / shift.slots_needed) * 100);
                      return (
                        <Link 
                          key={shift.id} 
                          to={`/employer/shifts/${shift.id}`} 
                          className="block px-4 py-3 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-neutral-900">{shift.title}</p>
                                {shift.urgency === 'urgent' && <Badge variant="warning">Urgent</Badge>}
                                {shift.urgency === 'critical' && <Badge variant="error">Critical</Badge>}
                              </div>
                              <p className="text-xs text-neutral-500">
                                {shift.location_name} • {formatCurrency(shift.pay_rate)}/hr
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-neutral-900">
                                {shift.slots_confirmed}/{shift.slots_needed}
                              </p>
                              <p className="text-xs text-neutral-400">{formatDate(shift.shift_date)}</p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Progress 
                              value={fillPercentage} 
                              max={100} 
                              size="sm"
                              variant={fillPercentage >= 100 ? 'success' : fillPercentage >= 50 ? 'warning' : 'error'}
                            />
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-neutral-500 mb-2">No active shifts</p>
                      <Link to="/employer/shifts/new"><Button size="sm">Post a Shift</Button></Link>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Performance Overview */}
              <Card>
                <h3 className="font-semibold text-neutral-900 mb-4">Performance</h3>
                {loading ? (
                  <Skeleton height={120} />
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-600">Fill Rate</span>
                        <span className="font-medium">{stats?.fillRate || 0}%</span>
                      </div>
                      <Progress 
                        value={stats?.fillRate || 0} 
                        max={100} 
                        size="sm" 
                        variant={(stats?.fillRate || 0) >= 80 ? 'success' : 'warning'} 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-600">Historical No-Show Rate</span>
                        <span className="font-medium">{(profile?.historical_no_show_rate || 0) * 100}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-600">Total Shifts Posted</span>
                        <span className="font-medium">{profile?.total_shifts_posted || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Quick Stats */}
              <Card>
                <h3 className="font-semibold text-neutral-900 mb-4">Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-neutral-50 border border-neutral-200">
                    <p className="text-2xl font-bold text-primary-800">{stats?.totalShifts || 0}</p>
                    <p className="text-xs text-neutral-500">Total Shifts</p>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 border border-neutral-200">
                    <p className="text-2xl font-bold text-emerald-600">{stats?.confirmedWorkers || 0}</p>
                    <p className="text-xs text-neutral-500">Confirmed Workers</p>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card>
                <h3 className="font-semibold text-neutral-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link to="/employer/shifts/new" className="block w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 border border-neutral-200">
                    Post New Shift
                  </Link>
                  <Link to="/employer/shifts" className="block w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 border border-neutral-200">
                    Manage Shifts
                  </Link>
                  <Link to="/employer/applications" className="block w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 border border-neutral-200">
                    Review Applications
                  </Link>
                  <Link to="/employer/favorites" className="block w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 border border-neutral-200">
                    Favorite Workers
                  </Link>
                  <Link to="/employer/time-approval" className="block w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 border border-neutral-200">
                    Approve Time Entries
                  </Link>
                  <Link to="/messages" className="block w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 border border-neutral-200">
                    Messages
                  </Link>
                  <Link to="/employer/analytics" className="block w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 border border-neutral-200">
                    View Analytics
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
