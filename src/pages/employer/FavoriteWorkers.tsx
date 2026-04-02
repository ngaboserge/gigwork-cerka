import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Card, Button, Badge, Modal, Textarea, Rating, Avatar, Skeleton, EmptyState, Input } from '@/components/ui';
import { useAuthStore, useFavoritesStore } from '@/store';
import { format } from 'date-fns';
import type { FavoriteWorker } from '@/types';

export function FavoriteWorkers() {
  const { user } = useAuthStore();
  const { favoriteWorkers, loading, fetchFavoriteWorkers, removeFavoriteWorker, updateWorkerNotes } = useFavoritesStore();
  const [selectedWorker, setSelectedWorker] = useState<FavoriteWorker | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSkill, setFilterSkill] = useState('');

  useEffect(() => {
    if (user?.id) fetchFavoriteWorkers(user.id);
  }, [user?.id, fetchFavoriteWorkers]);

  const handleRemove = async (workerId: string) => {
    if (confirm('Remove this worker from favorites?')) {
      await removeFavoriteWorker(workerId);
    }
  };

  const handleSaveNotes = async () => {
    if (selectedWorker) {
      await updateWorkerNotes(selectedWorker.workerId, notes);
      setShowNotesModal(false);
      setSelectedWorker(null);
    }
  };

  const openNotesModal = (worker: FavoriteWorker) => {
    setSelectedWorker(worker);
    setNotes(worker.notes || '');
    setShowNotesModal(true);
  };

  // Get all unique skills
  const allSkills = [...new Set(favoriteWorkers.flatMap(w => w.workerSkills))];

  // Filter workers
  const filteredWorkers = favoriteWorkers.filter(worker => {
    const matchesSearch = worker.workerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill = !filterSkill || worker.workerSkills.includes(filterSkill);
    return matchesSearch && matchesSkill;
  });

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Favorite Workers</h1>
                <p className="text-neutral-600 mt-1">Your preferred workers for quick hiring</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info">{favoriteWorkers.length} workers saved</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search workers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Skills</option>
                {allSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          </Card>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} height={280} />)}
            </div>
          ) : filteredWorkers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkers.map(worker => (
                <Card key={worker.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <Avatar name={worker.workerName} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900">{worker.workerName}</h3>
                      <Rating value={worker.workerRating} size="sm" showValue />
                    </div>
                    <button
                      onClick={() => handleRemove(worker.workerId)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove from favorites"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>

                  {/* Skills */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {worker.workerSkills.slice(0, 4).map(skill => (
                      <Badge key={skill} variant="neutral" className="text-xs">{skill}</Badge>
                    ))}
                    {worker.workerSkills.length > 4 && (
                      <Badge variant="neutral" className="text-xs">+{worker.workerSkills.length - 4}</Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <p className="text-xl font-bold text-green-700">{worker.hiredCount}</p>
                      <p className="text-xs text-green-600">Times Hired</p>
                    </div>
                    <div className="p-2 bg-neutral-50 rounded-lg">
                      <p className="text-sm font-medium text-neutral-700">
                        {worker.lastHiredAt ? format(new Date(worker.lastHiredAt), 'MMM d') : 'Never'}
                      </p>
                      <p className="text-xs text-neutral-500">Last Hired</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {worker.notes && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800 italic">"{worker.notes}"</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => { setSelectedWorker(worker); setShowHireModal(true); }}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Hire Again
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => openNotesModal(worker)}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                    <Button size="sm" variant="secondary">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </Button>
                  </div>

                  <p className="mt-3 text-xs text-neutral-400 text-center">
                    Added {format(new Date(worker.addedAt), 'MMM d, yyyy')}
                  </p>
                </Card>
              ))}
            </div>
          ) : favoriteWorkers.length > 0 ? (
            <EmptyState
              title="No workers match your filters"
              description="Try adjusting your search or filter criteria."
              action={{ label: 'Clear Filters', onClick: () => { setSearchQuery(''); setFilterSkill(''); } }}
            />
          ) : (
            <EmptyState
              title="No favorite workers yet"
              description="When you find workers you enjoy working with, add them to your favorites for quick re-hiring."
              action={{ label: 'Post a Job', onClick: () => {} }}
            />
          )}
        </div>
      </div>

      {/* Notes Modal */}
      <Modal isOpen={showNotesModal} onClose={() => setShowNotesModal(false)} title="Edit Notes">
        <div className="space-y-4">
          {selectedWorker && (
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <Avatar name={selectedWorker.workerName} />
              <div>
                <p className="font-medium">{selectedWorker.workerName}</p>
                <Rating value={selectedWorker.workerRating} size="sm" />
              </div>
            </div>
          )}
          <Textarea
            label="Personal Notes"
            placeholder="Add notes about this worker (only visible to you)..."
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

      {/* Quick Hire Modal */}
      <Modal isOpen={showHireModal} onClose={() => setShowHireModal(false)} title="Hire Worker">
        <div className="space-y-4">
          {selectedWorker && (
            <>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <Avatar name={selectedWorker.workerName} size="lg" />
                <div>
                  <p className="font-semibold text-lg">{selectedWorker.workerName}</p>
                  <Rating value={selectedWorker.workerRating} size="sm" showValue />
                  <p className="text-sm text-neutral-500 mt-1">Hired {selectedWorker.hiredCount} times</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Quick Hire:</strong> Send a direct job offer to {selectedWorker.workerName.split(' ')[0]} for one of your open positions.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-700">Select a job to offer:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {['Warehouse Associate - Morning Shift', 'Delivery Driver - Weekend', 'Event Setup Crew'].map((job, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
                      <input type="radio" name="job" className="text-primary-600" />
                      <span className="text-sm">{job}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowHireModal(false)}>Cancel</Button>
            <Button>Send Offer</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
