import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', label: 'EN' },
    { code: 'rw', name: 'Kinyarwanda', label: 'RW' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    setShowMenu(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-neutral-700 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors border border-neutral-300 hover:border-primary-500"
        title={t('common.language')}
      >
        <span className="text-base">{currentLanguage.label}</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeInDown">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                i18n.language === lang.code
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base font-bold">{lang.label}</span>
                <span>{lang.name}</span>
              </div>
              {i18n.language === lang.code && (
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
