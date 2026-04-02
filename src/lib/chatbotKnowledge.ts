// Enhanced Knowledge Base for Chatbot - Uses i18n for translations
// 100% Free - No API costs

import type { TFunction } from 'i18next';

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  relatedTopics?: string[];
}

// Knowledge base factory function that uses translations
export const knowledgeBase = (t: TFunction): FAQItem[] => [
  // Use existing Help Center FAQ translations
  {
    question: t('helpCenter.faq.gw1q'),
    answer: t('helpCenter.faq.gw1a'),
    category: t('helpCenter.categoryGigWorkWorkers'),
    keywords: ['find', 'apply', 'shifts', 'jobs', 'work', 'browse', 'search', 'looking', 'available', 'shakisha', 'akazi'],
    relatedTopics: ['reliability score', 'clock in', 'payment']
  },
  {
    question: t('helpCenter.faq.gw2q'),
    answer: t('helpCenter.faq.gw2a'),
    category: t('helpCenter.categoryGigWorkWorkers'),
    keywords: ['reliability', 'score', 'rating', 'points', 'reputation', 'stars', 'performance', 'amanota', 'ukwizera'],
    relatedTopics: ['ratings', 'no show', 'cancel shift']
  },
  {
    question: t('helpCenter.faq.gw3q'),
    answer: t('helpCenter.faq.gw3a'),
    category: t('helpCenter.categoryGigWorkWorkers'),
    keywords: ['cancel', 'remove', 'delete', 'withdraw', 'quit', 'leave', 'drop', 'hagarika'],
    relatedTopics: ['reliability score', 'penalties', 'no show']
  },
  {
    question: t('helpCenter.faq.gw4q'),
    answer: t('helpCenter.faq.gw4a'),
    category: t('helpCenter.categoryGigWorkWorkers'),
    keywords: ['clock', 'time', 'tracking', 'hours', 'check in', 'check out', 'punch', 'attendance', 'injira', 'sohoka'],
    relatedTopics: ['time approval', 'payment', 'invoices']
  },
  {
    question: t('helpCenter.faq.gw5q'),
    answer: t('helpCenter.faq.gw5a'),
    category: t('helpCenter.categoryGigWorkWorkers'),
    keywords: ['payment', 'paid', 'salary', 'money', 'wage', 'pay', 'compensation', 'earnings', 'kwishyura', 'amafaranga'],
    relatedTopics: ['invoices', 'mobile money', 'bank transfer']
  },
  {
    question: t('helpCenter.faq.gb1q'),
    answer: t('helpCenter.faq.gb1a'),
    category: t('helpCenter.categoryGigWorkBusinesses'),
    keywords: ['post', 'create', 'shift', 'job', 'listing', 'hire', 'publish', 'add', 'tangaza', 'shyiraho'],
    relatedTopics: ['applications', 'hiring', 'workers']
  },
  {
    question: t('helpCenter.faq.gb2q'),
    answer: t('helpCenter.faq.gb2a'),
    category: t('helpCenter.categoryGigWorkBusinesses'),
    keywords: ['hire', 'choose', 'select', 'applications', 'workers', 'accept', 'pick', 'review', 'hitamo', 'abakozi'],
    relatedTopics: ['applications', 'reliability score', 'verification']
  },
  {
    question: t('helpCenter.faq.gb3q'),
    answer: t('helpCenter.faq.gb3a'),
    category: t('helpCenter.categoryGigWorkBusinesses'),
    keywords: ['favorites', 'repeat', 'same', 'again', 'rehire', 'regular', 'team', 'abakunda'],
    relatedTopics: ['favorites', 'team building', 'loyalty']
  },
  {
    question: t('helpCenter.faq.gb4q'),
    answer: t('helpCenter.faq.gb4a'),
    category: t('helpCenter.categoryGigWorkBusinesses'),
    keywords: ['approve', 'hours', 'time', 'payroll', 'timesheet', 'clock', 'verify', 'emeza', 'amasaha'],
    relatedTopics: ['time tracking', 'invoices', 'payment']
  },
  {
    question: t('helpCenter.faq.gb5q'),
    answer: t('helpCenter.faq.gb5a'),
    category: t('helpCenter.categoryGigWorkBusinesses'),
    keywords: ['no show', 'absent', 'didnt show', 'missing', 'late', 'unreliable', 'ntagaragaye'],
    relatedTopics: ['reliability score', 'repost', 'favorites']
  },
  {
    question: t('helpCenter.faq.mb1q'),
    answer: t('helpCenter.faq.mb1a'),
    category: t('helpCenter.categoryMarketplaceBuyers'),
    keywords: ['find', 'browse', 'materials', 'products', 'marketplace', 'search', 'buy', 'construction', 'shakisha', 'ibikoresho'],
    relatedTopics: ['sectors', 'suppliers', 'quotes']
  },
  {
    question: t('helpCenter.faq.mb2q'),
    answer: t('helpCenter.faq.mb2a'),
    category: t('helpCenter.categoryMarketplaceBuyers'),
    keywords: ['quote', 'request', 'price', 'inquiry', 'ask', 'rfq', 'quotation', 'saba', 'igiciro'],
    relatedTopics: ['suppliers', 'negotiation', 'pricing']
  },
  {
    question: t('helpCenter.faq.mb3q'),
    answer: t('helpCenter.faq.mb3a'),
    category: t('helpCenter.categoryMarketplaceBuyers'),
    keywords: ['message', 'contact', 'communicate', 'supplier', 'seller', 'chat', 'talk', 'tumira', 'vugana'],
    relatedTopics: ['messaging', 'negotiation', 'communication']
  },
  {
    question: t('helpCenter.faq.mb4q'),
    answer: t('helpCenter.faq.mb4a'),
    category: t('helpCenter.categoryMarketplaceBuyers'),
    keywords: ['fair', 'price', 'market', 'average', 'compare', 'reasonable', 'cost', 'ibiciro', 'isoko'],
    relatedTopics: ['price index', 'market data', 'comparison']
  },
  {
    question: t('helpCenter.faq.mb5q'),
    answer: t('helpCenter.faq.mb5a'),
    category: t('helpCenter.categoryMarketplaceBuyers'),
    keywords: ['verified', 'verification', 'trust', 'checkmark', 'badge', 'legitimate', 'authentic', 'byemejwe'],
    relatedTopics: ['verification', 'trust', 'safety']
  },
  {
    question: t('helpCenter.faq.ms1q'),
    answer: t('helpCenter.faq.ms1a'),
    category: t('helpCenter.categoryMarketplaceSuppliers'),
    keywords: ['create', 'listing', 'sell', 'post', 'add', 'product', 'supplier', 'kora', 'gucuruza'],
    relatedTopics: ['photos', 'pricing', 'descriptions']
  },
  {
    question: t('helpCenter.faq.ms2q'),
    answer: t('helpCenter.faq.ms2a'),
    category: t('helpCenter.categoryMarketplaceSuppliers'),
    keywords: ['quote', 'request', 'respond', 'reply', 'answer', 'rfq', 'subiza'],
    relatedTopics: ['quotes', 'pricing', 'communication']
  },
  {
    question: t('helpCenter.faq.ms3q'),
    answer: t('helpCenter.faq.ms3a'),
    category: t('helpCenter.categoryMarketplaceSuppliers'),
    keywords: ['photos', 'images', 'pictures', 'upload', 'add', 'gallery', 'amafoto', 'ohereza'],
    relatedTopics: ['listings', 'quality', 'presentation']
  },
  {
    question: t('helpCenter.faq.ms4q'),
    answer: t('helpCenter.faq.ms4a'),
    category: t('helpCenter.categoryMarketplaceSuppliers'),
    keywords: ['submit', 'price', 'index', 'contribute', 'data', 'market', 'tanga', 'ibiciro'],
    relatedTopics: ['price index', 'market data', 'visibility']
  },
  {
    question: t('helpCenter.faq.ms5q'),
    answer: t('helpCenter.faq.ms5a'),
    category: t('helpCenter.categoryMarketplaceSuppliers'),
    keywords: ['verify', 'verification', 'supplier', 'documents', 'trust', 'badge', 'kwemeza'],
    relatedTopics: ['verification', 'trust', 'credibility']
  },
  {
    question: t('helpCenter.faq.pi1q'),
    answer: t('helpCenter.faq.pi1a'),
    category: t('helpCenter.categoryPriceIndex'),
    keywords: ['price', 'index', 'market', 'data', 'economic', 'rwanda', 'intelligence', 'ibiciro', 'urutonde'],
    relatedTopics: ['market data', 'trends', 'intelligence']
  },
  {
    question: t('helpCenter.faq.pi2q'),
    answer: t('helpCenter.faq.pi2a'),
    category: t('helpCenter.categoryPriceIndex'),
    keywords: ['trends', 'charts', 'graphs', 'data', 'analysis', 'history', 'imyumvire', 'amashusho'],
    relatedTopics: ['price index', 'analytics', 'data']
  },
  {
    question: t('helpCenter.faq.pi3q'),
    answer: t('helpCenter.faq.pi3a'),
    category: t('helpCenter.categoryPriceIndex'),
    keywords: ['signals', 'alerts', 'notifications', 'market', 'changes', 'intelligence', 'ibimenyetso'],
    relatedTopics: ['intelligence', 'alerts', 'monitoring']
  },
  {
    question: t('helpCenter.faq.pi4q'),
    answer: t('helpCenter.faq.pi4a'),
    category: t('helpCenter.categoryPriceIndex'),
    keywords: ['accurate', 'accuracy', 'reliable', 'quality', 'trust', 'data', 'amakuru'],
    relatedTopics: ['data quality', 'trust', 'sources']
  },
  {
    question: t('helpCenter.faq.pi5q'),
    answer: t('helpCenter.faq.pi5a'),
    category: t('helpCenter.categoryPriceIndex'),
    keywords: ['download', 'export', 'csv', 'data', 'save', 'file', 'pakurura'],
    relatedTopics: ['data', 'analysis', 'export']
  },
  {
    question: t('helpCenter.faq.ap1q'),
    answer: t('helpCenter.faq.ap1a'),
    category: t('helpCenter.categoryAccount'),
    keywords: ['create', 'account', 'register', 'signup', 'join', 'konti', 'iyandikishe'],
    relatedTopics: ['registration', 'profile', 'verification']
  },
  {
    question: t('helpCenter.faq.ap2q'),
    answer: t('helpCenter.faq.ap2a'),
    category: t('helpCenter.categoryAccount'),
    keywords: ['photo', 'avatar', 'profile', 'picture', 'upload', 'image', 'ifoto'],
    relatedTopics: ['profile', 'verification', 'trust']
  },
  {
    question: t('helpCenter.faq.ap3q'),
    answer: t('helpCenter.faq.ap3a'),
    category: t('helpCenter.categoryAccount'),
    keywords: ['roles', 'multiple', 'account', 'different', 'inshingano'],
    relatedTopics: ['account', 'roles', 'setup']
  },
  {
    question: t('helpCenter.faq.ap4q'),
    answer: t('helpCenter.faq.ap4a'),
    category: t('helpCenter.categoryAccount'),
    keywords: ['password', 'change', 'reset', 'security', 'ijambo', 'ibanga'],
    relatedTopics: ['security', 'account', 'password']
  },
  {
    question: t('helpCenter.faq.ap5q'),
    answer: t('helpCenter.faq.ap5a'),
    category: t('helpCenter.categoryAccount'),
    keywords: ['privacy', 'visible', 'information', 'profile', 'public', 'ibanga'],
    relatedTopics: ['privacy', 'profile', 'security']
  },
  {
    question: t('helpCenter.faq.pf1q'),
    answer: t('helpCenter.faq.pf1a'),
    category: t('helpCenter.categoryPayments'),
    keywords: ['fees', 'cost', 'pricing', 'charge', 'free', 'amafaranga'],
    relatedTopics: ['pricing', 'cost', 'free']
  },
  {
    question: t('helpCenter.faq.pf2q'),
    answer: t('helpCenter.faq.pf2a'),
    category: t('helpCenter.categoryPayments'),
    keywords: ['payment', 'process', 'how', 'work', 'kwishyura'],
    relatedTopics: ['payments', 'transactions', 'process']
  },
  {
    question: t('helpCenter.faq.pf3q'),
    answer: t('helpCenter.faq.pf3a'),
    category: t('helpCenter.categoryPayments'),
    keywords: ['payment', 'methods', 'mobile money', 'mtn', 'airtel', 'bank', 'cash', 'uburyo'],
    relatedTopics: ['mobile money', 'payment', 'methods']
  },
  {
    question: t('helpCenter.faq.st1q'),
    answer: t('helpCenter.faq.st1a'),
    category: t('helpCenter.categorySafety'),
    keywords: ['report', 'fraud', 'scam', 'suspicious', 'problem', 'tanga', 'raporo'],
    relatedTopics: ['safety', 'fraud', 'reporting']
  },
  {
    question: t('helpCenter.faq.st2q'),
    answer: t('helpCenter.faq.st2a'),
    category: t('helpCenter.categorySafety'),
    keywords: ['scam', 'outside', 'payment', 'suspicious', 'fraud', 'uburiganya'],
    relatedTopics: ['safety', 'scams', 'fraud']
  },
  {
    question: t('helpCenter.faq.st3q'),
    answer: t('helpCenter.faq.st3a'),
    category: t('helpCenter.categorySafety'),
    keywords: ['verification', 'verify', 'trust', 'identity', 'kwemeza'],
    relatedTopics: ['verification', 'trust', 'safety']
  },
  {
    question: t('helpCenter.faq.st4q'),
    answer: t('helpCenter.faq.st4a'),
    category: t('helpCenter.categorySafety'),
    keywords: ['ratings', 'reviews', 'feedback', 'trust', 'amanota'],
    relatedTopics: ['ratings', 'reviews', 'trust']
  },
  {
    question: t('helpCenter.faq.ts1q'),
    answer: t('helpCenter.faq.ts1a'),
    category: t('helpCenter.categoryTechnical'),
    keywords: ['loading', 'problem', 'error', 'technical', 'not working', 'ikibazo'],
    relatedTopics: ['technical', 'support', 'troubleshooting']
  },
  {
    question: t('helpCenter.faq.ts2q'),
    answer: t('helpCenter.faq.ts2a'),
    category: t('helpCenter.categoryTechnical'),
    keywords: ['mobile', 'phone', 'responsive', 'app', 'telefoni'],
    relatedTopics: ['mobile', 'technical', 'access']
  },
  {
    question: t('helpCenter.faq.ts3q'),
    answer: t('helpCenter.faq.ts3a'),
    category: t('helpCenter.categoryTechnical'),
    keywords: ['password', 'forgot', 'reset', 'recover', 'wibagiwe', 'ijambo'],
    relatedTopics: ['password', 'account', 'recovery']
  },
  {
    question: t('helpCenter.faq.ts4q'),
    answer: t('helpCenter.faq.ts4a'),
    category: t('helpCenter.categoryTechnical'),
    keywords: ['support', 'contact', 'help', 'customer', 'ubufasha', 'vugana'],
    relatedTopics: ['support', 'contact', 'help']
  }
];

// Quick action suggestions - now using translations
export const getQuickActions = (t: TFunction) => [
  { text: t('chatbotKnowledge.quickActions.findShifts'), query: 'find shifts' },
  { text: t('chatbotKnowledge.quickActions.postShift'), query: 'post shift' },
  { text: t('chatbotKnowledge.quickActions.browseMaterials'), query: 'find materials' },
  { text: t('chatbotKnowledge.quickActions.priceIndex'), query: 'price index' },
  { text: t('chatbotKnowledge.quickActions.getVerified'), query: 'verification' },
  { text: t('chatbotKnowledge.quickActions.contactSupport'), query: 'contact support' }
];
