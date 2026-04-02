import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout';
import { Card, Input, Button, Badge } from '@/components/ui';
import { Search } from '@/lib/icons';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
}

const getFAQData = (t: any): FAQItem[] => [
  // GIG WORK - WORKERS
  {
    id: 'gw-1',
    category: t('helpCenter.categoryGigWorkWorkers'),
    question: t('helpCenter.faq.gw1q'),
    answer: t('helpCenter.faq.gw1a'),
    tags: ['shifts', 'apply', 'jobs', 'workers']
  },
  {
    id: 'gw-2',
    category: t('helpCenter.categoryGigWorkWorkers'),
    question: t('helpCenter.faq.gw2q'),
    answer: t('helpCenter.faq.gw2a'),
    tags: ['reliability', 'score', 'rating', 'workers']
  },
  {
    id: 'gw-3',
    category: t('helpCenter.categoryGigWorkWorkers'),
    question: t('helpCenter.faq.gw3q'),
    answer: t('helpCenter.faq.gw3a'),
    tags: ['cancel', 'shifts', 'schedule', 'workers']
  },
  {
    id: 'gw-4',
    category: t('helpCenter.categoryGigWorkWorkers'),
    question: t('helpCenter.faq.gw4q'),
    answer: t('helpCenter.faq.gw4a'),
    tags: ['clock in', 'time tracking', 'shifts', 'workers']
  },
  {
    id: 'gw-5',
    category: t('helpCenter.categoryGigWorkWorkers'),
    question: t('helpCenter.faq.gw5q'),
    answer: t('helpCenter.faq.gw5a'),
    tags: ['payment', 'salary', 'workers']
  },

  // GIG WORK - BUSINESSES
  {
    id: 'gb-1',
    category: t('helpCenter.categoryGigWorkBusinesses'),
    question: t('helpCenter.faq.gb1q'),
    answer: t('helpCenter.faq.gb1a'),
    tags: ['post shift', 'create job', 'businesses', 'employers']
  },
  {
    id: 'gb-2',
    category: t('helpCenter.categoryGigWorkBusinesses'),
    question: t('helpCenter.faq.gb2q'),
    answer: t('helpCenter.faq.gb2a'),
    tags: ['hire', 'applications', 'workers', 'businesses']
  },
  {
    id: 'gb-3',
    category: t('helpCenter.categoryGigWorkBusinesses'),
    question: t('helpCenter.faq.gb3q'),
    answer: t('helpCenter.faq.gb3a'),
    tags: ['favorites', 'repeat workers', 'businesses']
  },
  {
    id: 'gb-4',
    category: t('helpCenter.categoryGigWorkBusinesses'),
    question: t('helpCenter.faq.gb4q'),
    answer: t('helpCenter.faq.gb4a'),
    tags: ['time approval', 'hours', 'payroll', 'businesses']
  },
  {
    id: 'gb-5',
    category: t('helpCenter.categoryGigWorkBusinesses'),
    question: t('helpCenter.faq.gb5q'),
    answer: t('helpCenter.faq.gb5a'),
    tags: ['no show', 'reliability', 'businesses']
  },

  // MATERIALS MARKETPLACE - BUYERS
  {
    id: 'mb-1',
    category: t('helpCenter.categoryMarketplaceBuyers'),
    question: t('helpCenter.faq.mb1q'),
    answer: t('helpCenter.faq.mb1a'),
    tags: ['browse', 'materials', 'marketplace', 'buyers']
  },
  {
    id: 'mb-2',
    category: t('helpCenter.categoryMarketplaceBuyers'),
    question: t('helpCenter.faq.mb2q'),
    answer: t('helpCenter.faq.mb2a'),
    tags: ['quote', 'request', 'suppliers', 'buyers']
  },
  {
    id: 'mb-3',
    category: t('helpCenter.categoryMarketplaceBuyers'),
    question: t('helpCenter.faq.mb3q'),
    answer: t('helpCenter.faq.mb3a'),
    tags: ['messaging', 'contact', 'suppliers', 'buyers']
  },
  {
    id: 'mb-4',
    category: t('helpCenter.categoryMarketplaceBuyers'),
    question: t('helpCenter.faq.mb4q'),
    answer: t('helpCenter.faq.mb4a'),
    tags: ['price index', 'pricing', 'market data', 'buyers']
  },
  {
    id: 'mb-5',
    category: t('helpCenter.categoryMarketplaceBuyers'),
    question: t('helpCenter.faq.mb5q'),
    answer: t('helpCenter.faq.mb5a'),
    tags: ['verification', 'suppliers', 'trust', 'buyers']
  },

  // MATERIALS MARKETPLACE - SUPPLIERS
  {
    id: 'ms-1',
    category: t('helpCenter.categoryMarketplaceSuppliers'),
    question: t('helpCenter.faq.ms1q'),
    answer: t('helpCenter.faq.ms1a'),
    tags: ['create listing', 'sell', 'suppliers']
  },
  {
    id: 'ms-2',
    category: t('helpCenter.categoryMarketplaceSuppliers'),
    question: t('helpCenter.faq.ms3q'),
    answer: t('helpCenter.faq.ms3a'),
    tags: ['photos', 'images', 'listings', 'suppliers']
  },
  {
    id: 'ms-3',
    category: t('helpCenter.categoryMarketplaceSuppliers'),
    question: t('helpCenter.faq.ms2q'),
    answer: t('helpCenter.faq.ms2a'),
    tags: ['quotes', 'requests', 'suppliers']
  },
  {
    id: 'ms-4',
    category: t('helpCenter.categoryMarketplaceSuppliers'),
    question: t('helpCenter.faq.ms4q'),
    answer: t('helpCenter.faq.ms4a'),
    tags: ['price submission', 'price index', 'suppliers']
  },
  {
    id: 'ms-5',
    category: t('helpCenter.categoryMarketplaceSuppliers'),
    question: t('helpCenter.faq.ms5q'),
    answer: t('helpCenter.faq.ms5a'),
    tags: ['verification', 'suppliers', 'trust']
  },

  // PRICE INDEX & INTELLIGENCE
  {
    id: 'pi-1',
    category: t('helpCenter.categoryPriceIndex'),
    question: t('helpCenter.faq.pi1q'),
    answer: t('helpCenter.faq.pi1a'),
    tags: ['price index', 'market data', 'intelligence']
  },
  {
    id: 'pi-2',
    category: t('helpCenter.categoryPriceIndex'),
    question: t('helpCenter.faq.pi2q'),
    answer: t('helpCenter.faq.pi2a'),
    tags: ['charts', 'trends', 'price index', 'intelligence']
  },
  {
    id: 'pi-3',
    category: t('helpCenter.categoryPriceIndex'),
    question: t('helpCenter.faq.pi3q'),
    answer: t('helpCenter.faq.pi3a'),
    tags: ['signals', 'alerts', 'intelligence']
  },
  {
    id: 'pi-4',
    category: t('helpCenter.categoryPriceIndex'),
    question: t('helpCenter.faq.pi4q'),
    answer: t('helpCenter.faq.pi4a'),
    tags: ['accuracy', 'data quality', 'price index']
  },
  {
    id: 'pi-5',
    category: t('helpCenter.categoryPriceIndex'),
    question: t('helpCenter.faq.pi5q'),
    answer: t('helpCenter.faq.pi5a'),
    tags: ['export', 'download', 'data', 'price index']
  },

  // ACCOUNT & PROFILE
  {
    id: 'ap-1',
    category: t('helpCenter.categoryAccount'),
    question: t('helpCenter.faq.ap1q'),
    answer: t('helpCenter.faq.ap1a'),
    tags: ['register', 'signup', 'account']
  },
  {
    id: 'ap-2',
    category: t('helpCenter.categoryAccount'),
    question: t('helpCenter.faq.ap3q'),
    answer: t('helpCenter.faq.ap3a'),
    tags: ['roles', 'account', 'multiple']
  },
  {
    id: 'ap-3',
    category: t('helpCenter.categoryAccount'),
    question: t('helpCenter.faq.ap2q'),
    answer: t('helpCenter.faq.ap2a'),
    tags: ['profile photo', 'avatar', 'profile']
  },
  {
    id: 'ap-4',
    category: t('helpCenter.categoryAccount'),
    question: t('helpCenter.faq.ap4q'),
    answer: t('helpCenter.faq.ap4a'),
    tags: ['password', 'security', 'account']
  },
  {
    id: 'ap-5',
    category: t('helpCenter.categoryAccount'),
    question: t('helpCenter.faq.ap5q'),
    answer: t('helpCenter.faq.ap5a'),
    tags: ['privacy', 'profile', 'visibility']
  },

  // PAYMENTS & FEES
  {
    id: 'pf-1',
    category: t('helpCenter.categoryPayments'),
    question: t('helpCenter.faq.pf1q'),
    answer: t('helpCenter.faq.pf1a'),
    tags: ['fees', 'pricing', 'cost']
  },
  {
    id: 'pf-2',
    category: t('helpCenter.categoryPayments'),
    question: t('helpCenter.faq.pf2q'),
    answer: t('helpCenter.faq.pf2a'),
    tags: ['payments', 'transactions']
  },
  {
    id: 'pf-3',
    category: t('helpCenter.categoryPayments'),
    question: t('helpCenter.faq.pf3q'),
    answer: t('helpCenter.faq.pf3a'),
    tags: ['payment methods', 'mobile money']
  },

  // SAFETY & TRUST
  {
    id: 'st-1',
    category: t('helpCenter.categorySafety'),
    question: t('helpCenter.faq.st1q'),
    answer: t('helpCenter.faq.st1a'),
    tags: ['report', 'fraud', 'safety']
  },
  {
    id: 'st-2',
    category: t('helpCenter.categorySafety'),
    question: t('helpCenter.faq.st2q'),
    answer: t('helpCenter.faq.st2a'),
    tags: ['scams', 'safety', 'fraud']
  },
  {
    id: 'st-3',
    category: t('helpCenter.categorySafety'),
    question: t('helpCenter.faq.st3q'),
    answer: t('helpCenter.faq.st3a'),
    tags: ['verification', 'trust', 'safety']
  },
  {
    id: 'st-4',
    category: t('helpCenter.categorySafety'),
    question: t('helpCenter.faq.st4q'),
    answer: t('helpCenter.faq.st4a'),
    tags: ['ratings', 'reviews', 'trust']
  },

  // TECHNICAL SUPPORT
  {
    id: 'ts-1',
    category: t('helpCenter.categoryTechnical'),
    question: t('helpCenter.faq.ts1q'),
    answer: t('helpCenter.faq.ts1a'),
    tags: ['technical', 'loading', 'support']
  },
  {
    id: 'ts-2',
    category: t('helpCenter.categoryTechnical'),
    question: t('helpCenter.faq.ts2q'),
    answer: t('helpCenter.faq.ts2a'),
    tags: ['mobile', 'phone', 'technical']
  },
  {
    id: 'ts-3',
    category: t('helpCenter.categoryTechnical'),
    question: t('helpCenter.faq.ts3q'),
    answer: t('helpCenter.faq.ts3a'),
    tags: ['password reset', 'forgot password', 'technical']
  },
  {
    id: 'ts-4',
    category: t('helpCenter.categoryTechnical'),
    question: t('helpCenter.faq.ts4q'),
    answer: t('helpCenter.faq.ts4a'),
    tags: ['support', 'contact', 'help']
  }
];

