import { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  illustration?: 'search' | 'inbox' | 'folder' | 'users' | 'star' | 'calendar';
}

const illustrations = {
  search: (
    <svg className="w-24 h-24 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  inbox: (
    <svg className="w-24 h-24 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  folder: (
    <svg className="w-24 h-24 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  users: (
    <svg className="w-24 h-24 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  star: (
    <svg className="w-24 h-24 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  calendar: (
    <svg className="w-24 h-24 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

export function EmptyState({ icon, title, description, action, secondaryAction, illustration }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fadeIn">
      {/* Illustration or Icon */}
      <div className="mb-6 animate-bounce-in">
        {illustration ? (
          illustrations[illustration]
        ) : icon ? (
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400 dark:text-neutral-500">
            {icon}
          </div>
        ) : (
          illustrations.inbox
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{title}</h3>

      {/* Description */}
      {description && <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mb-6">{description}</p>}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action && <Button onClick={action.onClick}>{action.label}</Button>}
          {secondaryAction && (
            <Button variant="secondary" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function NoJobsFound({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <EmptyState
      illustration="search"
      title="No jobs found"
      description="Try adjusting your search filters or check back later for new opportunities."
      action={onClearFilters ? { label: 'Clear Filters', onClick: onClearFilters } : undefined}
    />
  );
}

export function NoApplications() {
  return (
    <EmptyState
      illustration="folder"
      title="No applications yet"
      description="Start applying to jobs to see your applications here."
    />
  );
}

export function NoMessages() {
  return (
    <EmptyState
      illustration="inbox"
      title="No messages"
      description="When you start a conversation, it will appear here."
    />
  );
}

export function NoReviews() {
  return (
    <EmptyState
      illustration="star"
      title="No reviews yet"
      description="Complete jobs to receive reviews from employers."
    />
  );
}
