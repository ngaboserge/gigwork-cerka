import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Button, Badge, Card } from '@/components/ui';
import { useApplicationStore, useAuthStore } from '@/store';
import { format } from 'date-fns';
import type { ApplicationStatus } from '@/types';

export function EmployeeApplications() {
  const { user } = useAuthStore();
  const { applications, fetchApplications, withdrawApplication } = useApplicationStore();
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const myApplications = applications.filter((a) => a.employeeId === user?.id || a.employeeId === 'worker_1');
  const filteredApps = filter === 'all' ? myApplications : myApplications.filter((a) => a.status === filter);

  const statusVariant: Record<string, 'success' | 'info' | 'neutral' | 'error' | 'warning'> = {
    pending: 'warning',
    viewed: 'info',
    shortlisted: 'info',
    interview_scheduled: 'info',
    accepted: 'success',
    rejected: 'error',
    withdrawn: 'neutral',
    hired: 'success',
    completed: 'neutral',
  };

  const handleWithdraw = async (id: string) => {
    if (window.confirm('Withdraw this application?')) {
      await withdrawApplication(id);
    }
  };

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-xl font-bold text-neutral-900">My Applications</h1>
            <p className="text-sm text-neutral-600 mt-1">{myApplications.length} total applications</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(['all', 'pending', 'viewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === status ? 'bg-primary-800 text-white' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredApps.map((app) => (
              <Card key={app.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-neutral-900">{app.jobTitle}</h3>
                      <Badge variant={statusVariant[app.status]}>{app.status}</Badge>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">Applied on {format(new Date(app.createdAt), 'MMMM d, yyyy')}</p>
                    {app.proposedRate && <p className="text-sm text-neutral-600">Proposed rate: ${app.proposedRate}/hr</p>}
                    {app.coverLetter && (
                      <div className="mt-3 p-3 bg-neutral-50 border border-neutral-200">
                        <p className="text-xs text-neutral-500 mb-1">Your cover letter:</p>
                        <p className="text-sm text-neutral-700">{app.coverLetter}</p>
                      </div>
                    )}
                  </div>
                  {app.status === 'pending' && (
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleWithdraw(app.id)}>
                      Withdraw
                    </Button>
                  )}
                </div>
              </Card>
            ))}

            {filteredApps.length === 0 && (
              <Card className="text-center py-8">
                <p className="text-neutral-500">No applications found</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
