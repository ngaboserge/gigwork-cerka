import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, Button, Modal, Textarea, Rating, Avatar, Skeleton, EmptyState } from '@/components/ui';
import { useAuthStore, useFavoritesStore } from '@/store';
import { format } from 'date-fns';
import type { FavoriteEmployer } from '@/types';

export function Favorites() {
  const { user } = useAuthStore();
  const { favoriteEmployers, loading, fetchFavoriteEmployers, removeFavoriteEmployer, updateEmployerNotes } = useFavoritesStore();
  const [selectedEmployer, setSelectedEmployer] = useState<FavoriteEmployer | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user?.id) fetchFavoriteEmployers(user.id);
  }, [user?.id, fetchFavoriteEmployers]);

  const handleRemove = async (employerId: string) => {
    if (confirm('Remove this employer from favorites?')) {
      await removeFavoriteEmployer(employerId);
    }
  };

  const handleSaveNotes = async () => {
    if (selectedEmployer) {
      await updateEmployerNotes(selectedEmployer.employerId, notes);
      setShowNotesModal(false);
      setSelectedEmployer(null);
    }
  };

  const openNotesModal = (employer: FavoriteEmployer) => {
    setSelectedEmployer(employer);
    setNotes(employer.notes || '');
    setShowNotesModal(true);
  };

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Favorite Employers</h1>
                <p className="text-neutral-600 mt-1">Employers you've saved for quick access</p>
              </div>
              <Link to="/employee/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} height={200} />)}
            </div>
          ) : favoriteEmployers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteEmployers.map(employer => (
                <Card key={employer.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <Avatar name={employer.companyName} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 truncate">{employer.companyName}</h3>
                      <Rating value={employer.employerRating} size="sm" showValue />
                    </div>
                    <button
                      onClick={() => handleRemove(employer.employerId)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove from favorites"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 bg-neutral-50 rounded-lg">
                      <p className="text-xl font-bold text-primary-700">{employer.workedCount}</p>
                      <p className="text-xs text-neutral-500">Jobs Worked</p>
                    </div>
                    <div className="p-2 bg-neutral-50 rounded-lg">
                      <p className="text-sm font-medium text-neutral-700">
                        {employer.lastWorkedAt ? format(new Date(employer.lastWorkedAt), 'MMM d, yyyy') : 'Never'}
                      </p>
                      <p className="text-xs text-neutral-500">Last Worked</p>
                    </div>
                  </div>

                  {employer.notes && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800 italic">"{employer.notes}"</p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="flex-1">View Jobs</Button>
                    <Button size="sm" variant="secondary" onClick={() => openNotesModal(employer)}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                  </div>

                  <p className="mt-3 text-xs text-neutral-400 text-center">
                    Added {format(new Date(employer.addedAt), 'MMM d, yyyy')}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No favorite employers yet"
              description="When you find employers you enjoy working with, add them to your favorites for quick access to their job postings."
              action={{ label: 'Browse Jobs', onClick: () => {} }}
            />
          )}
        </div>
      </div>

      {/* Notes Modal */}
      <Modal isOpen={showNotesModal} onClose={() => setShowNotesModal(false)} title="Edit Notes">
        <div className="space-y-4">
          {selectedEmployer && (
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <Avatar name={selectedEmployer.companyName} />
              <div>
                <p className="font-medium">{selectedEmployer.companyName}</p>
                <Rating value={selectedEmployer.employerRating} size="sm" />
              </div>
            </div>
          )}
          <Textarea
            label="Personal Notes"
            placeholder="Add notes about this employer (only visible to you)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowNotesModal(false)}>Cancel</Button>
            <Button onClick={handleSaveNotes}>Save Notes</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
