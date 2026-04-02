import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { Job } from '@/types';
import { Badge, Card } from '@/components/ui';

interface JobCardProps {
  job: Job;
  linkTo?: string;
  showActions?: boolean;
  onApply?: () => void;
}

export function JobCard({ job, linkTo, showActions = false, onApply }: JobCardProps) {
  const statusVariant: Record<string, 'success' | 'info' | 'neutral' | 'error' | 'warning'> = {
    open: 'success',
    paused: 'warning',
    in_progress: 'info',
    completed: 'neutral',
    cancelled: 'error',
    draft: 'warning',
  };

  const jobTypeLabel = {
    hourly: `$${job.payRate}/hr`,
    daily: `$${job.payRate}/day`,
    fixed: `$${job.payRate} fixed`,
  };

  const content = (
    <Card className="hover:border-primary-300 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-neutral-900 truncate">{job.title}</h3>
          <p className="text-sm text-neutral-600">{job.employerName}</p>
        </div>
        <Badge variant={statusVariant[job.status]}>{job.status.replace('_', ' ')}</Badge>
      </div>
      
      <p className="text-sm text-neutral-600 line-clamp-2 mb-4">{job.description}</p>
      
      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className="flex items-center gap-2 text-neutral-600">
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-600">
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-neutral-900">{jobTypeLabel[job.jobType]}</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-600">
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{format(new Date(job.startDate), 'MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-600">
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span>{job.category}</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.requiredSkills.slice(0, 3).map((skill) => (
          <span key={skill} className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 border border-neutral-200">
            {skill}
          </span>
        ))}
        {job.requiredSkills.length > 3 && (
          <span className="px-2 py-0.5 text-xs text-neutral-500">+{job.requiredSkills.length - 3} more</span>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <span className="text-xs text-neutral-500">
          {job.applicationsCount} application{job.applicationsCount !== 1 ? 's' : ''}
        </span>
        {showActions && job.status === 'open' && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onApply?.();
            }}
            className="px-3 py-1.5 text-xs font-medium bg-primary-800 text-white hover:bg-primary-900 transition-colors"
          >
            Apply Now
          </button>
        )}
      </div>
    </Card>
  );

  if (linkTo) {
    return <Link to={linkTo} className="block">{content}</Link>;
  }

  return content;
}
