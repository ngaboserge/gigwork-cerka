import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button, QuickActionCard, StatCard, AnimatedCard } from '@/components/ui';
import { 
  Building, Wheat, Meat, Smartphone, Car, Home as HomeIcon, Tool, Cow,
  ShoppingCart, Package, TrendingUp, Search, Plus, BarChart
} from '@/lib/icons';

export default function MarketplaceHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

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
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-fadeInDown">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
              {user ? `Welcome back, ${user.name?.split(' ')[0]}!` : 'Rwanda Marketplace'}
            </h1>
            <p className="text-lg md:text-xl text-green-50 mb-8">
              Buy and sell across 14 sectors with real-time price intelligence
            </p>
          </div>

          {/* Primary Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <Button
              size="lg"
              onClick={() => navigate('/buyers/search')}
              className="bg-yellow-400 text-green-900 hover:bg-yellow-300 border-2 border-yellow-500 shadow-lg hover:shadow-xl h-auto py-4"
              fullWidth
            >
              <div className="flex flex-col items-center gap-2">
                <Search className="w-6 h-6" />
                <span className="font-semibold">Browse Marketplace</span>
                <span className="text-xs opacity-75">Find products</span>
              </div>
            </Button>
            <Button
              size="lg"
              onClick={() => navigate('/suppliers/create')}
              className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm h-auto py-4"
              fullWidth
            >
              <div className="flex flex-col items-center gap-2">
                <Plus className="w-6 h-6" />
                <span className="font-semibold">Create Listing</span>
                <span className="text-xs opacity-75">Sell products</span>
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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Stats */}
        {user && (
          <div className="mb-12 animate-fadeInUp">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Your Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                label="Active Listings"
                value="15"
                icon={<Package className="w-5 h-5" />}
                color="primary"
                delay={0}
              />
              <StatCard
                label="Quote Requests"
                value="9"
                icon={<ShoppingCart className="w-5 h-5" />}
                trend={{ value: 12, isPositive: true }}
                color="success"
                delay={100}
              />
              <StatCard
                label="Saved Items"
                value="8"
                icon={<ShoppingCart className="w-5 h-5" />}
                color="warning"
                delay={200}
              />
              <StatCard
                label="Messages"
                value="5"
                icon={<ShoppingCart className="w-5 h-5" />}
                color="neutral"
                delay={300}
              />
            </div>
          </div>
        )}

        {/* Quick Actions */}
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
              icon={<Package className="w-6 h-6" />}
              title="My Listings"
              description="Manage products"
              onClick={() => navigate('/suppliers/listings')}
              color="warning"
              delay={100}
            />
            <QuickActionCard
              icon={<BarChart className="w-6 h-6" />}
              title="Analytics"
              description="View insights"
              onClick={() => navigate('/materials/trends')}
              color="neutral"
              delay={150}
            />
          </div>
        </div>

        {/* Categories Grid */}
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

        {/* Price Intelligence Banner */}
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

      </div>

      <Footer />
    </div>
  );
}
