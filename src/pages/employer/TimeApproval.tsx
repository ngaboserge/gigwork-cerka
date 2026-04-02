import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Card, CardHeader, Button, Badge, Modal, Tabs, TabsList, TabsTrigger, TabsContent, Skeleton, Avatar } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import type { Deployment, PaymentStatus } from '@/lib/database.types';

interface TimeEntryWithDetails extends Deployment {
  worker: {
    user_id: string;
    first_name: string;
    last_name: string;
    reliability_score: number;
  };
  profiles?: {
    avatar_url?: string;
  };
  shift: {
    id: string;
    title: string;
    shift_date: string;
    pay_rate: number;
  };
}

export function TimeApproval() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<TimeEntryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntryWithDetails | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [adjustedMinutes, setAdjustedMinutes] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadTimeEntries();
  }, [user]);

  const loadTimeEntries = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('deployments')
        .select(`
          *,
          worker:worker_profiles(user_id, first_name, last_name, reliability_score),
          profiles!deployments_worker_id_fkey(avatar_url),
          shift:shifts!inner(id, title, shift_date, pay_rate, employer_id)
        `)
        .eq('shift.employer_id', user.id)
        .in('status', ['completed', 'checked_in', 'in_progress'])
        .not('check_in_at', 'is', null)
        .order('check_in_at', { ascending: false });

      if (error) throw error;
      
      // Handle nested array responses from Supabase
      const mappedData = (data || []).map(d => {
        const profiles = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
        const worker = Array.isArray(d.worker) ? d.worker[0] : d.worker;
        const shift = Array.isArray(d.shift) ? d.shift[0] : d.shift;
        
        return {
          ...d,
          worker: worker,
          profiles: profiles,
          shift: shift
        };
      });
      
      setEntries(mappedData as TimeEntryWithDetails[]);
    } catch (error) {
      console.error('Error loading time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingEntries = entries.filter(e => e.status === 'completed' && e.payment_status === 'pending');
  const approvedEntries = entries.filter(e => e.payment_status === 'approved' || e.payment_status === 'processing' || e.payment_status === 'paid');
  const disputedEntries = entries.filter(e => e.payment_status === 'disputed' || e.flagged);

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '-';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const handleApprove = async (entryId: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('deployments')
        .update({ payment_status: 'approved' })
        .eq('id', entryId);

      if (error) throw error;
      await loadTimeEntries();
    } catch (error) {
      console.error('Error approving entry:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveAll = async () => {
    setProcessing(true);
    try {
      const ids = pendingEntries.map(e => e.id);
      const { error } = await supabase
        .from('deployments')
        .update({ payment_status: 'approved' })
        .in('id', ids);

      if (error) throw error;
      await loadTimeEntries();
    } catch (error) {
      console.error('Error approving all entries:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDispute = async () => {
    if (!selectedEntry || !disputeReason) return;
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('deployments')
        .update({
          payment_status: 'disputed',
          flagged: true,
          flag_reason: disputeReason,
          flagged_by: user?.id,
          flagged_at: new Date().toISOString(),
        })
        .eq('id', selectedEntry.id);

      if (error) throw error;
      
      // Notify worker
      await supabase.from('notifications').insert({
        user_id: selectedEntry.worker_id,
        type: 'time_disputed',
        title: 'Time Entry Disputed',
        message: `Your time entry for ${selectedEntry.shift.title} has been disputed. Reason: ${disputeReason}`,
        priority: 'high',
      });

      setShowDisputeModal(false);
      setDisputeReason('');
      setSelectedEntry(null);
      await loadTimeEntries();
    } catch (error) {
      console.error('Error disputing entry:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleAdjust = async () => {
    if (!selectedEntry || !adjustedMinutes || !adjustmentReason) return;
    setProcessing(true);
    try {
      const newMinutes = parseInt(adjustedMinutes);
      const newHours = newMinutes / 60;
      const newPay = newHours * selectedEntry.shift.pay_rate;

      const { error } = await supabase
        .from('deployments')
        .update({
          total_minutes: newMinutes,
          total_hours: newHours,
          total_pay: newPay,
          flagged: true,
          flag_reason: `Time adjusted: ${adjustmentReason}`,
          flagged_by: user?.id,
          flagged_at: new Date().toISOString(),
        })
        .eq('id', selectedEntry.id);

      if (error) throw error;

      // Notify worker
      await supabase.from('notifications').insert({
        user_id: selectedEntry.worker_id,
        type: 'time_adjusted',
        title: 'Time Entry Adjusted',
        message: `Your time entry for ${selectedEntry.shift.title} has been adjusted to ${formatDuration(newMinutes)}. Reason: ${adjustmentReason}`,
        priority: 'normal',
      });

      setShowAdjustModal(false);
      setAdjustedMinutes('');
      setAdjustmentReason('');
      setSelectedEntry(null);
      await loadTimeEntries();
    } catch (error) {
      console.error('Error adjusting entry:', error);
    } finally {
      setProcessing(false);
    }
  };

  const statusVariant: Record<PaymentStatus, 'warning' | 'info' | 'success' | 'error' | 'secondary'> = {
    pending: 'warning',
    approved: 'info',
    processing: 'info',
    paid: 'success',
    disputed: 'error',
  };

  const TimeEntryRow = ({ entry }: { entry: TimeEntryWithDetails }) => (
    <tr className="hover:bg-neutral-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Avatar 
            name={`${entry.worker.first_name} ${entry.worker.last_name}`} 
            src={entry.profiles?.avatar_url || undefined}
            size="sm" 
          />
          <div>
            <p className="text-sm font-medium text-neutral-900">
              {entry.worker.first_name} {entry.worker.last_name}
            </p>
            <p className="text-xs text-neutral-500">{entry.worker.reliability_score}% reliable</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-neutral-600">
        <p className="font-medium">{entry.shift.title}</p>
        <p className="text-xs text-neutral-500">{format(new Date(entry.shift.shift_date + 'T00:00:00'), 'MMM d, yyyy')}</p>
      </td>
      <td className="px-4 py-3 text-sm text-neutral-600">
        {entry.check_in_at ? format(new Date(entry.check_in_at), 'h:mm a') : '-'}
      </td>
      <td className="px-4 py-3 text-sm text-neutral-600">
        {entry.check_out_at ? format(new Date(entry.check_out_at), 'h:mm a') : '-'}
      </td>
      <td className="px-4 py-3 text-sm text-neutral-600">{entry.break_minutes}m</td>
      <td className="px-4 py-3 text-sm font-medium text-neutral-900">
        {formatDuration(entry.total_minutes)}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-emerald-600">
        {formatCurrency(entry.total_pay || 0)}
      </td>
      <td className="px-4 py-3">
        <Badge variant={statusVariant[entry.payment_status]}>{entry.payment_status}</Badge>
        {entry.flagged && <Badge variant="warning" className="ml-1">Flagged</Badge>}
      </td>
      <td className="px-4 py-3">
        {entry.payment_status === 'pending' && (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => handleApprove(entry.id)} disabled={processing}>
              Approve
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => { setSelectedEntry(entry); setShowAdjustModal(true); }}
            >
              Adjust
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => { setSelectedEntry(entry); setShowDisputeModal(true); }}
            >
              Dispute
            </Button>
          </div>
        )}
        {entry.payment_status === 'approved' && (
          <span className="text-xs text-neutral-500">Approved</span>
        )}
        {entry.payment_status === 'paid' && (
          <span className="text-xs text-emerald-600">Paid</span>
        )}
        {entry.payment_status === 'disputed' && (
          <span className="text-xs text-red-600">Under review</span>
        )}
      </td>
    </tr>
  );

  const totalPendingPay = pendingEntries.reduce((sum, e) => sum + (e.total_pay || 0), 0);
  const totalApprovedPay = approvedEntries.reduce((sum, e) => sum + (e.total_pay || 0), 0);

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-neutral-900">Time Approval</h1>
                <p className="text-sm text-neutral-500 mt-1">Review and approve worker time entries</p>
              </div>
              {pendingEntries.length > 0 && (
                <Badge variant="warning">{pendingEntries.length} pending approval</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <p className="text-sm text-neutral-600">Pending Review</p>
              <p className="text-2xl font-bold text-amber-600">{pendingEntries.length}</p>
            </Card>
            <Card>
              <p className="text-sm text-neutral-600">Pending Amount</p>
              <p className="text-2xl font-bold text-neutral-900">{formatCurrency(totalPendingPay)}</p>
            </Card>
            <Card>
              <p className="text-sm text-neutral-600">Approved This Period</p>
              <p className="text-2xl font-bold text-emerald-600">{approvedEntries.length}</p>
            </Card>
            <Card>
              <p className="text-sm text-neutral-600">Approved Amount</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalApprovedPay)}</p>
            </Card>
          </div>

          <Tabs defaultValue="pending">
            <TabsList className="mb-6">
              <TabsTrigger value="pending">
                Pending {pendingEntries.length > 0 && `(${pendingEntries.length})`}
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved {approvedEntries.length > 0 && `(${approvedEntries.length})`}
              </TabsTrigger>
              <TabsTrigger value="disputed">
                Disputed {disputedEntries.length > 0 && `(${disputedEntries.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card padding="none">
                <CardHeader 
                  title="Pending Time Entries" 
                  subtitle="Review and approve worker time submissions"
                  action={
                    pendingEntries.length > 0 && (
                      <Button size="sm" onClick={handleApproveAll} disabled={processing}>
                        Approve All ({formatCurrency(totalPendingPay)})
                      </Button>
                    )
                  }
                />
                <div className="border-t border-neutral-100 overflow-x-auto">
                  {loading ? (
                    <div className="p-4"><Skeleton height={200} /></div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-neutral-50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Worker</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Shift</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Clock In</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Clock Out</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Break</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Total</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Pay</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {pendingEntries.length > 0 ? (
                          pendingEntries.map(entry => <TimeEntryRow key={entry.id} entry={entry} />)
                        ) : (
                          <tr>
                            <td colSpan={9} className="px-4 py-8 text-center text-neutral-500">
                              No pending time entries to review
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="approved">
              <Card padding="none">
                <CardHeader title="Approved Time Entries" subtitle="Previously approved time submissions" />
                <div className="border-t border-neutral-100 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-neutral-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Worker</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Shift</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Clock In</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Clock Out</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Break</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Pay</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {approvedEntries.length > 0 ? (
                        approvedEntries.map(entry => <TimeEntryRow key={entry.id} entry={entry} />)
                      ) : (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-neutral-500">
                            No approved time entries yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="disputed">
              <Card padding="none">
                <CardHeader title="Disputed & Flagged Entries" subtitle="Time entries with issues requiring attention" />
                <div className="border-t border-neutral-100 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-neutral-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Worker</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Shift</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Clock In</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Clock Out</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Break</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Pay</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {disputedEntries.length > 0 ? (
                        disputedEntries.map(entry => <TimeEntryRow key={entry.id} entry={entry} />)
                      ) : (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-neutral-500">
                            No disputed or flagged entries
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Adjust Time Modal */}
      <Modal isOpen={showAdjustModal} onClose={() => setShowAdjustModal(false)} title="Adjust Time Entry">
        {selectedEntry && (
          <div className="space-y-4">
            <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Worker</p>
                  <p className="font-medium">{selectedEntry.worker.first_name} {selectedEntry.worker.last_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-600">Original Time</p>
                  <p className="text-lg font-semibold">{formatDuration(selectedEntry.total_minutes)}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Adjusted Time (minutes)
              </label>
              <input
                type="number"
                value={adjustedMinutes}
                onChange={(e) => setAdjustedMinutes(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter total minutes"
              />
              {adjustedMinutes && (
                <p className="text-sm text-neutral-500 mt-1">
                  = {formatDuration(parseInt(adjustedMinutes))} ({formatCurrency((parseInt(adjustedMinutes) / 60) * selectedEntry.shift.pay_rate)})
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Reason for Adjustment
              </label>
              <textarea
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-24 resize-none"
                placeholder="Explain why this time entry is being adjusted..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowAdjustModal(false)}>Cancel</Button>
              <Button onClick={handleAdjust} disabled={!adjustedMinutes || !adjustmentReason || processing}>
                Save Adjustment
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Dispute Modal */}
      <Modal isOpen={showDisputeModal} onClose={() => setShowDisputeModal(false)} title="Dispute Time Entry">
        {selectedEntry && (
          <div className="space-y-4">
            <div className="bg-amber-50 p-4 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                Disputing a time entry will notify the worker and require resolution before payment can be processed.
              </p>
            </div>
            <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Worker</p>
                  <p className="font-medium">{selectedEntry.worker.first_name} {selectedEntry.worker.last_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-600">Claimed Time</p>
                  <p className="font-semibold">{formatDuration(selectedEntry.total_minutes)}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Reason for Dispute
              </label>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-24 resize-none"
                placeholder="Explain the issue with this time entry..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowDisputeModal(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDispute} disabled={!disputeReason || processing}>
                Submit Dispute
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
