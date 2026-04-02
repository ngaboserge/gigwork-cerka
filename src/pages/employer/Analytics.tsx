import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Card, Button, Select, Skeleton } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { analyticsService, type EmployerAnalytics } from '@/services/analytics.service';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';

export function EmployerAnalytics() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<EmployerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const data = await analyticsService.getEmployerAnalytics(user.id, period);
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user, period]);

  const handleExport = (format: 'csv' | 'pdf') => {
    // TODO: Implement export functionality
    alert(`Export to ${format.toUpperCase()} coming soon!`);
  };

  const periodOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ];

  const maxApplications = Math.max(...(analytics?.applicationsByDay.map(d => d.count) || [1]));

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-neutral-900">Analytics</h1>
                <p className="text-sm text-neutral-600 mt-1">Track your hiring performance and workforce metrics</p>
              </div>
              <div className="flex items-center gap-3">
                <Select 
                  options={periodOptions} 
                  value={period} 
                  onChange={(e) => setPeriod(e.target.value)} 
                  className="w-40" 
                />
                <Button variant="secondary" onClick={() => handleExport('csv')}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}><Skeleton height={80} /></Card>
              ))}
            </div>
          ) : analytics ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <p className="text-sm text-neutral-600">Shifts Posted</p>
                  <p className="text-3xl font-bold text-primary-800">{analytics.totalShiftsPosted}</p>
                  <p className="text-xs text-neutral-500 mt-1">This period</p>
                </Card>
                <Card>
                  <p className="text-sm text-neutral-600">Workers Deployed</p>
                  <p className="text-3xl font-bold text-neutral-900">{analytics.totalWorkersDeployed}</p>
                  <p className="text-xs text-neutral-500 mt-1">Completed shifts</p>
                </Card>
                <Card>
                  <p className="text-sm text-neutral-600">Fill Rate</p>
                  <p className="text-3xl font-bold text-emerald-600">{analytics.avgFillRate}%</p>
                  <p className="text-xs text-neutral-500 mt-1">Average across shifts</p>
                </Card>
                <Card>
                  <p className="text-sm text-neutral-600">Total Spent</p>
                  <p className="text-3xl font-bold text-neutral-900">{formatCurrency(analytics.totalSpent)}</p>
                  <p className="text-xs text-neutral-500 mt-1">Worker payments</p>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Applications Over Time */}
                <Card>
                  <h2 className="font-semibold text-neutral-900 mb-4">Applications Over Time</h2>
                  <div className="h-64 flex items-end gap-1">
                    {analytics.applicationsByDay.slice(-14).map((day, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-primary-500 rounded-t transition-all hover:bg-primary-600" 
                          style={{ 
                            height: `${maxApplications > 0 ? (day.count / maxApplications) * 100 : 0}%`,
                            minHeight: day.count > 0 ? '4px' : '0'
                          }} 
                          title={`${day.count} applications`}
                        />
                        <span className="text-xs text-neutral-500 mt-2 -rotate-45 origin-left whitespace-nowrap">
                          {format(new Date(day.date), 'M/d')}
                        </span>
                      </div>
                    ))}
                  </div>
                  {analytics.applicationsByDay.length === 0 && (
                    <div className="h-64 flex items-center justify-center text-neutral-400">
                      No application data for this period
                    </div>
                  )}
                </Card>

                {/* Shifts by Status */}
                <Card>
                  <h2 className="font-semibold text-neutral-900 mb-4">Shifts by Status</h2>
                  <div className="space-y-3">
                    {analytics.shiftsByStatus.length > 0 ? (
                      analytics.shiftsByStatus.map((item) => {
                        const total = analytics.shiftsByStatus.reduce((sum, s) => sum + s.count, 0);
                        const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                        const statusColors: Record<string, string> = {
                          draft: 'bg-neutral-400',
                          open: 'bg-blue-500',
                          filled: 'bg-green-500',
                          in_progress: 'bg-amber-500',
                          completed: 'bg-emerald-600',
                          cancelled: 'bg-red-500',
                        };
                        return (
                          <div key={item.status} className="flex items-center gap-3">
                            <span className="text-sm text-neutral-600 w-24 capitalize">
                              {item.status.replace('_', ' ')}
                            </span>
                            <div className="flex-1 h-4 bg-neutral-100 rounded overflow-hidden">
                              <div 
                                className={`h-full rounded ${statusColors[item.status] || 'bg-primary-500'}`} 
                                style={{ width: `${percentage}%` }} 
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">{item.count}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-neutral-400">
                        No shift data for this period
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Bottom Row */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Shifts by Category */}
                <Card>
                  <h2 className="font-semibold text-neutral-900 mb-4">Shifts by Category</h2>
                  <div className="space-y-3">
                    {analytics.shiftsByCategory.length > 0 ? (
                      analytics.shiftsByCategory.map((cat, i) => (
                        <div key={cat.category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-primary-100 text-primary-800 text-xs font-medium flex items-center justify-center rounded">
                              {i + 1}
                            </span>
                            <span className="text-sm text-neutral-700 capitalize">{cat.category}</span>
                          </div>
                          <span className="text-sm font-medium">{cat.count} shifts</span>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-neutral-400">
                        No category data
                      </div>
                    )}
                  </div>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <h2 className="font-semibold text-neutral-900 mb-4">Performance Metrics</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-600">Fill Rate</span>
                        <span className="font-medium">{analytics.avgFillRate}%</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded">
                        <div 
                          className={`h-full rounded ${analytics.avgFillRate >= 80 ? 'bg-green-500' : analytics.avgFillRate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                          style={{ width: `${analytics.avgFillRate}%` }} 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-600">No-Show Rate</span>
                        <span className="font-medium">{analytics.noShowRate}%</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded">
                        <div 
                          className={`h-full rounded ${analytics.noShowRate <= 5 ? 'bg-green-500' : analytics.noShowRate <= 10 ? 'bg-amber-500' : 'bg-red-500'}`} 
                          style={{ width: `${Math.min(analytics.noShowRate * 5, 100)}%` }} 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-600">Avg Time to Fill</span>
                        <span className="font-medium">{analytics.avgTimeToFill} days</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-600">Employer Rating</span>
                        <span className="font-medium flex items-center gap-1">
                          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {analytics.avgRating?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Top Workers */}
                <Card>
                  <h2 className="font-semibold text-neutral-900 mb-4">Top Workers</h2>
                  <div className="space-y-3">
                    {analytics.topWorkers.length > 0 ? (
                      analytics.topWorkers.slice(0, 5).map((worker, i) => (
                        <div key={worker.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 text-xs font-medium flex items-center justify-center rounded-full ${
                              i === 0 ? 'bg-amber-100 text-amber-800' :
                              i === 1 ? 'bg-neutral-200 text-neutral-700' :
                              i === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-neutral-100 text-neutral-600'
                            }`}>
                              {i + 1}
                            </span>
                            <span className="text-sm text-neutral-700">{worker.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium">{worker.shiftsCompleted} shifts</span>
                            {worker.rating > 0 && (
                              <span className="text-xs text-neutral-500 ml-2">
                                ★ {worker.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-neutral-400">
                        No worker data yet
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Spending by Month */}
              {analytics.spendingByMonth.length > 0 && (
                <Card className="mt-6">
                  <h2 className="font-semibold text-neutral-900 mb-4">Spending by Month</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {analytics.spendingByMonth.map((month) => (
                      <div key={month.month} className="text-center p-3 bg-neutral-50 rounded-lg">
                        <p className="text-xs text-neutral-500">{month.month}</p>
                        <p className="text-lg font-bold text-neutral-900">{formatCurrency(month.amount)}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="text-center py-12">
              <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="font-semibold text-neutral-900 mb-2">No Analytics Data</h3>
              <p className="text-neutral-500">Post shifts and deploy workers to see your analytics here.</p>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
