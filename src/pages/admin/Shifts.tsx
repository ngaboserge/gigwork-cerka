import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabaseUntyped as supabase } from '@/lib/supabase';

interface Shift {
  id: string;
  title: string;
  description: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  pay_rate: number;
  pay_type: string;
  status: string;
  total_slots: number;
  filled_slots: number;
  employer: {
    company_name: string;
  };
}

export default function AdminShifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadShifts();
  }, []);

  useEffect(() => {
    filterShifts();
  }, [searchTerm, statusFilter, shifts]);

  const loadShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select(`
          *,
          employer:employer_id(company_name:employer_profiles(company_name))
        `)
        .order('shift_date', { ascending: false });

      if (error) throw error;
      setShifts(data || []);
    } catch (error) {
      console.error('Error loading shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterShifts = () => {
    let filtered = shifts;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(shift => shift.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(shift =>
        shift.title.toLowerCase().includes(term) ||
        shift.description?.toLowerCase().includes(term) ||
        shift.employer?.company_name?.toLowerCase().includes(term)
      );
    }

    setFilteredShifts(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'neutral';
      case 'cancelled': return 'error';
      default: return 'warning';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shift Management</h1>
        <p className="text-gray-600 mt-2">Monitor and manage all platform shifts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600">Total Shifts</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{shifts.length}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600">Active</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {shifts.filter(s => s.status === 'active').length}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600">Completed</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {shifts.filter(s => s.status === 'completed').length}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600">Cancelled</div>
          <div className="text-3xl font-bold text-red-600 mt-2">
            {shifts.filter(s => s.status === 'cancelled').length}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                type="text"
                placeholder="Search shifts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'primary' : 'secondary'}
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'primary' : 'secondary'}
              onClick={() => setStatusFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'primary' : 'secondary'}
              onClick={() => setStatusFilter('completed')}
            >
              Completed
            </Button>
          </div>
        </div>
      </Card>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredShifts.length === 0 ? (
          <Card className="p-12 col-span-2 text-center text-gray-500">
            No shifts found
          </Card>
        ) : (
          filteredShifts.map((shift) => (
            <Card key={shift.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{shift.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{shift.employer?.company_name}</p>
                </div>
                <Badge variant={getStatusColor(shift.status)}>
                  {shift.status}
                </Badge>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{shift.description}</p>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {new Date(shift.shift_date).toLocaleDateString()} • {shift.start_time} - {shift.end_time}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267zM10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" />
                  </svg>
                  ${shift.pay_rate}/{shift.pay_type}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {shift.filled_slots}/{shift.total_slots} slots filled
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(shift.filled_slots / shift.total_slots) * 100}%` }}
                  ></div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
    </Layout>
  );
}
