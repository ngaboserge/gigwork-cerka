import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Button, Input, Select, Card } from '@/components/ui';
import { useJobStore, useAuthStore } from '@/store';
import { JOB_CATEGORIES } from '@/types';

import type { JobType } from '@/types';

export function CreateJob() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createJob } = useJobStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    isRemote: false,
    jobType: 'hourly' as JobType,
    payRate: '',
    estimatedHours: '',
    startDate: '',
    endDate: '',
    requiredSkills: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createJob({
        title: formData.title,
        description: formData.description,
        responsibilities: [],
        requirements: [],
        benefits: [],
        category: formData.category,
        location: formData.location,
        isRemote: formData.isRemote,
        jobType: formData.jobType,
        payRate: Number(formData.payRate),
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        requiredSkills: formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        preferredSkills: [],
        experienceLevel: 'entry',
        status: 'open',
        urgency: 'normal',
        recurrence: 'none',
        tags: [],
        equipmentProvided: [],
        equipmentRequired: [],
        employerId: user?.id || 'emp_1',
        employerName: (user as any)?.companyName || user?.name || 'Company',
        employerRating: 4.5,
        employerVerified: true,
      });
      navigate('/employer/jobs');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = JOB_CATEGORIES.map((cat) => ({ value: cat.id, label: cat.name }));
  const jobTypeOptions = [
    { value: 'hourly', label: 'Hourly Rate' },
    { value: 'daily', label: 'Daily Rate' },
    { value: 'fixed', label: 'Fixed Price' },
  ];

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-xl font-bold text-neutral-900">Post a New Job</h1>
            <p className="text-sm text-neutral-600 mt-1">Fill in the details to create a job listing</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Job Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Warehouse Associate - Night Shift"
                required
              />

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the job responsibilities, requirements, and any other relevant details..."
                  rows={5}
                  className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select label="Category" options={categoryOptions} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Select category" required />
                <Input label="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Chicago, IL" required />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Select label="Pay Type" options={jobTypeOptions} value={formData.jobType} onChange={(e) => setFormData({ ...formData, jobType: e.target.value as JobType })} />
                <Input label="Pay Rate (RWF)" type="number" value={formData.payRate} onChange={(e) => setFormData({ ...formData, payRate: e.target.value })} placeholder="0" required />
                <Input label="Est. Hours" type="number" value={formData.estimatedHours} onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })} placeholder="Optional" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Date" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
                <Input label="End Date" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} hint="Optional" />
              </div>

              <Input label="Required Skills" value={formData.requiredSkills} onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })} placeholder="e.g., Forklift Operation, Heavy Lifting" hint="Separate skills with commas" />

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isRemote" checked={formData.isRemote} onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })} className="w-4 h-4 border-neutral-300" />
                <label htmlFor="isRemote" className="text-sm text-neutral-700">This is a remote position</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <Button type="button" variant="secondary" onClick={() => navigate('/employer/jobs')}>Cancel</Button>
                <Button type="submit" loading={loading}>Post Job</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
