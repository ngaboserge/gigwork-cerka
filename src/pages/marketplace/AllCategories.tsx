import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, Badge } from '@/components/ui';
import { 
  TrendingUp, Package, Building, Wheat, Meat, Smartphone, Car, Home as HomeIcon, 
  Tool, Cow, Lightning, Hammer, Box, Hospital, Tractor, Shirt
} from '@/lib/icons';

const CATEGORIES = [
  {
    id: 'construction',
    name: 'Construction Materials',
    icon: <Building className="w-12 h-12" />,
    color: 'orange',
    description: 'Cement, steel, bricks, tiles, and building supplies',
    itemCount: '50+',
    trending: true
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    icon: <Wheat className="w-12 h-12" />,
    color: 'green',
    description: 'Seeds, fertilizer, produce, and farming equipment',
    itemCount: '40+',
    trending: true
  },
  {
    id: 'food',
    name: 'Food & Commodities',
    icon: <Meat className="w-12 h-12" />,
    color: 'red',
    description: 'Staples, proteins, produce, dairy, and beverages',
    itemCount: '60+',
    trending: false
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: <Smartphone className="w-12 h-12" />,
    color: 'blue',
    description: 'Phones, laptops, solar panels, and devices',
    itemCount: '45+',
    trending: true
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    icon: <Car className="w-12 h-12" />,
    color: 'gray',
    description: 'Cars, motorcycles, trucks, and parts',
    itemCount: '30+',
    trending: false
  },
  {
    id: 'rentals',
    name: 'House Rentals',
    icon: <HomeIcon className="w-12 h-12" />,
    color: 'purple',
    description: 'Houses, apartments, shops, and commercial spaces',
    itemCount: '25+',
    trending: true
  },
  {
    id: 'services',
    name: 'Services',
    icon: <Tool className="w-12 h-12" />,
    color: 'indigo',
    description: 'Labor, transport, equipment rental, and more',
    itemCount: '35+',
    trending: false
  },
  {
    id: 'livestock',
    name: 'Livestock',
    icon: <Cow className="w-12 h-12" />,
    color: 'amber',
    description: 'Cows, goats, chickens, and animal products',
    itemCount: '20+',
    trending: false
  },
  {
    id: 'energy',
    name: 'Energy & Utilities',
    icon: <Lightning className="w-12 h-12" />,
    color: 'yellow',
    description: 'Charcoal, gas, solar, and energy solutions',
    itemCount: '15+',
    trending: false
  },
  {
    id: 'hardware',
    name: 'Hardware & Tools',
    icon: <Hammer className="w-12 h-12" />,
    color: 'slate',
    description: 'Tools, equipment, and hardware supplies',
    itemCount: '30+',
    trending: false
  },
  {
    id: 'goods',
    name: 'Manufactured Goods',
    icon: <Box className="w-12 h-12" />,
    color: 'cyan',
    description: 'Clothes, shoes, plastics, and consumer products',
    itemCount: '40+',
    trending: false
  },
  {
    id: 'health',
    name: 'Health & Hygiene',
    icon: <Hospital className="w-12 h-12" />,
    color: 'pink',
    description: 'Soap, sanitizers, medical supplies, and hygiene',
    itemCount: '25+',
    trending: false
  },
  {
    id: 'automotive',
    name: 'Automotive & Transport',
    icon: <Tractor className="w-12 h-12" />,
    color: 'emerald',
    description: 'Fuel, spare parts, tires, and automotive supplies',
    itemCount: '35+',
    trending: false
  },
  {
    id: 'textiles',
    name: 'Textiles & Tailoring',
    icon: <Shirt className="w-12 h-12" />,
    color: 'violet',
    description: 'Fabric, thread, buttons, and tailoring supplies',
    itemCount: '20+',
    trending: false
  }
];

export default function AllCategories() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Browse All Categories</h1>
            <p className="text-xl opacity-90 mb-6">
              Explore 14 economic sectors with 200+ materials and products
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span>200+ Materials</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span>Real-time Prices</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🇷🇼</span>
                <span>Made for Rwanda</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((category) => (
            <div
              key={category.id}
              onClick={() => navigate(`/marketplace/${category.id}`)}
              className="cursor-pointer group"
            >
              <Card className="h-full hover:shadow-xl transition-all transform group-hover:-translate-y-1">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-5xl">{category.icon}</div>
                      <div>
                        <h3 className="font-bold text-lg text-neutral-900 group-hover:text-primary-600 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-neutral-600">{category.itemCount} items</p>
                      </div>
                    </div>
                    {category.trending && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Trending
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-neutral-600 mb-4">
                    {category.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                    <span className="text-sm text-neutral-500">Browse sector</span>
                    <svg 
                      className="w-5 h-5 text-primary-600 transform group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
          <p className="text-lg opacity-90 mb-8">
            Post a request and let sellers come to you
          </p>
          <button
            onClick={() => navigate('/materials/trends')}
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
          >
            Post a Request
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
