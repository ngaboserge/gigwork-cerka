import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store';

export function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { login, error: authError, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    clearError();

    const result = await login(email, password);
    
    if (result.success) {
      const redirectTo = searchParams.get('redirect');
      
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate('/home');
      }
    } else {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-md animate-fadeInUp">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <img 
                src="/assets/cerka-logo.png" 
                alt="Cerka" 
                className="h-12 w-auto mx-auto mb-4"
              />
            </Link>
            <p className="text-neutral-600">{t('login.welcomeBack')}</p>
          </div>

          {/* Error Message */}
          {(error || authError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-fadeIn">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error || authError}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={t('login.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('login.emailPlaceholder')}
              required
              className="transition-all"
            />
            <Input
              label={t('login.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.passwordPlaceholder')}
              required
              className="transition-all"
            />
            
            <Button 
              type="submit" 
              fullWidth
              size="lg"
              loading={loading}
              className="mt-6"
            >
              {t('login.signInButton')}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-600">
              {t('login.noAccount')}{' '}
              <Link 
                to="/register" 
                className="text-primary-700 hover:text-primary-800 font-semibold transition-colors"
              >
                {t('login.createOne')}
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link 
              to="/" 
              className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('login.backToHome')}
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration/Info */}
      <div className="hidden lg:flex lg:flex-1 bg-blue-600 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="relative flex items-center justify-center p-12 text-white">
          <div className="max-w-lg animate-fadeInRight">
            <h2 className="text-4xl font-bold mb-6">
              {t('login.accessEverything')}
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{t('login.gigWorkFeature')}</h3>
                  <p className="text-blue-100">{t('login.gigWorkDesc')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{t('login.marketplaceFeature')}</h3>
                  <p className="text-blue-100">{t('login.marketplaceDesc')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{t('login.intelligenceFeature')}</h3>
                  <p className="text-blue-100">{t('login.intelligenceDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
