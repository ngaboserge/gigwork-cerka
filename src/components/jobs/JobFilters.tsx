import { Input, Select } from '@/components/ui';
import { JOB_CATEGORIES } from '@/types';

interface JobFiltersProps {
  filters: {
    search: string;
    category: string;
    location: string;
    jobType: string;
    minPay: string;
  };
  onChange: (filters: JobFiltersProps['filters']) => void;
}

export function JobFilters({ filters, onChange }: JobFiltersProps) {
  const handleChange = (key: keyof typeof filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...JOB_CATEGORIES.map((cat) => ({ value: cat.id, label: cat.name })),
  ];

  const jobTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'fixed', label: 'Fixed Price' },
  ];

  return (
    <div className="bg-white border border-neutral-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <Input
            placeholder="Search jobs by title or keyword..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </div>
        <Select
          options={categoryOptions}
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
        />
        <Input
          placeholder="Location"
          value={filters.location}
          onChange={(e) => handleChange('location', e.target.value)}
        />
        <Select
          options={jobTypeOptions}
          value={filters.jobType}
          onChange={(e) => handleChange('jobType', e.target.value)}
        />
      </div>
    </div>
  );
}
