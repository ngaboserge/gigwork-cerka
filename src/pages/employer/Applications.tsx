import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Button, Badge, Card, Modal, Avatar, Skeleton } from '@/components/ui';
import { useAuthStore } from '@/store';
import { shiftsService } from '@/services/shifts.service';
import { deploymentsService } from '@/services/deployments.service';
import { messagesService } from '@/services/messages.service';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import type { DeploymentStatus } from '@/lib/database.types';

interface ApplicationWithDetails {
  id: string;
  worker_id: string;
  shift_id: string;
  status: DeploymentStatus;
  applied_at: string;
  worker?: {
    user_id: string;
    first_name: string;
    last_name: string;
    reliability_score: number;
    average_rating: number | null;
    total_shifts_completed: number;
    worker_status: string;
  };
  profiles?: {
    avatar_url?: string;
  };
  shift?: {
    id: string;
    title: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    pay_rate: number;
    location_name: string;
    slots_confirmed?: number;
    slots_standby?: number;
    slots_needed?: number;
  };
}

export function EmployerApplications() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DeploymentStatus | 'all'>('all');
  const [selectedApp, setSelectedApp] = useState<ApplicationWithDetails | null>(null);

  useEffect(() => {
    const loadApplications = async () => {
      if (!user?.id) return;

      try {
        // Get all shifts for this employer
        const shifts = await shiftsService.getEmployerShifts(user.id);
        const shiftIds = shifts.map(s => s.id);

        if (shiftIds.length === 0) {
          setApplications([]);
          setLoading(false);
          return;
        }

        // Get all deployments for these shifts
        const { data: deployments, error } = await supabase
          .from('deployments')
          .select(`
            *,
            profiles!deployments_worker_id_fkey(
              avatar_url,
              worker_profiles(
                user_id,
                first_name,
                last_name,
                reliability_score,
                average_rating,
                total_shifts_completed,
                worker_status
              )
            ),
            shifts(
              id,
              title,
              shift_date,
              start_time,
              end_time,
              pay_rate,
              location_name,
              slots_confirmed,
              slots_standby,
              slots_needed
            )
          `)
          .in('shift_id', shiftIds)
          .order('applied_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching deployments:', error);
          throw error;
        }

        // Map the data
        const mappedApplications = (deployments || []).map(d => {
          // Handle nested array responses from Supabase
          const profiles = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
          const workerProfiles = profiles?.worker_profiles;
          const worker = Array.isArray(workerProfiles) ? workerProfiles[0] : workerProfiles;
          const shift = Array.isArray(d.shifts) ? d.shifts[0] : d.shifts;
          
          return {
            ...d,
            worker: worker,
            profiles: profiles, // Keep profiles for avatar_url
            shift: shift
          };
        });

        console.log('📸 Sample application data:', mappedApplications[0]);
        console.log('📸 Avatar URL:', mappedApplications[0]?.profiles?.avatar_url);
        console.log('📸 Worker name:', mappedApplications[0]?.worker?.first_name, mappedApplications[0]?.worker?.last_name);

        setApplications(mappedApplications);
      } catch (error) {
        console.error('Error loading applications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
    
    // Refresh applications every 5 seconds to show updated slot counts
    const interval = setInterval(() => {
      if (!loading) {
        loadApplications();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [user]);

  const filteredApps = filter === 'all' 
    ? applications 
    : applications.filter((a) => a.status === filter);

  const statusVariant: Record<DeploymentStatus, 'success' | 'info' | 'secondary' | 'error' | 'warning'> = {
    applied: 'warning',
    confirmed: 'success',
    standby: 'info',
    waitlist: 'secondary',
    rejected: 'error',
    cancelled: 'error',
    checked_in: 'info',
    in_progress: 'info',
    completed: 'secondary',
    no_show: 'error',
    late: 'warning',
  };

  const handleConfirm = async (deploymentId: string) => {
    try {
      console.log('🔄 Confirming worker, deployment ID:', deploymentId);
      await deploymentsService.confirmWorker(deploymentId, user?.id || null);
      
      console.log('✅ Worker confirmed, reloading applications...');
      
      // Reload all applications to get fresh data
      if (!user?.id) return;
      
      const shifts = await shiftsService.getEmployerShifts(user.id);
      const shiftIds = shifts.map(s => s.id);

      if (shiftIds.length > 0) {
        const { data: deployments, error } = await supabase
          .from('deployments')
          .select(`
            *,
            profiles!deployments_worker_id_fkey(
              avatar_url,
              worker_profiles(
                user_id,
                first_name,
                last_name,
                reliability_score,
                average_rating,
                total_shifts_completed,
                worker_status
              )
            ),
            shifts(
              id,
              title,
              shift_date,
              start_time,
              end_time,
              pay_rate,
              location_name,
              slots_confirmed,
              slots_standby,
              slots_needed
            )
          `)
          .in('shift_id', shiftIds)
          .order('applied_at', { ascending: false });

        if (!error) {
          const mappedApplications = (deployments || []).map(d => {
            // Handle nested array responses from Supabase
            const profiles = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
            const workerProfiles = profiles?.worker_profiles;
            const worker = Array.isArray(workerProfiles) ? workerProfiles[0] : workerProfiles;
            const shift = Array.isArray(d.shifts) ? d.shifts[0] : d.shifts;
            
            return {
              ...d,
              worker: worker,
              profiles: profiles,
              shift: shift
            };
          });
          setApplications(mappedApplications);
          console.log('✅ Applications reloaded, new slot counts:', 
            mappedApplications[0]?.shift ? 
            `${mappedApplications[0].shift.slots_confirmed}/${mappedApplications[0].shift.slots_needed}` : 
            'N/A'
          );
        }
      }
      
      setSelectedApp(null);
      alert('Worker confirmed successfully! Check the shift slot counts.');
    } catch (error) {
      console.error('❌ Error confirming worker:', error);
      alert('Failed to confirm worker: ' + (error as Error).message);
    }
  };

  const handleReject = async (deploymentId: string) => {
    try {
      await deploymentsService.rejectWorker(deploymentId, 'Not selected at this time');
      
      // Reload all applications to get fresh data
      if (!user?.id) return;
      
      const shifts = await shiftsService.getEmployerShifts(user.id);
      const shiftIds = shifts.map(s => s.id);

      if (shiftIds.length > 0) {
        const { data: deployments, error } = await supabase
          .from('deployments')
          .select(`
            *,
            profiles!deployments_worker_id_fkey(
              avatar_url,
              worker_profiles(
                user_id,
                first_name,
                last_name,
                reliability_score,
                average_rating,
                total_shifts_completed,
                worker_status
              )
            ),
            shifts(
              id,
              title,
              shift_date,
              start_time,
              end_time,
              pay_rate,
              location_name
            )
          `)
          .in('shift_id', shiftIds)
          .order('applied_at', { ascending: false });

        if (!error) {
          const mappedApplications = (deployments || []).map(d => {
            // Handle nested array responses from Supabase
            const profiles = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
            const workerProfiles = profiles?.worker_profiles;
            const worker = Array.isArray(workerProfiles) ? workerProfiles[0] : workerProfiles;
            const shift = Array.isArray(d.shifts) ? d.shifts[0] : d.shifts;
            
            return {
              ...d,
              worker: worker,
              profiles: profiles,
              shift: shift
            };
          });
          setApplications(mappedApplications);
        }
      }
      
      setSelectedApp(null);
      alert('Worker rejected');
    } catch (error) {
      console.error('Error rejecting worker:', error);
      alert('Failed to reject worker: ' + (error as Error).message);
    }
  };

  const handleMessage = async (workerId: string, workerName: string, shiftId?: string) => {
    if (!user?.id) return;
    
    try {
      // Create or get conversation
      const conversation = await messagesService.getOrCreateConversation(
        user.id,
        workerId,
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
            <h1 className="text-xl font-bold text-neutral-900">Applications</h1>
            <p className="text-sm text-neutral-600 mt-1">{applications.length} total applications</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(['all', 'applied', 'confirmed', 'standby', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${
                  filter === status 
                    ? 'bg-primary-800 text-white' 
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')}
              </button>
            ))}
          </div>

          <Card padding="none">
            {loading ? (
              <div className="p-8">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="mb-4">
                    <Skeleton height={60} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Worker</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Shift</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Slots</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Reliability</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Applied</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map((app) => (
                      <tr key={app.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar 
                              name={`${app.worker?.first_name || ''} ${app.worker?.last_name || ''}`} 
                              src={app.profiles?.avatar_url || undefined}
                              size="sm" 
                            />
                            <div>
                              <p className="text-sm font-medium text-neutral-900">
                                {app.worker?.first_name || 'Unknown'} {app.worker?.last_name || ''}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {app.worker?.total_shifts_completed || 0} shifts completed
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-neutral-900">{app.shift?.title || 'Unknown'}</p>
                          <p className="text-xs text-neutral-500">{app.shift?.location_name || ''}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-neutral-900">
                            {app.shift?.shift_date ? format(new Date(app.shift.shift_date + 'T00:00:00'), 'MMM d, yyyy') : '-'}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {app.shift?.start_time && app.shift?.end_time 
                              ? `${app.shift.start_time} - ${app.shift.end_time}`
                              : '-'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <span className={`font-medium ${
                              (app.shift?.slots_confirmed || 0) >= (app.shift?.slots_needed || 0) 
                                ? 'text-green-600' 
                                : 'text-amber-600'
                            }`}>
                              {app.shift?.slots_confirmed || 0}
                            </span>
                            <span className="text-neutral-500">/{app.shift?.slots_needed || 0}</span>
                          </div>
                          {(app.shift?.slots_standby || 0) > 0 && (
                            <p className="text-xs text-amber-600">+{app.shift?.slots_standby} standby</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${
                              (app.worker?.reliability_score || 0) >= 80 ? 'text-green-600' :
                              (app.worker?.reliability_score || 0) >= 60 ? 'text-amber-600' :
                              'text-red-600'
                            }`}>
                              {app.worker?.reliability_score || 0}%
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
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600">
                          {format(new Date(app.applied_at), 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant[app.status]}>
                            {app.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedApp(app)}>
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredApps.length === 0 && (
                  <p className="py-12 text-center text-neutral-500">No applications found</p>
                )}
              </div>
            )}
          </Card>
        </div>

        <Modal 
          isOpen={!!selectedApp} 
          onClose={() => setSelectedApp(null)} 
          title="Application Details" 
          size="lg"
        >
          {selectedApp && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-neutral-200">
                <Avatar 
                  name={`${selectedApp.worker?.first_name || ''} ${selectedApp.worker?.last_name || ''}`} 
                  src={selectedApp.profiles?.avatar_url || undefined}
                  size="lg" 
                />
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {selectedApp.worker?.first_name || 'Unknown'} {selectedApp.worker?.last_name || ''}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {selectedApp.worker?.worker_status || 'Standard'} Worker
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500">Shift</p>
                  <p className="font-medium">{selectedApp.shift?.title || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Date</p>
                  <p className="font-medium">
                    {selectedApp.shift?.shift_date 
                      ? format(new Date(selectedApp.shift.shift_date + 'T00:00:00'), 'MMM d, yyyy')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Pay Rate</p>
                  <p className="font-medium">{formatCurrency(selectedApp.shift?.pay_rate || 0)}/hr</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Status</p>
                  <Badge variant={statusVariant[selectedApp.status]}>
                    {selectedApp.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Reliability Score</p>
                  <p className={`font-medium ${
                    (selectedApp.worker?.reliability_score || 0) >= 80 ? 'text-green-600' :
                    (selectedApp.worker?.reliability_score || 0) >= 60 ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    {selectedApp.worker?.reliability_score || 0}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Shifts Completed</p>
                  <p className="font-medium">{selectedApp.worker?.total_shifts_completed || 0}</p>
                </div>
              </div>

              {selectedApp.status === 'applied' && (
                <div className="flex gap-2 pt-4 border-t border-neutral-200">
                  <Button onClick={() => handleConfirm(selectedApp.id)}>
                    Confirm Worker
                  </Button>
                  <Button variant="danger" onClick={() => handleReject(selectedApp.id)}>
                    Reject
                  </Button>
                </div>
              )}
              
              {/* Message button for all statuses */}
              {selectedApp.worker && (
                <div className="pt-3 border-t border-neutral-200 mt-3">
                  <Button 
                    variant="secondary" 
                    onClick={() => handleMessage(
                      selectedApp.worker!.user_id,
                      `${selectedApp.worker!.first_name} ${selectedApp.worker!.last_name}`,
                      selectedApp.shift_id
                    )}
                    className="w-full"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Message Worker
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
