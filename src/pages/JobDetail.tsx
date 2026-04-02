import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Button, Badge, Card, Modal, Input } from '@/components/ui';
import { useJobStore, useApplicationStore, useAuthStore } from '@/store';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { jobs, fetchJobs } = useJobStore();
  const { applications, applyToJob, fetchApplications } = useApplicationStore();
  const [applyModal, setApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, [fetchJobs, fetchApplications]);

  const job = jobs.find((j) => j.id === id);
  const hasApplied = applications.some((a) => a.jobId === id && (a.employeeId === user?.id || a.employeeId === 'worker_1'));
  const isEmployer = user?.role === 'employer';

  const handleApply = async () => {
    if (!job) return;
    setLoading(true);
    try {
      await applyToJob(job.id, { coverLetter, proposedRate: proposedRate ? Number(proposedRate) : undefined });
      setApplyModal(false);
      setCoverLetter('');
      setProposedRate('');
    } finally {
      setLoading(false);
    }
  };

  if (!job) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-neutral-500">Job not found</p>
          <Link to={isEmployer ? '/employer/jobs' : '/employee/jobs'} className="text-primary-700 hover:text-primary-800 mt-2 inline-block">
            Back to jobs
          </Link>
        </div>
      </Layout>
    );
  }

  const statusVariant: Record<string, 'success' | 'info' | 'neutral' | 'error' | 'warning'> = { open: 'success', paused: 'warning', in_progress: 'info', completed: 'neutral', cancelled: 'error', draft: 'warning' };

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link to={isEmployer ? '/employer/jobs' : '/employee/jobs'} className="text-sm text-primary-700 hover:text-primary-800 mb-4 inline-block">
              Back to jobs
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-xl font-bold text-neutral-900">{job.title}</h1>
                  <Badge variant={statusVariant[job.status]}>{job.status.replace('_', ' ')}</Badge>
                </div>
                <p className="text-neutral-600">{job.employerName}</p>
              </div>
              {!isEmployer && job.status === 'open' && !hasApplied && (
                <Button onClick={() => setApplyModal(true)}>Apply Now</Button>
              )}
              {hasApplied && <Badge variant="info">Applied</Badge>}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <h2 className="font-semibold text-neutral-900 mb-3">Description</h2>
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">{job.description}</p>
              </Card>

              <Card>
                <h2 className="font-semibold text-neutral-900 mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill) => (
                    <span key={skill} className="px-3 py-1 text-sm bg-neutral-100 text-neutral-700 border border-neutral-200">{skill}</span>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <h2 className="font-semibold text-neutral-900 mb-3">Job Details</h2>
                <dl className="space-y-3 text-sm">
                  <div><dt className="text-neutral-500">Pay</dt><dd className="font-medium text-neutral-900">{formatCurrency(job.payRate)}/{job.jobType === 'hourly' ? 'hr' : job.jobType === 'daily' ? 'day' : 'fixed'}</dd></div>
                  <div><dt className="text-neutral-500">Location</dt><dd className="font-medium text-neutral-900">{job.location}</dd></div>
                  <div><dt className="text-neutral-500">Category</dt><dd className="font-medium text-neutral-900">{job.category}</dd></div>
                  <div><dt className="text-neutral-500">Start Date</dt><dd className="font-medium text-neutral-900">{format(new Date(job.startDate), 'MMMM d, yyyy')}</dd></div>
                  {job.endDate && <div><dt className="text-neutral-500">End Date</dt><dd className="font-medium text-neutral-900">{format(new Date(job.endDate), 'MMMM d, yyyy')}</dd></div>}
                  {job.estimatedHours && <div><dt className="text-neutral-500">Est. Hours</dt><dd className="font-medium text-neutral-900">{job.estimatedHours} hours</dd></div>}
                  <div><dt className="text-neutral-500">Applications</dt><dd className="font-medium text-neutral-900">{job.applicationsCount}</dd></div>
                </dl>
              </Card>
            </div>
          </div>
        </div>

        <Modal isOpen={applyModal} onClose={() => setApplyModal(false)} title="Apply for Job" size="lg">
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-neutral-700 mb-1">Cover Letter</label><textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Introduce yourself..." rows={4} className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" /></div>
            {job.jobType === 'hourly' && <Input label="Proposed Hourly Rate (RWF)" type="number" value={proposedRate} onChange={(e) => setProposedRate(e.target.value)} placeholder={String(job.payRate)} />}
            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200"><Button variant="secondary" onClick={() => setApplyModal(false)}>Cancel</Button><Button onClick={handleApply} loading={loading}>Submit</Button></div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
