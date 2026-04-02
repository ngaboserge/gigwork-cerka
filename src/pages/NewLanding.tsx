import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function NewLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/assets/cerka-logo.png" alt="Cerka" className="h-8 w-auto" />
              <span className="text-xl font-bold text-neutral-900">Cerka</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
            Two Platforms.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              One Rwanda.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-neutral-600 mb-12 max-w-3xl mx-auto">
            Choose the platform that fits your needs, or access both with one account.
          </p>
        </div>
      </section>

      {/* Platform Selection */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Gig Work Platform */}
            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">Gig Work Platform</h2>
                <p className="text-lg text-neutral-600 mb-8">
                  Find flexible work or hire workers for temporary shifts across Rwanda
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-1 rounded-full mt-1">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-neutral-700">Browse and apply for shifts</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-1 rounded-full mt-1">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-neutral-700">Post jobs and hire workers</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-1 rounded-full mt-1">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-neutral-700">Time tracking & payments</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-1 rounded-full mt-1">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-neutral-700">Ratings & reputation system</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link to="/gig-work" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                    Explore Gig Work
                  </Button>
                </Link>
                <Link to="/register" className="block">
                  <Button variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50" size="lg">
                    Join as Worker/Employer
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Materials Marketplace */}
            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">Materials Marketplace</h2>
                <p className="text-lg text-neutral-600 mb-8">
                  Real-time construction material prices and trusted supplier network
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-1 rounded-full mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-neutral-700">Real-time material prices</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-1 rounded-full mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-neutral-700">Verified supplier network</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-1 rounded-full mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-neutral-700">Market trends & intelligence</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-1 rounded-full mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-neutral-700">Quote requests & listings</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link to="/marketplace" className="block">
                  <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                    Explore Marketplace
                  </Button>
                </Link>
                <Link to="/register" className="block">
                  <Button variant="outline" className="w-full border-green-300 text-green-600 hover:bg-green-50" size="lg">
                    Join as Buyer/Supplier
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* One Account CTA */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                One Account, Both Platforms
              </h3>
              <p className="text-neutral-600 mb-6">
                Create one account and access both platforms seamlessly. Switch between gig work and marketplace features anytime.
              </p>
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-neutral-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Trusted Across Rwanda
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">1,500+</div>
              <div className="text-neutral-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">200+</div>
              <div className="text-neutral-600">Verified Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-neutral-600">Shifts Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">5,000+</div>
              <div className="text-neutral-600">Price Submissions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/assets/cerka-logo.png" alt="Cerka" className="h-8 w-auto" />
                <span className="text-xl font-bold">Cerka</span>
              </div>
              <p className="text-neutral-400">
                Empowering Rwanda's workforce and construction industry through technology.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Platforms</h3>
              <ul className="space-y-2">
                <li><Link to="/gig-work" className="text-neutral-400 hover:text-white">Gig Work</Link></li>
                <li><Link to="/marketplace" className="text-neutral-400 hover:text-white">Materials Marketplace</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-neutral-400 hover:text-white">Help Center</Link></li>
                <li><Link to="/terms" className="text-neutral-400 hover:text-white">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-neutral-400 hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center">
            <p className="text-neutral-400">© 2024 Cerka. All rights reserved. Made in Rwanda 🇷🇼</p>
          </div>
        </div>
      </footer>
    </div>
  );
}