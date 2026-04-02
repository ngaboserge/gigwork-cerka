import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button, QuickActionCard, StatCard, AnimatedCard } from '@/components/ui';
import { Briefcase, Plus, Search, Users, Clock, TrendingUp, MapPin } from '@/lib/icons';

export default function GigWorkHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const isWorker = user?.role === 'worker';
  const isEmployer = user?.role === 'employer';

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-fadeInDown">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
              {isWorker && `Welcome back, ${user.name?.split(' ')[0]}!`}
              {isEmployer && `Welcome, ${user.name}!`}
              {!user && 'Find Flexible Work'}
            </h1>
            <p className="text-lg md:text-xl text-blue-50 mb-8">
              {isWorker && 'Browse shifts, track your work, and grow your career'}
              {isEmployer && 'Post shifts, manage workers, and grow your team'}
              {!user && 'Connect with opportunities across Rwanda'}
            </p>
          </div>

          {/* Primary Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            {isWorker && (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate('/employee/jobs')}
                  className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 border-2 border-yellow-500 shadow-lg hover:shadow-xl h-auto py-4"
                  fullWidth
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-6 h-6" />
                    <span className="font-semibold">Browse Shifts</span>
                    <span className="text-xs opacity-75">Find work near you</span>
                  </div>
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate('/employee/applications')}
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm h-auto py-4"
                  fullWidth
                >
                  <div className="flex flex-col items-center gap-2">
                    <Briefcase className="w-6 h-6" />
                    <span className="font-semibold">My Applications</span>
                    <span className="text-xs opacity-75">Track your progress</span>
                  </div>
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate('/employee/time-tracking')}
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm h-auto py-4"
                  fullWidth
                >
                  <div className="flex flex-col items-center gap-2">
                    <Clock className="w-6 h-6" />
                    <span className="font-semibold">Time Tracking</span>
                    <span className="text-xs opacity-75">Log your hours</span>
                  </div>
                </Button>
              </>
            )}
            
            {isEmployer && (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate('/employer/shifts/new')}
                  className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 border-2 border-yellow-500 shadow-lg hover:shadow-xl h-auto py-4"
                  fullWidth
                >
                  <div className="flex flex-col items-center gap-2">
                    <Plus className="w-6 h-6" />
                    <span className="font-semibold">Post a Shift</span>
                    <span className="text-xs opacity-75">Hire workers</span>
                  </div>
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate('/employer/shifts')}
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm h-auto py-4"
                  fullWidth
                >
                  <div className="flex flex-col items-center gap-2">
                    <Briefcase className="w-6 h-6" />
                    <span className="font-semibold">Manage Shifts</span>
                    <span className="text-xs opacity-75">View all shifts</span>
                  </div>
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate('/employer/applications')}
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm h-auto py-4"
                  fullWidth
                >
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-6 h-6" />
                    <span className="font-semibold">Applications</span>
                    <span className="text-xs opacity-75">Review candidates</span>
                  </div>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Stats */}
        {user && (
          <div className="mb-12 animate-fadeInUp">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Your Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {isWorker && (
                <>
                  <StatCard
                    label="Active Applications"
                    value="3"
                    icon={<Briefcase className="w-5 h-5" />}
                    color="primary"
                    delay={0}
                  />
                  <StatCard
                    label="Completed Shifts"
                    value={user.total_shifts_completed?.toString() || "0"}
                    icon={<Briefcase className="w-5 h-5" />}
                    trend={{ value: 20, isPositive: true }}
                    color="success"
                    delay={100}
                  />
                  <StatCard
                    label="Reliability Score"
                    value={user.reliability_score?.toFixed(0) || "70"}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="warning"
                    delay={200}
                  />
                  <StatCard
                    label="Messages"
                    value="5"
                    icon={<Users className="w-5 h-5" />}
                    color="neutral"
                    delay={300}
                  />
                </>
              )}
              {isEmployer && (
                <>
                  <StatCard
                    label="Active Shifts"
                    value="7"
                    icon={<Briefcase className="w-5 h-5" />}
                    color="primary"
                    delay={0}
                  />
                  <StatCard
                    label="Total Workers"
                    value="45"
                    icon={<Users className="w-5 h-5" />}
                    trend={{ value: 12, isPositive: true }}
                    color="success"
                    delay={100}
                  />
                  <StatCard
                    label="Applications"
                    value="24"
                    icon={<Users className="w-5 h-5" />}
                    color="warning"
                    delay={200}
                  />
                  <StatCard
                    label="Pending Approvals"
                    value="9"
                    icon={<Clock className="w-5 h-5" />}
                    color="neutral"
                    delay={300}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isWorker && (
              <>
                <QuickActionCard
                  icon={<Search className="w-6 h-6" />}
                  title="Find Shifts"
                  description="Browse available"
                  onClick={() => navigate('/employee/jobs')}
                  color="primary"
                  delay={0}
                />
                <QuickActionCard
                  icon={<MapPin className="w-6 h-6" />}
                  title="Near Me"
                  description="Local opportunities"
                  onClick={() => navigate('/employee/jobs')}
                  color="success"
                  delay={50}
                />
                <QuickActionCard
                  icon={<Clock className="w-6 h-6" />}
                  title="Schedule"
                  description="View calendar"
                  onClick={() => navigate('/employee/schedule')}
                  color="warning"
                  delay={100}
                />
                <QuickActionCard
                  icon={<TrendingUp className="w-6 h-6" />}
                  title="Reputation"
                  description="View profile"
                  onClick={() => navigate('/employee/reputation')}
                  color="neutral"
                  delay={150}
                />
              </>
            )}
            {isEmployer && (
              <>
                <QuickActionCard
                  icon={<Plus className="w-6 h-6" />}
                  title="New Shift"
                  description="Post quickly"
                  onClick={() => navigate('/employer/shifts/new')}
                  color="primary"
                  delay={0}
                />
                <QuickActionCard
                  icon={<Users className="w-6 h-6" />}
                  title="Workers"
                  description="View favorites"
                  onClick={() => navigate('/employer/favorites')}
                  color="success"
                  delay={50}
                />
                <QuickActionCard
                  icon={<Clock className="w-6 h-6" />}
                  title="Time Approval"
                  description="Review hours"
                  onClick={() => navigate('/employer/time-approval')}
                  color="warning"
                  delay={100}
                />
                <QuickActionCard
                  icon={<TrendingUp className="w-6 h-6" />}
                  title="Analytics"
                  description="View insights"
                  onClick={() => navigate('/employer/analytics')}
                  color="neutral"
                  delay={150}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
