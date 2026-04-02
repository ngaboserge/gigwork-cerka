import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout';
import { Button, AnimatedCard } from '@/components/ui';
import { Briefcase, Building, Leaf, Food, Smartphone, Car, Home, Tool, Cube, Lightning, Users } from '@/lib/icons';

export function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  return (
    <Layout>
      {/* Unique Hero Section - Split Design */}
      <section className="relative bg-white overflow-hidden">
        {/* Diagonal Split Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700" 
               style={{ clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0 80%)' }} />
          <div className="absolute inset-0 bg-gradient-to-tr from-green-50 to-blue-50" 
               style={{ clipPath: 'polygon(0 80%, 100% 60%, 100% 100%, 0 100%)' }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Main Headline - Left Aligned */}
          <div className="max-w-2xl mb-16 animate-fadeInDown">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="text-white font-semibold text-sm">{t('landing.madeForRwanda')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t('landing.heroTitle')}
            </h1>
            <p className="text-xl text-blue-50 mb-8">
              {t('landing.heroSubtitle')}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/register')}
                className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 shadow-xl hover:shadow-2xl font-bold px-8 border-2 border-yellow-500"
              >
                {t('landing.startNowFree')}
              </Button>
              <Button 
                size="lg" 
                onClick={() => navigate('/login')}
                className="bg-white/10 text-white border-2 border-white/40 hover:bg-white/20 backdrop-blur-sm font-semibold"
              >
                {t('landing.signIn')}
              </Button>
            </div>
          </div>
          
          {/* Two-Column Cards - Asymmetric Layout */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Workers Card - Takes 2 columns */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8 border-l-4 border-blue-600 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-neutral-900 mb-1">{t('landing.workers')}</h3>
                  <p className="text-sm text-neutral-600">{t('landing.workersDesc')}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-neutral-700">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">→</span>
                  <span>{t('landing.workersApply')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">→</span>
                  <span>{t('landing.workersShop')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">→</span>
                  <span>{t('landing.workersPrices')}</span>
                </div>
              </div>
            </div>
            
            {/* Business Card - Takes 3 columns */}
            <div className="lg:col-span-3 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-xl p-8 text-white animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">{t('landing.businesses')}</h3>
                  <p className="text-sm text-green-100">{t('landing.businessesDesc')}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">→</span>
                    <span>{t('landing.businessesHire')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">→</span>
                    <span>{t('landing.businessesList')}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">→</span>
                    <span>{t('landing.businessesSell')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">→</span>
                    <span>{t('landing.businessesManage')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Categories Grid - Modern Cards */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">{t('landing.popularCategories')}</h2>
            <p className="text-lg text-neutral-600">{t('landing.exploreAvailable')}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {[
              { icon: <Briefcase className="w-8 h-8" />, name: t('landing.gigWork'), route: '/employee/jobs', color: 'blue' },
              { icon: <Building className="w-8 h-8" />, name: t('landing.construction'), route: '/marketplace/construction', color: 'orange' },
              { icon: <Leaf className="w-8 h-8" />, name: t('landing.agriculture'), route: '/marketplace/agriculture', color: 'green' },
              { icon: <Food className="w-8 h-8" />, name: t('landing.food'), route: '/marketplace/food', color: 'yellow' },
              { icon: <Smartphone className="w-8 h-8" />, name: t('landing.electronics'), route: '/marketplace/electronics', color: 'purple' },
              { icon: <Car className="w-8 h-8" />, name: t('landing.vehicles'), route: '/marketplace/vehicles', color: 'red' },
              { icon: <Home className="w-8 h-8" />, name: t('landing.rentals'), route: '/marketplace/rentals', color: 'indigo' },
              { icon: <Tool className="w-8 h-8" />, name: t('landing.services'), route: '/marketplace/services', color: 'teal' },
              { icon: <Cube className="w-8 h-8" />, name: t('landing.livestock'), route: '/marketplace/livestock', color: 'amber' },
              { icon: <Lightning className="w-8 h-8" />, name: t('landing.energy'), route: '/marketplace/energy', color: 'yellow' }
            ].map((cat, index) => (
              <AnimatedCard
                key={cat.name}
                hover="lift"
                animation="fadeInUp"
                delay={index * 50}
                onClick={() => navigate(cat.route)}
                className="p-6 text-center cursor-pointer group"
              >
                <div className="text-neutral-700 group-hover:text-blue-600 transition-colors mb-3 flex justify-center transform group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <p className="text-sm font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">{cat.name}</p>
              </AnimatedCard>
            ))}
          </div>
          
          <div className="text-center mt-10 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
            <Button variant="secondary" size="lg" onClick={() => navigate('/marketplace/categories')}>
              {t('landing.viewAll14Categories')}
            </Button>
          </div>
        </div>
      </section>

      {/* Gig Work Use Cases */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">{t('landing.gigWorkWhoUses')}</h2>
            <p className="text-neutral-600">{t('landing.industriesFlexibleStaffing')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border border-neutral-200">
              <h3 className="font-bold text-lg text-neutral-900 mb-2">{t('landing.warehouses')}</h3>
              <p className="text-neutral-600 text-sm mb-4">{t('landing.warehousesDesc')}</p>
              <div className="text-xs text-neutral-500">{t('landing.warehousesRoles')}</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-neutral-200">
              <h3 className="font-bold text-lg text-neutral-900 mb-2">{t('landing.events')}</h3>
              <p className="text-neutral-600 text-sm mb-4">{t('landing.eventsDesc')}</p>
              <div className="text-xs text-neutral-500">{t('landing.eventsRoles')}</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-neutral-200">
              <h3 className="font-bold text-lg text-neutral-900 mb-2">{t('landing.hospitality')}</h3>
              <p className="text-neutral-600 text-sm mb-4">{t('landing.hospitalityDesc')}</p>
              <div className="text-xs text-neutral-500">{t('landing.hospitalityRoles')}</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-neutral-200">
              <h3 className="font-bold text-lg text-neutral-900 mb-2">{t('landing.industrial')}</h3>
              <p className="text-neutral-600 text-sm mb-4">{t('landing.industrialDesc')}</p>
              <div className="text-xs text-neutral-500">{t('landing.industrialRoles')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Materials Use Cases */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">{t('landing.materialsWhatFind')}</h2>
            <p className="text-neutral-600">{t('landing.constructionMaterialsPricing')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-bold text-lg text-neutral-900 mb-2">{t('landing.cementConcrete')}</h3>
              <p className="text-neutral-600 text-sm mb-4">{t('landing.cementDesc')}</p>
              <div className="text-xs text-green-700">{t('landing.cementTypes')}</div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-bold text-lg text-neutral-900 mb-2">{t('landing.steelIron')}</h3>
              <p className="text-neutral-600 text-sm mb-4">{t('landing.steelDesc')}</p>
              <div className="text-xs text-green-700">{t('landing.steelTypes')}</div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-bold text-lg text-neutral-900 mb-2">{t('landing.aggregates')}</h3>
              <p className="text-neutral-600 text-sm mb-4">{t('landing.aggregatesDesc')}</p>
              <div className="text-xs text-green-700">{t('landing.aggregatesTypes')}</div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-bold text-lg text-neutral-900 mb-2">{t('landing.timberBlocks')}</h3>
              <p className="text-neutral-600 text-sm mb-4">{t('landing.timberDesc')}</p>
              <div className="text-xs text-green-700">{t('landing.timberTypes')}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="lg:sticky lg:top-8">
                <h2 className="text-3xl font-bold text-neutral-900 mb-6">{t('landing.forBusinesses')}</h2>
                <p className="text-lg text-neutral-600 mb-8">
                  {t('landing.businessesIntro')}
                </p>
                <Link to="/register?role=employer">
                  <Button size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 font-bold border-2 border-yellow-500 shadow-lg">{t('landing.postShift')}</Button>
                </Link>
              </div>
            </div>
            <div className="space-y-8">
              <div className="border-l-4 border-blue-600 pl-6">
                <h3 className="font-bold text-xl text-neutral-900 mb-2">{t('landing.bulkShiftCapacity')}</h3>
                <p className="text-neutral-600">{t('landing.bulkShiftDesc')}</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-6">
                <h3 className="font-bold text-xl text-neutral-900 mb-2">{t('landing.transparentProfiles')}</h3>
                <p className="text-neutral-600">{t('landing.transparentProfilesDesc')}</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-6">
                <h3 className="font-bold text-xl text-neutral-900 mb-2">{t('landing.trackHours')}</h3>
                <p className="text-neutral-600">{t('landing.trackHoursDesc')}</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-6">
                <h3 className="font-bold text-xl text-neutral-900 mb-2">{t('landing.payCompleted')}</h3>
                <p className="text-neutral-600">{t('landing.payCompletedDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reliability Trust Strip */}
      <section className="bg-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-neutral-900">{t('landing.builtForReliability')}</h3>
                <p className="text-neutral-600 text-sm">{t('landing.reliabilityDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-6">{t('landing.forWorkers')}</h2>
            <p className="text-xl text-blue-50 mb-12">{t('landing.workersIntro')}</p>
            <div className="grid sm:grid-cols-2 gap-8 mb-12">
              <div>
                <div className="text-4xl font-bold mb-2">{t('landing.choose')}</div>
                <p className="text-blue-50">{t('landing.chooseDesc')}</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">{t('landing.work')}</div>
                <p className="text-blue-50">{t('landing.workDesc')}</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">{t('landing.earn')}</div>
                <p className="text-blue-50">{t('landing.earnDesc')}</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">{t('landing.grow')}</div>
                <p className="text-blue-50">{t('landing.growDesc')}</p>
              </div>
            </div>
            <Link to="/register?role=employee">
              <button className="inline-flex items-center justify-center font-medium transition-colors duration-150 px-6 py-3 text-base bg-yellow-400 text-blue-900 hover:bg-yellow-300 font-bold rounded border-2 border-yellow-500 shadow-lg">
                {t('landing.findShifts')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* What This Is NOT Section */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-neutral-200">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">{t('landing.whatCerkaIsNot')}</h3>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <p className="text-neutral-700">{t('landing.notEmploymentAgency')}</p>
              </div>
              <div>
                <p className="text-neutral-700">{t('landing.notLongTermHiring')}</p>
              </div>
              <div>
                <p className="text-neutral-700">{t('landing.notRecruitmentFirm')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 text-white rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl font-bold mb-4">{t('landing.importantClarification')}</h3>
            <p className="text-blue-50 text-lg leading-relaxed">
              {t('landing.clarificationText')}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-neutral-900 mb-6">{t('landing.readyToTry')}</h2>
          <p className="text-xl text-neutral-600 mb-10">{t('landing.readyToTryDesc')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=employer">
              <Button size="lg" className="w-full sm:w-auto bg-yellow-400 text-blue-900 hover:bg-yellow-300 font-bold border-2 border-yellow-500 shadow-lg">{t('landing.postShift')}</Button>
            </Link>
            <Link to="/register?role=employee">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">{t('landing.browseShifts')}</Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
