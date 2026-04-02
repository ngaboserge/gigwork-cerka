import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, Button, Badge, Modal } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { shiftsService } from '@/services/shifts.service';
import { formatCurrency } from '@/lib/currency';
import type { Shift, ShiftStatus } from '@/lib/database.types';

export function ShiftManagement() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | ShiftStatus>('all');
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Shift | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const loadShifts = async () => {
      if (!user?.id) return;
      
      try {
        const data = await shiftsService.getEmployerShifts(user.id, filter === 'all' ? undefined : filter);
        setShifts(data);
      } catch (error) {
        console.error('Error loading shifts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadShifts();
    
    // Refresh shifts every 5 seconds to show updated slot counts
    const interval = setInterval(loadShifts, 5000);
    
    return () => clearInterval(interval);
  }, [user, filter]);

  const filteredShifts = filter === 'all' 
    ? shifts 
    : shifts.filter(s => s.status === filter);

  const stats = {
    total: shifts.length,
    open: shifts.filter(s => s.status === 'open').length,
    filled: shifts.filter(s => s.status === 'filled').length,
    pendingApplicants: shifts.reduce((sum, s) => sum + Math.max(0, s.slots_applied - s.slots_confirmed - s.slots_standby), 0),
  };

  const formatDate = (date: string) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status: ShiftStatus) => {
    switch (status) {
      case 'draft': return <Badge variant="secondary">Draft</Badge>;
      case 'open': return <Badge variant="primary">Open</Badge>;
      case 'filled': return <Badge variant="success">Filled</Badge>;
      case 'in_progress': return <Badge variant="warning">In Progress</Badge>;
      case 'completed': return <Badge variant="secondary">Completed</Badge>;
      case 'cancelled': return <Badge variant="error">Cancelled</Badge>;
    }
  };

  const getUrgencyIndicator = (urgency: string) => {
    if (urgency === 'critical') return <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />;
    if (urgency === 'urgent') return <span className="w-2 h-2 bg-amber-500 rounded-full" />;
    return null;
  };

  const handleDelete = async (shift: Shift) => {
    if (shift.slots_confirmed > 0) {
      alert('Cannot delete a shift with confirmed workers. Please cancel the shift instead.');
      return;
    }
    setDeleteConfirm(shift);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    setDeleting(true);
    try {
      await shiftsService.deleteShift(deleteConfirm.id);
      setShifts(shifts.filter(s => s.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      setOpenMenuId(null);
    } catch (error: any) {
      console.error('Error deleting shift:', error);
      alert(error.message || 'Failed to delete shift');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = async (shift: Shift) => {
    if (!confirm(`Are you sure you want to cancel "${shift.title}"? All confirmed workers will be notified.`)) {
      return;
    }

    try {
      await shiftsService.cancelShift(shift.id);
      setShifts(shifts.map(s => s.id === shift.id ? { ...s, status: 'cancelled' as ShiftStatus } : s));
      setOpenMenuId(null);
    } catch (error: any) {
      console.error('Error cancelling shift:', error);
      alert(error.message || 'Failed to cancel shift');
    }
  };

  const handleEdit = (shiftId: string) => {
    navigate(`/employer/shifts/${shiftId}/edit`);
  };

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Shift Management</h1>
                <p className="text-neutral-600 mt-1">Manage your workforce deployments</p>
              </div>
              <Link to="/employer/shifts/new">
                <Button>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Post New Shift
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="text-center">
              <p className="text-3xl font-bold text-neutral-900">{stats.total}</p>
              <p className="text-sm text-neutral-600">Total Shifts</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-primary-600">{stats.open}</p>
              <p className="text-sm text-neutral-600">Open</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.filled}</p>
              <p className="text-sm text-neutral-600">Filled</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-amber-600">{stats.pendingApplicants}</p>
              <p className="text-sm text-neutral-600">Pending Review</p>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {(['all', 'open', 'filled', 'in_progress', 'completed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  filter === status
                    ? 'bg-primary-100 text-primary-700 border border-primary-300'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {status === 'all' ? 'All Shifts' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>

          {/* Shifts List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-neutral-600 mt-2">Loading shifts...</p>
              </div>
            ) : filteredShifts.map(shift => {
              const pendingApplicants = Math.max(0, shift.slots_applied - shift.slots_confirmed - shift.slots_standby);
              const fillPercentage = Math.round((shift.slots_confirmed / shift.slots_needed) * 100);
              
              return (
                <Card key={shift.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getUrgencyIndicator(shift.urgency)}
                        <h3 className="font-semibold text-neutral-900">{shift.title}</h3>
                        {getStatusBadge(shift.status)}
                      </div>
                      <p className="text-sm text-neutral-600">
                        {shift.location_name} • {shift.city}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(shift.shift_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                        </span>
                        <span className="font-medium text-primary-600">{formatCurrency(shift.pay_rate)}/hr</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        {/* Slots Progress */}
                        <div className="text-right">
                          <p className="text-sm text-neutral-600">
                            <span className="font-semibold text-neutral-900">{shift.slots_confirmed}</span>
                            /{shift.slots_needed} confirmed
                          </p>
                          <div className="w-32 h-2 bg-neutral-200 rounded-full mt-1">
                            <div 
                              className={`h-full rounded-full ${fillPercentage >= 100 ? 'bg-green-500' : 'bg-primary-500'}`}
                              style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                            />
                          </div>
                          {shift.slots_standby > 0 && (
                            <p className="text-xs text-amber-600 mt-1">+{shift.slots_standby} standby</p>
                          )}
                        </div>

                        {/* Pending Badge */}
                        {pendingApplicants > 0 && shift.status === 'open' && (
                          <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                            {pendingApplicants} pending
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => setSelectedShift(shift)}
                          >
                            View
                          </Button>
                          {shift.status === 'open' && pendingApplicants > 0 && (
                            <Link to={`/employer/shifts/${shift.id}`}>
                              <Button size="sm">
                                Review
                              </Button>
                            </Link>
                          )}
                          
                          {/* Dropdown Menu */}
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === shift.id ? null : shift.id)}
                              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
                            
                            {openMenuId === shift.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={() => setOpenMenuId(null)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-20">
                                  {shift.status === 'draft' && (
                                    <button
                                      onClick={() => handleEdit(shift.id)}
                                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      Edit Shift
                                    </button>
                                  )}
                                  
                                  <Link to={`/employer/shifts/${shift.id}`}>
                                    <button className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                      </svg>
                                      Manage Workers
                                    </button>
                                  </Link>
                                  
                                  {(shift.status === 'open' || shift.status === 'filled') && (
                                    <button
                                      onClick={() => handleCancel(shift)}
                                      className="w-full px-4 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                      Cancel Shift
                                    </button>
                                  )}
                                  
                                  {(shift.status === 'draft' || (shift.status === 'open' && shift.slots_confirmed === 0)) && (
                                    <>
                                      <div className="border-t border-neutral-200 my-1" />
                                      <button
                                        onClick={() => handleDelete(shift)}
                                        className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete Shift
                                      </button>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {filteredShifts.length === 0 && (
              <Card className="text-center py-12">
                <svg className="w-12 h-12 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-neutral-600">No shifts found</p>
                <Link to="/employer/shifts/new">
                  <Button className="mt-4">Post Your First Shift</Button>
                </Link>
              </Card>
            )}
          </div>
        </div>

        {/* Quick View Modal */}
        <Modal
          isOpen={!!selectedShift}
          onClose={() => setSelectedShift(null)}
          title={selectedShift?.title || ''}
          size="lg"
        >
          {selectedShift && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-500">Location</p>
                  <p className="font-medium">{selectedShift.location_name}</p>
                  <p className="text-sm text-neutral-600">{selectedShift.city}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Date & Time</p>
                  <p className="font-medium">{formatDate(selectedShift.shift_date)}</p>
                  <p className="text-sm text-neutral-600">
                    {formatTime(selectedShift.start_time)} - {formatTime(selectedShift.end_time)}
                  </p>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <h4 className="font-medium text-neutral-900 mb-3">Worker Status</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{selectedShift.slots_confirmed}</p>
                    <p className="text-sm text-green-700">Confirmed</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">{selectedShift.slots_standby}</p>
                    <p className="text-sm text-amber-700">Standby</p>
                  </div>
                  <div className="p-3 bg-neutral-100 rounded-lg">
                    <p className="text-2xl font-bold text-neutral-600">
                      {selectedShift.slots_applied - selectedShift.slots_confirmed - selectedShift.slots_standby}
                    </p>
                    <p className="text-sm text-neutral-600">Pending</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <Button variant="secondary" className="flex-1" onClick={() => setSelectedShift(null)}>
                  Close
                </Button>
                <Link to={`/employer/shifts/${selectedShift.id}`} className="flex-1">
                  <Button className="w-full">
                    Manage Applicants
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => !deleting && setDeleteConfirm(null)}
          title="Delete Shift"
          size="sm"
        >
          {deleteConfirm && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-neutral-900 font-medium">Are you sure you want to delete this shift?</p>
                  <p className="text-sm text-neutral-600 mt-1">
                    <span className="font-medium">{deleteConfirm.title}</span> on {formatDate(deleteConfirm.shift_date)}
                  </p>
                  <p className="text-sm text-red-600 mt-2">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <Button 
                  variant="secondary" 
                  className="flex-1" 
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700" 
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Shift'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
