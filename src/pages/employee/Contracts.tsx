import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Card, Button, Badge, Modal, Tabs, TabsList, TabsTrigger, TabsContent, EmptyState, Avatar } from '@/components/ui';
import { useAuthStore, useContractsStore } from '@/store';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import type { Contract } from '@/types';

// Mock employer/job data for display (would come from joined data in real app)
const employers: Record<string, { name: string; logo?: string }> = {
  emp_1: { name: 'ACME Corporation' },
  emp_3: { name: 'EventsPro Staffing' },
};

const jobs: Record<string, string> = {
  job_1: 'Warehouse Associate - Night Shift',
  job_4: 'Event Setup Crew - Corporate Gala',
  job_prev: 'Warehouse Associate',
};

export function Contracts() {
  const { user } = useAuthStore();
  const { contracts, loading, fetchEmployeeContracts, signContract } = useContractsStore();
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchEmployeeContracts(user.id);
    }
  }, [user?.id, fetchEmployeeContracts]);

  const pending = contracts.filter(c => c.status === 'pending_employee');
  const active = contracts.filter(c => c.status === 'active');
  const completed = contracts.filter(c => ['completed', 'terminated'].includes(c.status));

  const statusConfig: Record<string, { variant: 'warning' | 'success' | 'neutral' | 'error' | 'info'; label: string }> = {
    pending_employee: { variant: 'warning', label: 'Awaiting Your Signature' },
    pending_employer: { variant: 'info', label: 'Awaiting Employer' },
    active: { variant: 'success', label: 'Active' },
    completed: { variant: 'neutral', label: 'Completed' },
    terminated: { variant: 'error', label: 'Terminated' },
    disputed: { variant: 'error', label: 'Disputed' },
    draft: { variant: 'neutral', label: 'Draft' },
  };

  const handleSign = async () => {
    if (!selectedContract || !user?.id) return;
    setSigning(true);
    try {
      await signContract(selectedContract.id, user.id);
      setSelectedContract(null);
    } catch (error) {
      console.error('Error signing contract:', error);
    } finally {
      setSigning(false);
    }
  };

  const ContractCard = ({ contract }: { contract: Contract }) => {
    const employer = employers[contract.employerId];
    const jobTitle = jobs[contract.jobId] || 'Contract';
    const status = statusConfig[contract.status] || { variant: 'neutral', label: contract.status };
    
    return (
      <div onClick={() => setSelectedContract(contract)} className="cursor-pointer">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <Avatar name={employer?.name || ''} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-neutral-900">{jobTitle}</h3>
                  <p className="text-sm text-neutral-600">{employer?.name}</p>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatCurrency(contract.payRate)}/{contract.payType === 'hourly' ? 'hr' : contract.payType === 'daily' ? 'day' : 'fixed'}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {format(new Date(contract.startDate), 'MMM d, yyyy')}
                  {contract.endDate && ` - ${format(new Date(contract.endDate), 'MMM d, yyyy')}`}
                </span>
              </div>
            </div>
            <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          {contract.status === 'pending_employee' && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 flex items-center gap-2 text-sm text-amber-800">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Action required: Review and sign this contract to begin work</span>
            </div>
          )}
        </Card>
      </div>
    );
  };

  return (
    <Layout>
      <div className="bg-neutral-50 dark:bg-neutral-900 min-h-screen">
        <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Contracts</h1>
                <p className="text-sm text-neutral-500 mt-1">Manage your work agreements</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded">{pending.length} pending</span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded">{active.length} active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {pending.length > 0 && (
            <Card className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                    {pending.length} contract{pending.length > 1 ? 's' : ''} awaiting your signature
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">Review and sign to start working</p>
                </div>
              </div>
            </Card>
          )}

          <Tabs defaultValue={pending.length > 0 ? 'pending' : 'active'}>
            <TabsList className="mb-6">
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
              <TabsTrigger value="completed">History ({completed.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {loading ? (
                <Card><p className="text-center py-8 text-neutral-500">Loading contracts...</p></Card>
              ) : pending.length > 0 ? (
                <div className="space-y-4">{pending.map(c => <ContractCard key={c.id} contract={c} />)}</div>
              ) : (
                <EmptyState
                  icon={<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  title="All caught up!"
                  description="No contracts waiting for your signature."
                />
              )}
            </TabsContent>

            <TabsContent value="active">
              {active.length > 0 ? (
                <div className="space-y-4">{active.map(c => <ContractCard key={c.id} contract={c} />)}</div>
              ) : (
                <EmptyState
                  icon={<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                  title="No active contracts"
                  description="Your active work agreements will appear here."
                />
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completed.length > 0 ? (
                <div className="space-y-4">{completed.map(c => <ContractCard key={c.id} contract={c} />)}</div>
              ) : (
                <EmptyState
                  icon={<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
                  title="No contract history"
                  description="Your completed contracts will appear here."
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Contract Detail Modal */}
      <Modal isOpen={!!selectedContract} onClose={() => setSelectedContract(null)} title="Contract Details" size="lg">
        {selectedContract && (
          <div className="space-y-6">
            <div className="flex items-start gap-4 pb-4 border-b border-neutral-200">
              <Avatar name={employers[selectedContract.employerId]?.name || ''} size="lg" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900">{jobs[selectedContract.jobId]}</h3>
                <p className="text-neutral-600">{employers[selectedContract.employerId]?.name}</p>
                <Badge variant={statusConfig[selectedContract.status]?.variant || 'neutral'} className="mt-2">
                  {statusConfig[selectedContract.status]?.label || selectedContract.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 border border-neutral-200">
                <p className="text-xs text-neutral-500 uppercase tracking-wide">Compensation</p>
                <p className="text-xl font-bold text-neutral-900 mt-1">
                  {formatCurrency(selectedContract.payRate)}
                  <span className="text-sm font-normal text-neutral-500">
                    /{selectedContract.payType === 'hourly' ? 'hour' : selectedContract.payType === 'daily' ? 'day' : 'fixed'}
                  </span>
                </p>
              </div>
              <div className="p-4 bg-neutral-50 border border-neutral-200">
                <p className="text-xs text-neutral-500 uppercase tracking-wide">Duration</p>
                <p className="text-sm font-medium text-neutral-900 mt-1">
                  {format(new Date(selectedContract.startDate), 'MMM d, yyyy')}
                  {selectedContract.endDate && <><br />to {format(new Date(selectedContract.endDate), 'MMM d, yyyy')}</>}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-neutral-900 mb-2">Contract Terms</h4>
              <div className="bg-neutral-50 border border-neutral-200 p-4 max-h-48 overflow-y-auto">
                <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-sans">{selectedContract.terms}</pre>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-neutral-200">
                <p className="text-xs text-neutral-500">Employer Signature</p>
                <div className="flex items-center gap-2 mt-1">
                  {selectedContract.employerSignedAt ? (
                    <>
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-neutral-700">Signed {format(new Date(selectedContract.employerSignedAt), 'MMM d, yyyy')}</span>
                    </>
                  ) : (
                    <span className="text-sm text-neutral-400">Not signed</span>
                  )}
                </div>
              </div>
              <div className="p-3 border border-neutral-200">
                <p className="text-xs text-neutral-500">Your Signature</p>
                <div className="flex items-center gap-2 mt-1">
                  {selectedContract.employeeSignedAt ? (
                    <>
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-neutral-700">Signed {format(new Date(selectedContract.employeeSignedAt), 'MMM d, yyyy')}</span>
                    </>
                  ) : (
                    <span className="text-sm text-amber-600">Awaiting signature</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
              <Button variant="secondary" onClick={() => setSelectedContract(null)}>Close</Button>
              {selectedContract.status === 'pending_employee' && (
                <Button onClick={handleSign} loading={signing}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Sign Contract
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
