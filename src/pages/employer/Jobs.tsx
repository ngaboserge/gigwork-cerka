import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Button, Badge, Card } from '@/components/ui';
import { useJobStore, useAuthStore } from '@/store';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import type { Job, JobStatus } from '@/types';

export function EmployerJobs() {
  const { user } = useAuthStore();
  const { jobs, fetchJobs, deleteJob } = useJobStore();
  const [filter, setFilter] = useState<JobStatus | 'all'>('all');

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const myJobs = jobs.filter((j) => j.employerId === user?.id || j.employerId === 'emp_1');
  const filteredJobs = filter === 'all' ? myJobs : myJobs.filter((j) => j.status === filter);

  const statusVariant: Record<string, 'success' | 'info' | 'neutral' | 'error' | 'warning'> = {
    open: 'success',
    paused: 'warning',
    in_progress: 'info',
    completed: 'neutral',
    cancelled: 'error',
    draft: 'warning',
  };

  const handleDelete = async (job: Job) => {
    if (window.confirm(`Delete "${job.title}"?`)) {
      await deleteJob(job.id);
    }
  };

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-neutral-900">My Jobs</h1>
                <p className="text-sm text-neutral-600 mt-1">{myJobs.length} total jobs</p>
              </div>
              <Link to="/employer/jobs/new">
                <Button>Post New Job</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(['all', 'open', 'in_progress', 'completed', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === status
                    ? 'bg-primary-800 text-white'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {status === 'all' ? 'All Jobs' : status.replace('_', ' ')}
              </button>
            ))}
          </div>

          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="table-header">Job Title</th>
                    <th className="table-header">Category</th>
                    <th className="table-header">Pay</th>
                    <th className="table-header">Start Date</th>
                    <th className="table-header">Applications</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-neutral-50">
                      <td className="table-cell">
                        <Link to={`/employer/jobs/${job.id}`} className="font-medium text-neutral-900 hover:text-primary-700">
                          {job.title}
                        </Link>
                        <p className="text-xs text-neutral-500">{job.location}</p>
                      </td>
                      <td className="table-cell">{job.category}</td>
                      <td className="table-cell font-medium">
                        {formatCurrency(job.payRate)}/{job.jobType === 'hourly' ? 'hr' : job.jobType === 'daily' ? 'day' : 'fixed'}
                      </td>
                      <td className="table-cell">{format(new Date(job.startDate), 'MMM d, yyyy')}</td>
                      <td className="table-cell">{job.applicationsCount}</td>
                      <td className="table-cell">
                        <Badge variant={statusVariant[job.status]}>{job.status.replace('_', ' ')}</Badge>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Link to={`/employer/jobs/${job.id}/edit`} className="text-sm text-primary-700 hover:text-primary-800">
                            Edit
                          </Link>
                          <button onClick={() => handleDelete(job)} className="text-sm text-red-600 hover:text-red-700">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredJobs.length === 0 && (
                <p className="py-12 text-center text-neutral-500">No jobs found</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
