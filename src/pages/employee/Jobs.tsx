import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout';
import { Card, Button, Badge, Input, Select, Avatar } from '@/components/ui';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { shiftsService } from '@/services/shifts.service';
import { formatCurrency } from '@/lib/currency';
import type { ShiftWithEmployer } from '@/lib/database.types';

export function EmployeeJobs() {
  const { t } = useTranslation();
  const [shifts, setShifts] = useState<ShiftWithEmployer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'pay' | 'slots'>('date');

  const CATEGORIES = [
    { value: '', label: t('employeeJobs.allCategories') },
    { value: 'events', label: t('employeeJobs.eventsHospitality') },
    { value: 'warehouse', label: t('employeeJobs.warehouseLogistics') },
    { value: 'hospitality', label: t('employeeJobs.foodService') },
    { value: 'industrial', label: t('employeeJobs.industrial') },
    { value: 'facilities', label: t('employeeJobs.facilitiesCleaning') },
  ];

  useEffect(() => {
    const loadShifts = async () => {
      try {
        const data = await shiftsService.getAvailableShifts({
          category: category || undefined,
        });
        setShifts(data);
      } catch (error) {
        console.error('Error loading shifts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadShifts();
  }, [category]);

  const filteredShifts = shifts
    .filter(shift => {
      if (search && !shift.title.toLowerCase().includes(search.toLowerCase()) && 
          !shift.location_name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      const remainingSlots = shift.slots_total - shift.slots_confirmed - shift.slots_standby;
      return remainingSlots > 0;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(a.shift_date).getTime() - new Date(b.shift_date).getTime();
      if (sortBy === 'pay') return b.pay_rate - a.pay_rate;
      if (sortBy === 'slots') {
        const aRemaining = a.slots_total - a.slots_confirmed - a.slots_standby;
        const bRemaining = b.slots_total - b.slots_confirmed - b.slots_standby;
        return bRemaining - aRemaining;
      }
      return 0;
    });

  const formatDate = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (d.toDateString() === today.toDateString()) return t('employeeJobs.today');
    if (d.toDateString() === tomorrow.toDateString()) return t('employeeJobs.tomorrow');
    
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
  };

  const getUrgencyBadge = (urgency: string) => {
    if (urgency === 'critical') return <Badge variant="error">{t('employeeJobs.urgentFill')}</Badge>;
    if (urgency === 'urgent') return <Badge variant="warning">{t('employeeJobs.urgent')}</Badge>;
    return null;
  };

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-neutral-900">{t('employeeJobs.title')}</h1>
            <p className="text-neutral-600 mt-1">
              {t('employeeJobs.shiftsAvailable', { count: filteredShifts.length })}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder={t('employeeJobs.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>
              <div className="w-48">
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={CATEGORIES}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('date')}
                  className={`px-3 py-2 text-sm rounded-lg border ${
                    sortBy === 'date' 
                      ? 'bg-primary-50 border-primary-300 text-primary-700' 
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {t('employeeJobs.soonest')}
                </button>
                <button
                  onClick={() => setSortBy('pay')}
                  className={`px-3 py-2 text-sm rounded-lg border ${
                    sortBy === 'pay' 
                      ? 'bg-primary-50 border-primary-300 text-primary-700' 
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {t('employeeJobs.highestPay')}
                </button>
                <button
                  onClick={() => setSortBy('slots')}
                  className={`px-3 py-2 text-sm rounded-lg border ${
                    sortBy === 'slots' 
                      ? 'bg-primary-50 border-primary-300 text-primary-700' 
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {t('employeeJobs.mostSlots')}
                </button>
              </div>
            </div>
          </Card>

          {/* Shifts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-neutral-600 mt-2">{t('employeeJobs.loadingShifts')}</p>
              </div>
            ) : filteredShifts.map((shift, index) => {
              const remainingSlots = shift.slots_total - shift.slots_confirmed - shift.slots_standby;
              return (
              <Link key={shift.id} to={`/employee/shifts/${shift.id}`}>
                <AnimatedCard 
                  animation="fadeInUp"
                  delay={index * 0.05}
                  className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getUrgencyBadge(shift.urgency)}
                        <Badge variant="secondary" className="text-xs">{shift.category}</Badge>
                      </div>
                      <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">{shift.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar 
                          name={shift.employer?.company_name || 'Company'} 
                          src={shift.employer?.avatar_url}
                          size="xs" 
                        />
                        <span className="text-sm text-neutral-600">{shift.employer?.company_name}</span>
                        {shift.employer?.verified && (
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">{formatCurrency(shift.pay_rate)}</p>
                      <p className="text-xs text-neutral-500">{t('employeeJobs.perHour')}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-neutral-600 mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium text-neutral-900">{formatDate(shift.shift_date)}</span>
                      <span>•</span>
                      <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{shift.location_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span>{shift.city || ''}, {shift.state || ''}</span>
                    </div>
                  </div>

                  {/* Slots Remaining */}
                  <div className="pt-3 border-t border-neutral-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          remainingSlots <= 3 ? 'bg-red-500 animate-pulse' : 
                          remainingSlots <= 5 ? 'bg-amber-500' : 'bg-green-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          remainingSlots <= 3 ? 'text-red-600' : 
                          remainingSlots <= 5 ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          {t('employeeJobs.slotsLeft', { count: remainingSlots })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-neutral-500">
                        <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {shift.employer?.average_rating || 0}
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </Link>
            );
            })}
          </div>

          {filteredShifts.length === 0 && (
            <Card className="text-center py-12">
              <svg className="w-12 h-12 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-neutral-600 mb-2">{t('employeeJobs.noShiftsMatch')}</p>
              <Button 
                variant="ghost" 
                onClick={() => { setSearch(''); setCategory(''); }}
              >
                {t('employeeJobs.clearFilters')}
              </Button>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
