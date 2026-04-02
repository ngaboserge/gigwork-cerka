import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button, QuickActionCard, StatCard, AnimatedCard } from '@/components/ui';
import { 
  Building, Wheat, Meat, Smartphone, Car, Home as HomeIcon, Tool, Cow,
  ShoppingCart, Briefcase, Package, TrendingUp, BarChart, Users, MapPin, User, Plus, Search
} from '@/lib/icons';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Determine user type for personalized experience
  const isWorker = user?.role === 'worker';
  const isEmployer = user?.role === 'employer';

  const marketplaceCategories = [
    { id: 'construction', name: 'Construction', icon: <Building className="w-6 h-6" />, count: '50+' },
    { id: 'agriculture', name: 'Agriculture', icon: <Wheat className="w-6 h-6" />, count: '40+' },
    { id: 'food', name: 'Food', icon: <Meat className="w-6 h-6" />, count: '60+' },
    { id: 'electronics', name: 'Electronics', icon: <Smartphone className="w-6 h-6" />, count: '45+' },
    { id: 'vehicles', name: 'Vehicles', icon: <Car className="w-6 h-6" />, count: '30+' },
    { id: 'rentals', name: 'Rentals', icon: <HomeIcon className="w-6 h-6" />, count: '25+' },
    { id: 'services', name: 'Services', icon: <Tool className="w-6 h-6" />, count: '35+' },
    { id: 'livestock', name: 'Livestock', icon: <Cow className="w-6 h-6" />, count: '20+' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      {/* Personalized Hero - Efficient & Action-Oriented */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-fadeInDown">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
              {user ? `Welcome back, ${user.name?.split(' ')[0] || 'there'}!` : 'Welcome to Cerka'}
            </h1>
            <p className="text-lg md:text-xl text-blue-50 mb-8">
              {isWorker && 'Find work, buy materials, and grow your career'}
              {isEmployer && 'Post shifts, sell products, and grow your business'}
              {!user && 'Find work, buy & sell products, track prices - all in one place'}
            </p>
          </div>

          {/* Primary Actions - Reduced to 2-3 key actions */}
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
                    <Briefcase className="w-6 h-6" />
                    <span className="font-semibold">Find Gig Work</span>
                    <span className="text-xs opacity-75">Browse available shifts</span>
                  </div>
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate('/buyers/search')}
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm h-auto py-4"
                  fullWidth
                >
                  <div className="flex flex-col items-center gap-2">
                    <ShoppingCart className="w-6 h-6" />
                    <span className="font-semibold">Buy Materials</span>
                    <span className="text-xs opacity-75">Browse marketplace</span>
                  </div>
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate('/materials/trends')}
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm h-auto py-4"
                  fullWidth
                >
                  <div className="flex flex-col items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    <span className="font-semibold">Price Trends</span>
                    <span className="text-xs opacity-75">Market intelligence</span>
                  </div>
                </Button>
              </>
            )}
            
            {isEmployer && (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate('/employer/create-shift')}
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
                  onClick={() => navigate('/suppliers/create')}
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm h-auto py-4"
                  fullWidth
                >
                  <div className="flex flex-col items-center gap-2">
                    <Package className="w-6 h-6" />
                    <span className="font-semibold">Sell Products</span>
                    <span className="text-xs opacity-75">Create listing</span>
                  </div>
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate('/employer/dashboard')}
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm h-auto py-4"
                  fullWidth
                >
                  <div className="flex flex-col items-center gap-2">
                    <BarChart className="w-6 h-6" />
                    <span className="font-semibold">Dashboard</span>
                    <span className="text-xs opacity-75">View analytics</span>
                  </div>
                </Button>
              </>
            )}

            {!user && (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate('/employee/jobs')}
                  className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 border-2 border-yellow-500 shadow-lg hover:shadow-xl h-auto py-4"
                  fullWidth
                >
                  <div className="flex flex-col items-center gap-2">
                    <Briefcase className="w-6 h-6" />
                    <span className="font-semibold">Find Work</span>
                    <span className="text-xs opacity-75">Browse gig shifts</span>
                  </div>
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate('/buyers/search')}
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm h-auto py-4"
                  fullWidth
                >
                  <div className="flex flex-col items-center gap-2">
                    <ShoppingCart className="w-6 h-6" />
                    <span className="font-semibold">Buy Products</span>
                    <span className="text-xs opacity-75">Browse marketplace</span>
                  </div>
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm h-auto py-4"
                  fullWidth
                >
                  <div className="flex flex-col items-center gap-2">
                    <User className="w-6 h-6" />
                    <span className="font-semibold">Get Started</span>
                    <span className="text-xs opacity-75">Create account</span>
                  </div>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Stats - If user is logged in */}
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
                    value="12"
                    icon={<Briefcase className="w-5 h-5" />}
                    trend={{ value: 20, isPositive: true }}
                    color="success"
                    delay={100}
                  />
                  <StatCard
                    label="Saved Listings"
                    value="8"
                    icon={<ShoppingCart className="w-5 h-5" />}
                    color="neutral"
                    delay={200}
                  />
                  <StatCard
                    label="Messages"
                    value="5"
                    icon={<Users className="w-5 h-5" />}
                    color="warning"
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
                    label="Active Listings"
                    value="15"
                    icon={<Package className="w-5 h-5" />}
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
                    label="Quote Requests"
                    value="9"
                    icon={<ShoppingCart className="w-5 h-5" />}
                    color="neutral"
                    delay={300}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions - Secondary actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionCard
              icon={<Search className="w-6 h-6" />}
              title="Browse All"
              description="See all listings"
              onClick={() => navigate('/buyers/search')}
              color="primary"
              delay={0}
            />
            <QuickActionCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Price Index"
              description="Market intelligence"
              onClick={() => navigate('/materials/trends')}
              color="success"
              delay={50}
            />
            <QuickActionCard
              icon={<MapPin className="w-6 h-6" />}
              title="By Location"
              description="Find near you"
              onClick={() => navigate('/marketplace/categories')}
              color="warning"
              delay={100}
            />
            <QuickActionCard
              icon={<BarChart className="w-6 h-6" />}
              title="Analytics"
              description="View insights"
              onClick={() => navigate(isEmployer ? '/employer/analytics' : '/materials/trends')}
              color="neutral"
              delay={150}
            />
          </div>
        </div>

        {/* Marketplace Categories - Compact Grid */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">Browse by Category</h2>
            <Button
              variant="ghost"
              onClick={() => navigate('/marketplace/categories')}
              className="text-sm"
            >
              View All 14 →
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {marketplaceCategories.map((category, index) => (
              <AnimatedCard
                key={category.id}
                hover="lift"
                animation="fadeInUp"
                delay={index * 30}
                onClick={() => navigate(`/marketplace/${category.id}`)}
                className="p-4 text-center cursor-pointer group"
              >
                <div className="text-neutral-700 group-hover:text-primary-600 transition-colors mb-2 flex justify-center transform group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-xs mb-1 text-neutral-900">{category.name}</h3>
                <p className="text-xs text-neutral-500">{category.count}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>

        {/* Price Intelligence Banner - Prominent CTA */}
        <AnimatedCard
          hover="lift"
          animation="fadeInUp"
          className="mb-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white overflow-hidden cursor-pointer"
          onClick={() => navigate('/materials/trends')}
        >
          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">Rwanda Economic Price Index</h2>
                </div>
                <p className="text-base md:text-lg text-purple-100 mb-4">
                  Track real-time market prices across all sectors. Make informed decisions with verified data.
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">📊 Real-time</div>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">📈 Trends</div>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">🗺️ Location-based</div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Button
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/materials/trends');
                  }}
                  className="bg-white text-purple-600 hover:bg-blue-50 shadow-xl"
                >
                  View Price Index →
                </Button>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Value Props - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <AnimatedCard hover="lift" animation="fadeInUp" delay={0} className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-neutral-900">14 Sectors</h3>
                <p className="text-sm text-neutral-600">
                  From construction to electronics - everything Rwanda needs in one marketplace.
                </p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard hover="lift" animation="fadeInUp" delay={100} className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-neutral-900">Flexible Work</h3>
                <p className="text-sm text-neutral-600">
                  Find shifts or hire workers for construction, events, hospitality, and more.
                </p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard 
            hover="lift" 
            animation="fadeInUp" 
            delay={200} 
            className="p-6 cursor-pointer"
            onClick={() => navigate('/materials/trends')}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-neutral-900">Price Intelligence</h3>
                <p className="text-sm text-neutral-600 mb-3">
                  Real-time market data to make informed purchasing decisions.
                </p>
                <Button size="sm" variant="ghost" className="text-primary-600 hover:text-primary-700 p-0">
                  Explore →
                </Button>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Final CTA - Simplified */}
        {!user && (
          <AnimatedCard
            animation="fadeInUp"
            className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white text-center p-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to get started?</h2>
            <p className="text-lg text-blue-50 mb-6">
              Join thousands using Rwanda's complete economic platform
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 border-2 border-yellow-500 shadow-xl"
              >
                Create Account
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/marketplace/categories')}
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
              >
                Browse Marketplace
              </Button>
            </div>
          </AnimatedCard>
        )}
      </div>

      <Footer />
    </div>
  );
}
