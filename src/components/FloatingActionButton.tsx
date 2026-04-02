import { useNavigate } from 'react-router-dom';
import { Plus } from '@/lib/icons';
import { useAuthStore } from '@/store';

export function FloatingActionButton() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={() => navigate('/suppliers/create')}
      className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 md:hidden"
      aria-label="Sell something"
    >
      <Plus className="w-8 h-8" strokeWidth={2.5} />
    </button>
  );
}
