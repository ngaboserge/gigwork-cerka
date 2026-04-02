import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { PlatformHeader } from '@/components/layout/PlatformHeader';
import { PlatformFooter } from '@/components/layout/PlatformFooter';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function GigWorkPlatform() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-neutral-50">
      <PlatformHeader platform="gigwork" />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Work. Get Hired. 
              <span className="block text-primary-200">Build Your Career.</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Connect with employers for temporary shifts, build your reputation, and earn reliable income in Rwanda's growing gig economy.
            </p>
            
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Find Work Now
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary-600">
                    Post Jobs
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex justify-center">
                <Link to={user?.role === 'employer' ? '/employer/dashboard' : '/employee/dashboard'}>
                  <Button size="lg" variant="secondary">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              How Gig Work Platform Works
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Simple, reliable, and designed for Rwanda's workforce
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* For Workers */}
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">For Workers</h3>
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-2">Find Shifts</h4>
                      <p className="text-neutral-600">Browse available shifts in your area and apply instantly</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-2">Track Time</h4>
                      <p className="text-neutral-600">Built-in time tracking with GPS verification</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-2">Build Reputation</h4>
                      <p className="text-neutral-600">Earn ratings and unlock better opportunities</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* For Employers */}
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">For Employers</h3>
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-2">Post Shifts</h4>
                      <p className="text-neutral-600">Create shift postings with detailed requirements</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-2">Manage Applications</h4>
                      <p className="text-neutral-600">Review applications and hire the best candidates</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-2">Track Performance</h4>
                      <p className="text-neutral-600">Monitor worker performance and manage payroll</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Trusted by Rwanda's Workforce
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">1,000+</div>
              <div className="text-neutral-600">Active Workers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-neutral-600">Employers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">10,000+</div>
              <div className="text-neutral-600">Shifts Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">4.8★</div>
              <div className="text-neutral-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of workers and employers building Rwanda's gig economy
          </p>
          
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Get Started Today
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <PlatformFooter platform="gigwork" />
    </div>
  );
}