export function HelpCenter() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqData = getFAQData(t);
  const categories = ['all', ...Array.from(new Set(faqData.map(faq => faq.category)))];

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery.length < 2 || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <Layout>
      <div className="bg-neutral-50 min-h-screen">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">{t('helpCenter.title')}</h1>
            <p className="text-xl text-blue-100 mb-8">{t('helpCenter.subtitle')}</p>
            
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder={t('helpCenter.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 text-lg bg-white text-gray-900"
              />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category === 'all' ? t('helpCenter.allTopics') : category}
                </button>
              ))}
            </div>
          </div>

          {searchQuery.length >= 2 && (
            <div className="mb-6">
              <p className="text-gray-600">
                {t('helpCenter.foundResults')} <span className="font-semibold">{filteredFAQs.length}</span> {filteredFAQs.length !== 1 ? t('helpCenter.results') : t('helpCenter.result')} {t('helpCenter.for')} "{searchQuery}"
              </p>
            </div>
          )}

          {Object.keys(groupedFAQs).length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500 mb-4">{t('helpCenter.noResults')}</p>
              <Button variant="secondary" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                {t('helpCenter.clearFilters')}
              </Button>
            </Card>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedFAQs).map(([category, faqs]) => (
                <div key={category}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{category}</h2>
                  <div className="space-y-3">
                    {faqs.map(faq => (
                      <Card 
                        key={faq.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => toggleFAQ(faq.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-blue-500 mb-2 flex items-center gap-2">
                              {faq.question}
                              {expandedFAQ === faq.id ? (
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              )}
                            </h3>
                            {expandedFAQ === faq.id && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                                <div className="flex flex-wrap gap-2 mt-4">
                                  {faq.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Card className="mt-12 p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <svg className="w-12 h-12 text-blue-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('helpCenter.stillNeedHelp')}</h3>
            <p className="text-gray-600 mb-6">
              {t('helpCenter.cantFind')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/support/new')}>
                {t('helpCenter.contactSupport')}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/home')}>
                {t('helpCenter.backToHome')}
              </Button>
            </div>
          </Card>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">50+</div>
              <div className="text-sm text-gray-600 mt-1">{t('helpCenter.helpArticles')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">24h</div>
              <div className="text-sm text-gray-600 mt-1">{t('helpCenter.responseTime')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">14</div>
              <div className="text-sm text-gray-600 mt-1">{t('helpCenter.categories')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600">100%</div>
              <div className="text-sm text-gray-600 mt-1">{t('helpCenter.freeToUse')}</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
