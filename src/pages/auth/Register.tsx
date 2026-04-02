import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store';
import { Users, Building } from '@/lib/icons';

export function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { register, error: authError, clearError } = useAuthStore();
  const [role, setRole] = useState<'worker' | 'employer'>(
    (searchParams.get('role') as 'worker' | 'employer') || 'worker'
  );
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordsDoNotMatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('register.passwordTooShort'));
      return;
    }

    setLoading(true);
    setError('');
    clearError();

    const result = await register({
      email: formData.email,
      password: formData.password,
      role: role,
      name: formData.name,
      companyName: formData.companyName,
    });

    if (result.success) {
      const dashboardPath = role === 'employer' ? '/employer/dashboard' : '/employee/dashboard';
      navigate(dashboardPath);
    } else {
      setError(result.error || 'Registration failed');
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
            <p className="text-neutral-600">{t('register.createYourAccount')}</p>
          </div>

          {/* Platform Info Banner */}
          <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl animate-fadeIn">
            <p className="text-sm font-semibold text-neutral-900 mb-2">{t('register.oneAccountForEverything')}</p>
            <div className="text-xs text-neutral-700 space-y-1">
              <p>• {t('register.gigWorkBenefit')}</p>
              <p>• {t('register.marketplaceBenefit')}</p>
            </div>
          </div>

          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-neutral-900 mb-3">
              {t('register.registeringAs')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('worker')}
                className={`
                  relative p-4 rounded-xl border-2 transition-all text-left
                  ${role === 'worker' 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
                  }
                `}
              >
                {role === 'worker' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="mb-2">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
                <div className="font-semibold text-sm text-neutral-900 mb-1">{t('register.workerIndividual')}</div>
                <div className="text-xs text-neutral-600">{t('register.workerDesc')}</div>
              </button>
              
              <button
                type="button"
                onClick={() => setRole('employer')}
                className={`
                  relative p-4 rounded-xl border-2 transition-all text-left
                  ${role === 'employer' 
                    ? 'border-green-500 bg-green-50 shadow-md' 
                    : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
                  }
                `}
              >
                {role === 'employer' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="mb-2">
                  <Building className="w-7 h-7 text-green-600" />
                </div>
                <div className="font-semibold text-sm text-neutral-900 mb-1">{t('register.businessCompany')}</div>
                <div className="text-xs text-neutral-600">{t('register.businessDesc')}</div>
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-3">
              {t('register.roleNote')}
            </p>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('register.fullName')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('register.fullNamePlaceholder')}
              required
            />
            {role === 'employer' && (
              <div className="animate-fadeIn">
                <Input
                  label={t('register.companyName')}
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder={t('register.companyNamePlaceholder')}
                  required
                />
              </div>
            )}
            <Input
              label={t('register.email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t('register.emailPlaceholder')}
              required
            />
            <Input
              label={t('register.password')}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={t('register.createPassword')}
              required
            />
            <Input
              label={t('register.confirmPassword')}
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder={t('register.confirmPasswordPlaceholder')}
              required
            />
            <Button 
              type="submit" 
              fullWidth
              size="lg"
              loading={loading}
              className="mt-6"
            >
              {t('register.createAccountButton')}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-600">
              {t('register.alreadyHaveAccount')}{' '}
              <Link 
                to="/login" 
                className="text-primary-700 hover:text-primary-800 font-semibold transition-colors"
              >
                {t('register.signIn')}
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
              {t('common.backToHome')}
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
              {t('register.joinMarketplace')}
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{t('register.quickSetup')}</h3>
                  <p className="text-green-100">{t('register.quickSetupDesc')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{t('register.secureAndTrusted')}</h3>
                  <p className="text-green-100">{t('register.secureDesc')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{t('register.joinThousands')}</h3>
                  <p className="text-green-100">{t('register.joinThousandsDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
