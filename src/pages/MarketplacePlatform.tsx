import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { PlatformHeader } from '@/components/layout/PlatformHeader';
import { PlatformFooter } from '@/components/layout/PlatformFooter';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function MarketplacePlatform() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-neutral-50">
      <PlatformHeader platform="marketplace" />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Smart Material Pricing.
              <span className="block text-green-200">Trusted Suppliers.</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
              Access real-time construction material prices, connect with verified suppliers, and make informed purchasing decisions across Rwanda.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/materials/price-index">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Browse Prices
                </Button>
              </Link>
              {!isAuthenticated ? (
                <Link to="/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-green-600">
                    Join Marketplace
                  </Button>
                </Link>
              ) : (
                <Link to="/materials/price-submit">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-green-600">
                    Submit Prices
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              How Materials Marketplace Works
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Community-driven pricing intelligence for Rwanda's construction industry
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Price Intelligence */}
            <Card className="p-8 text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v2M9 19l3 3 3-3M9 19h6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Real-Time Prices</h3>
              <p className="text-neutral-600 mb-6">
                Access current market prices for cement, sand, bricks, steel, and more materials across different locations in Rwanda.
              </p>
              <Link to="/materials/price-index">
                <Button variant="outline" size="sm">View Price Index</Button>
              </Link>
            </Card>

            {/* Supplier Network */}
            <Card className="p-8 text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Verified Suppliers</h3>
              <p className="text-neutral-600 mb-6">
                Connect with trusted suppliers, view their ratings, and request quotes directly through our platform.
              </p>
              <Link to="/buyers/search">
                <Button variant="outline" size="sm">Find Suppliers</Button>
              </Link>
            </Card>

            {/* Market Intelligence */}
            <Card className="p-8 text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Market Insights</h3>
              <p className="text-neutral-600 mb-6">
                Get trend analysis, price forecasts, and market signals to make informed purchasing decisions.
              </p>
              <Link to="/materials/price-trends">
                <Button variant="outline" size="sm">View Trends</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              For Every Construction Stakeholder
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Buyers */}
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">For Buyers & Contractors</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-2 rounded-lg mt-1">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Compare Prices</h4>
                    <p className="text-neutral-600">See current market prices across different locations and suppliers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-2 rounded-lg mt-1">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Request Quotes</h4>
                    <p className="text-neutral-600">Get competitive quotes from multiple verified suppliers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-2 rounded-lg mt-1">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Track Trends</h4>
                    <p className="text-neutral-600">Monitor price trends to time your purchases optimally</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Suppliers */}
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">For Suppliers & Retailers</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-2 rounded-lg mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">List Products</h4>
                    <p className="text-neutral-600">Showcase your materials and reach more customers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-2 rounded-lg mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Receive Quotes</h4>
                    <p className="text-neutral-600">Get quote requests directly from potential customers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-2 rounded-lg mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Build Reputation</h4>
                    <p className="text-neutral-600">Earn ratings and reviews to attract more business</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Trusted Market Data
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-neutral-600">Materials Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">200+</div>
              <div className="text-neutral-600">Verified Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">5,000+</div>
              <div className="text-neutral-600">Price Submissions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">30+</div>
              <div className="text-neutral-600">Locations Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join Rwanda's Construction Marketplace
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Access real-time pricing, connect with suppliers, and contribute to transparent market data
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/materials/price-index">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Explore Prices
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-green-600">
                  Join Now
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <PlatformFooter platform="marketplace" />
    </div>
  );
}